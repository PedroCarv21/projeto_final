import BaseModel from "./BaseModel.js";
import db from "../db/database.js";
import bcrypt from "bcrypt";
import config from "../config/config.js";

export const StatusCliente = {
  ATIVO: "Ativo",
  INATIVO: "Inativo",
  BLOQUEADO: "Bloqueado",
  SUSPENSO: "Suspenso",
};

class ClienteModel extends BaseModel {
  static tabela = "cliente";
  static SALT_ROUNDS = config.security.bcryptSaltRounds;

  constructor(
    id,
    nome,
    email,
    senha,
    cpf,
    endereco,
    dataNascimento,
    fotoPerfil,
    statusCliente
  ) {
    super(id, nome, email, senha, cpf, endereco, dataNascimento, fotoPerfil);
    this.statusCliente = statusCliente;
  }

  /**
   * Converte foto BLOB para Base64
   */
  static converterFotoParaBase64(fotoBuffer) {
    if (!fotoBuffer) return null;
    return `data:image/jpeg;base64,${fotoBuffer.toString("base64")}`;
  }

  /**
   * Formata o cliente para retorno (converte foto BLOB para base64)
   */
  static formatarCliente(cliente) {
    if (!cliente) return null;

    return {
      ...cliente,
      fotoPerfil: this.converterFotoParaBase64(
        cliente.foto_perfil || cliente.fotoPerfil
      ),
      senha: undefined, // Nunca retornar a senha
    };
  }

  static async criar(dados) {
    const { nome, email, senha, cpf, endereco, dataNascimento, fotoPerfil, telefone, } =
      dados;

    // Validação de campos obrigatórios
    this.validarCamposObrigatorios(dados, ["nome", "email", "senha", "cpf", "telefone",]);

    const id = this.gerarId();
    const statusPadrao = StatusCliente.ATIVO;
    const senhaHash = await bcrypt.hash(senha, this.SALT_ROUNDS);

    const sql = `
    INSERT INTO ${this.tabela} 
      (id, nome, email, senha, cpf, endereco, data_nascimento, telefone, foto_perfil, status_cliente) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    const values = [
      id,
      nome,
      email,
      senhaHash,
      cpf,
      endereco,
      dataNascimento,
      telefone,
      fotoPerfil || null, // BLOB ou null
      statusPadrao,
    ];

    await db.query(sql, values);

    return {
      id,
      nome,
      email,
      cpf,
      endereco,
      dataNascimento,
      telefone,
      fotoPerfil: this.converterFotoParaBase64(fotoPerfil),
      statusCliente: statusPadrao,
    };
  }

  static async atualizar(id, dadosParaAtualizar) {
    // Criptografa a senha se ela estiver sendo atualizada
    if (dadosParaAtualizar.senha) {
      dadosParaAtualizar.senha = await bcrypt.hash(
        dadosParaAtualizar.senha,
        this.SALT_ROUNDS
      );
    }

    const campos = Object.keys(dadosParaAtualizar);

    if (campos.length === 0) {
      throw new Error("Nenhum dado fornecido para atualização.");
    }

    const setClause = campos
      .map((campo) => {
        const nomeColuna = this.converterCampoParaColuna(campo);
        return `${nomeColuna}=?`;
      })
      .join(", ");

    const values = Object.values(dadosParaAtualizar);
    values.push(id);

    const sql = `UPDATE ${this.tabela} SET ${setClause} WHERE id=?`;

    const [result] = await db.query(sql, values);

    if (result.affectedRows === 0) {
      throw new Error("Cliente não encontrado");
    }

    return await this.buscarPorId(id);
  }

  static async desativar(email, senha) {
    // Buscar o cliente no banco de dados usando apenas o email
    const sqlBusca = `SELECT * FROM ${this.tabela} WHERE email = ?`;
    const [rows] = await db.query(sqlBusca, [email]);

    if (rows.length === 0) {
      throw new Error("Cliente não encontrado ou credenciais inválidas");
    }

    const cliente = rows[0];
    const senhaHashDoBanco = cliente.senha;

    // Comparar a senha fornecida com o hash do banco
    const senhaCorreta = await bcrypt.compare(senha, senhaHashDoBanco);

    if (!senhaCorreta) {
      throw new Error("Cliente não encontrado ou credenciais inválidas");
    }

    // Desativar o cliente
    const statusInativo = StatusCliente.INATIVO;
    const sqlUpdate = `UPDATE ${this.tabela} SET status_cliente = ? WHERE email = ?`;

    await db.query(sqlUpdate, [statusInativo, email]);

    return { message: "Cliente desativado com sucesso" };
  }

  /**
   * Desativa um cliente pelo ID (sem necessidade de senha)
   */
  static async desativarPorId(id) {
    // Buscar o cliente no banco de dados
    const sqlBusca = `SELECT * FROM ${this.tabela} WHERE id = ?`;
    const [rows] = await db.query(sqlBusca, [id]);

    if (rows.length === 0) {
      throw new Error("Cliente não encontrado");
    }

    const cliente = rows[0];

    // Verificar se o cliente já está inativo
    if (cliente.status_cliente === StatusCliente.INATIVO) {
      throw new Error("Cliente já está inativo");
    }

    // Desativar o cliente
    const sqlUpdate = `UPDATE ${this.tabela} SET status_cliente = ? WHERE id = ?`;
    await db.query(sqlUpdate, [StatusCliente.INATIVO, id]);

    return { message: "Cliente desativado com sucesso" };
  }

  static async alterarSenha(id, senhaAtual, novaSenha) {
    // Buscar o cliente no banco de dados
    const sqlBusca = `SELECT * FROM ${this.tabela} WHERE id = ?`;
    const [rows] = await db.query(sqlBusca, [id]);

    if (rows.length === 0) {
      throw new Error("Cliente não encontrado");
    }

    const cliente = rows[0];

    // Verificar se o cliente está ativo
    if (cliente.status_cliente !== StatusCliente.ATIVO) {
      throw new Error("Cliente não está ativo");
    }

    // Comparar a senha atual fornecida com o hash do banco
    const senhaCorreta = await bcrypt.compare(senhaAtual, cliente.senha);

    if (!senhaCorreta) {
      throw new Error("Senha atual incorreta");
    }

    // Validar que a nova senha é diferente da atual
    const senhaIgual = await bcrypt.compare(novaSenha, cliente.senha);
    if (senhaIgual) {
      throw new Error("A nova senha deve ser diferente da senha atual");
    }

    // Criptografar a nova senha
    const novaSenhaHash = await bcrypt.hash(novaSenha, this.SALT_ROUNDS);

    // Atualizar a senha no banco
    const sqlUpdate = `UPDATE ${this.tabela} SET senha = ? WHERE id = ?`;
    await db.query(sqlUpdate, [novaSenhaHash, id]);

    return { message: "Senha alterada com sucesso" };
  }

  static async buscarPorEmail(email) {
    return await db.query(`SELECT * FROM ${this.tabela} WHERE email = ?`, [
      email,
    ]);
  }

  static async buscarPorId(id) {
    const cliente = await super.buscarPorId(id);
    return this.formatarCliente(cliente);
  }

  static async buscarTodos() {
    const clientes = await super.buscarTodos();
    return clientes.map((cliente) => this.formatarCliente(cliente));
  }
}

export default ClienteModel;

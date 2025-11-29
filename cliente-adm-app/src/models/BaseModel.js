import db from "../db/database.js";
import { v4 as uuidv4 } from "uuid";

class BaseModel {
  static tabela = "";

  constructor(
    id,
    nome,
    email,
    senha,
    cpf,
    endereco,
    dataNascimento,
    fotoPerfil
  ) {
    this.id = id;
    this.nome = nome;
    this.email = email;
    this.senha = senha;
    this.cpf = cpf;
    this.endereco = endereco;
    this.dataNascimento = dataNascimento;
    this.fotoPerfil = fotoPerfil;
  }

  static converterColunaParaCampo(obj) {
    const novoObj = {};
    for (const [chave, valor] of Object.entries(obj)) {
      const novaCampo = chave.replace(/_([a-z])/g, (_, letra) =>
        letra.toUpperCase()
      );
      novoObj[novaCampo] = valor;
    }
    return novoObj;
  }

  static async buscarTodos() {
    console.log("Buscando todos os registros da tabela:", this.tabela);
    const [rows] = await db.query(`SELECT * FROM ${this.tabela}`);

    // Converte cada registro para camelCase e foto_perfil para Base64
    return rows.map((registro) => {
      if (registro.foto_perfil) {
        registro.foto_perfil = registro.foto_perfil.toString("base64");
      }
      // Remove a senha do retorno por segurança
      delete registro.senha;
      return this.converterColunaParaCampo(registro);
    });
  }

  static async buscarPorId(id) {
    const [rows] = await db.query(`SELECT * FROM ${this.tabela} WHERE id = ?`, [
      id,
    ]);

    if (rows.length > 0) {
      let registro = rows[0];

      // Converte a foto_perfil para Base64
      if (registro.foto_perfil) {
        registro.foto_perfil = registro.foto_perfil.toString("base64");
      }

      // Remove a senha do retorno por segurança
      delete registro.senha;

      return this.converterColunaParaCampo(registro);
    } else {
      throw new Error("Registro não encontrado");
    }
  }

  static gerarId() {
    return uuidv4();
  }

  static validarCamposObrigatorios(dados, camposObrigatorios) {
    const camposFaltando = camposObrigatorios.filter((campo) => !dados[campo]);
    if (camposFaltando.length > 0) {
      throw new Error(
        `Campos obrigatórios não informados: ${camposFaltando.join(", ")}`
      );
    }
  }

  static converterCampoParaColuna(campo) {
    return campo.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
  }
}

export default BaseModel;

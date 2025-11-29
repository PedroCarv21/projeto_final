// --- 1. CONFIGURAÇÃO INICIAL ---
require('dotenv').config();
const express = require('express');
const db = require('./db'); // Importa a conexão com o banco
const { v4: uuidv4 } = require('uuid'); // Importa a função para gerar IDs únicos

const app = express();
const port = process.env.PORT || 3002;

// Middleware para interpretar o corpo das requisições como JSON
app.use(express.json());

// --- 2. DEFINIÇÃO DAS ROTAS DA API ---

// Rota para LER TODAS as reservas
app.get('/api/reserva', async (req, res) => {
  try {
    const query = `
      SELECT r.*, h.nome, h.email 
      FROM Reserva r 
      JOIN Hospede h ON r.idHospede = h.idHospede
    `;
    const [reservas] = await db.execute(query);
    res.status(200).json(reservas);
  } catch (error) {
    console.error('Erro ao buscar reservas:', error);
    res.status(500).json({ message: 'Erro ao buscar dados das reservas.' });
  }
});

// Rota para LER UMA reserva específica pelo ID
app.get('/api/reserva/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const query = `
      SELECT r.*, h.nome, h.email, h.telefone 
      FROM Reserva r 
      JOIN Hospede h ON r.idHospede = h.idHospede 
      WHERE r.idReserva = ?
    `;
    const [rows] = await db.execute(query, [id]);

    if (rows.length > 0) {
      res.status(200).json(rows[0]);
    } else {
      res.status(404).json({ message: 'Reserva não encontrada.' });
    }
  } catch (error) {
    console.error('Erro ao buscar reserva:', error);
    res.status(500).json({ message: 'Erro ao buscar dados da reserva.' });
  }
});

// Rota para CRIAR uma nova reserva
app.post('/api/reserva', async (req, res) => {
  let connection;
  try {
    const { reserva, hospede } = req.body;

    if (!reserva || !hospede) {
      return res.status(400).json({ message: 'Dados da reserva ou do hóspede faltando.' });
    }

    connection = await db.getConnection();
    await connection.beginTransaction();

    const idHospede = uuidv4();
    const nomeCompleto = `${hospede.nome} ${hospede.sobrenome}`;
    const hospedeQuery = `
      INSERT INTO Hospede (idHospede, nome, CPF, email, dataNascimento, telefone) 
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    await connection.execute(hospedeQuery, [idHospede, nomeCompleto, hospede.cpf, hospede.email, hospede.dataNascimento, hospede.telefone]);

    const idReserva = uuidv4();
    const reservaQuery = `
      INSERT INTO Reserva (idReserva, dataEntrada, dataSaida, status, idQuarto, idCliente, precoTotal, quantidadeHospedes, quantidadeDiarias, idHospede) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    await connection.execute(reservaQuery, [
      idReserva,
      reserva.dataEntrada,
      reserva.dataSaida,
      process.env.DEFAULT_RESERVATION_STATUS || 'Pendente',
      reserva.idQuarto,
      reserva.idCliente,
      reserva.precoTotal,
      hospede.quantidadeHospedes,
      reserva.quantidadeDiarias,
      idHospede
    ]);

    await connection.commit();
    res.status(201).json({ message: 'Reserva criada com sucesso!', idReserva: idReserva });

  } catch (error) {
    if (connection) {
      await connection.rollback();
    }
    console.error('Erro ao criar reserva:', error);
    res.status(500).json({ message: 'Erro ao criar a reserva.' });
  } finally {
    if (connection) {
      connection.release();
    }
  }
});

// Rota para ATUALIZAR uma reserva existente
app.put('/api/reserva/:id', async (req, res) => {
  try {
    const { id } = req.params; // Pega o ID da reserva a ser atualizada
    const camposParaAtualizar = req.body; // Pega os dados enviados no corpo da requisição

    // Validação simples para garantir que pelo menos um campo foi enviado para atualização
    if (Object.keys(camposParaAtualizar).length === 0) {
      return res.status(400).json({ message: 'Nenhum campo fornecido para atualização.' });
    }

    // Monta a query SQL dinamicamente para atualizar apenas os campos fornecidos
    // Ex: SET `dataEntrada` = ?, `precoTotal` = ?
    const setClause = Object.keys(camposParaAtualizar)
      .map(key => `\`${key}\` = ?`)
      .join(', ');

    // Pega os valores na mesma ordem dos campos
    const values = Object.values(camposParaAtualizar);

    // Adiciona o ID da reserva ao final do array de valores para o WHERE
    values.push(id);

    const query = `UPDATE Reserva SET ${setClause} WHERE idReserva = ?`;

    // Executa a query no banco de dados
    const [result] = await db.execute(query, values);

    // Verifica se alguma linha foi de fato alterada
    if (result.affectedRows > 0) {
      res.status(200).json({ message: 'Reserva atualizada com sucesso!' });
    } else {
      // Se nenhuma linha foi afetada, significa que a reserva com aquele ID não foi encontrada
      res.status(404).json({ message: 'Reserva não encontrada.' });
    }
  } catch (error) {
    console.error('Erro ao atualizar reserva:', error);
    res.status(500).json({ message: 'Erro ao atualizar a reserva.' });
  }
});

// Rota para ATUALIZAR um hóspede existente
app.put('/api/hospede/:id', async (req, res) => {
  try {
    const { id } = req.params; // Pega o ID do hóspede a ser atualizado
    const camposParaAtualizar = req.body; // Pega os dados enviados no corpo

    // Validação
    if (Object.keys(camposParaAtualizar).length === 0) {
      return res.status(400).json({ message: 'Nenhum campo fornecido para atualização.' });
    }

    // Monta a query SQL dinamicamente para a tabela Hospede
    const setClause = Object.keys(camposParaAtualizar)
      .map(key => `\`${key}\` = ?`)
      .join(', ');

    const values = Object.values(camposParaAtualizar);
    values.push(id); // Adiciona o ID para a cláusula WHERE

    const query = `UPDATE Hospede SET ${setClause} WHERE idHospede = ?`;

    // Executa a query
    const [result] = await db.execute(query, values);

    // Verifica se o hóspede foi encontrado e atualizado
    if (result.affectedRows > 0) {
      res.status(200).json({ message: 'Hóspede atualizado com sucesso!' });
    } else {
      res.status(404).json({ message: 'Hóspede não encontrado.' });
    }
  } catch (error) {
    console.error('Erro ao atualizar hóspede:', error);
    res.status(500).json({ message: 'Erro ao atualizar o hóspede.' });
  }
});

// Rota para DELETAR uma reserva existente
app.delete('/api/reserva/:id', async (req, res) => {
  try {
    const { id } = req.params; // Pega o ID da reserva a ser deletada

    const query = 'DELETE FROM Reserva WHERE idReserva = ?';

    // Executa a query no banco de dados
    const [result] = await db.execute(query, [id]);

    // Verifica se alguma linha foi de fato deletada
    if (result.affectedRows > 0) {
      res.status(200).json({ message: 'Reserva deletada com sucesso!' });
    } else {
      // Se nenhuma linha foi afetada, a reserva com aquele ID não foi encontrada
      res.status(404).json({ message: 'Reserva não encontrada.' });
    }
  } catch (error) {
    // Tratamento de erro especial: se a exclusão falhar por causa de uma
    // restrição de chave estrangeira (foreign key), pode ser útil dar uma
    // mensagem mais específica, mas por agora manteremos genérico.
    console.error('Erro ao deletar reserva:', error);
    res.status(500).json({ message: 'Erro ao deletar a reserva.' });
  }
});

// Rota para buscar quartos ocupados em um período
app.get('/api/reserva/quartos-ocupados', async (req, res) => {
  try {
    const { dataEntrada, dataSaida } = req.query;

    if (!dataEntrada || !dataSaida) {
      return res.status(400).json({ 
        message: 'Os parâmetros dataEntrada e dataSaida são obrigatórios.' 
      });
    }

    // Busca os IDs dos quartos que têm reservas que se sobrepõem ao período solicitado
    // Uma reserva se sobrepõe se:
    // - A data de entrada da reserva é anterior à data de saída solicitada E
    // - A data de saída da reserva é posterior à data de entrada solicitada
    const query = `
      SELECT DISTINCT idQuarto 
      FROM Reserva 
      WHERE status NOT IN ('Cancelada', 'Recusada')
        AND dataEntrada < ? 
        AND dataSaida > ?
    `;
    
    const [rows] = await db.execute(query, [dataSaida, dataEntrada]);
    
    // Retorna apenas um array com os IDs dos quartos ocupados
    const quartosOcupados = rows.map(row => row.idQuarto);
    
    res.status(200).json({ quartosOcupados });
  } catch (error) {
    console.error('Erro ao buscar quartos ocupados:', error);
    res.status(500).json({ message: 'Erro ao buscar quartos ocupados.' });
  }
});


// --- 3. INICIANDO O SERVIDOR ---
app.listen(port, () => {
  console.log(`Servidor rodando com sucesso na porta http://localhost:${port}`);
  console.log(`Use seu navegador para testar o GET: http://localhost:${port}/api/reserva`);
});

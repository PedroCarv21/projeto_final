import db from "../config/db.js";

export const getAllServices = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        s.id,
        s.titulo,
        s.descricao,
        s.detalhes,
        s.preco,
        s.localidade,
        s.contato,
        MIN(i.imagem) AS imagem
      FROM servico s
      LEFT JOIN imagen_servico i ON s.id = i.servico_id
      GROUP BY s.id, s.titulo, s.descricao, s.detalhes, s.preco, s.localidade, s.contato
    `);

    const services = rows.map((service) => ({
      ...service,
      imagem: service.imagem
        ? service.imagem.toString().startsWith("data:image")
          ? service.imagem.toString()
          : `data:image/jpeg;base64,${service.imagem.toString("base64")}`
        : null,
    }));

    res.json(services);
  } catch (error) {
    console.error("Erro no getAllServices:", error);
    res.status(500).json({ message: "Erro ao listar serviços" });
  }
};

export const getServiceById = async (req, res) => {
  try {
    const { id } = req.params;

    const [serviceRows] = await db.query(
      `
      SELECT 
        s.id,
        s.titulo,
        s.descricao,
        s.detalhes,
        s.preco,
        s.localidade,
        s.contato
      FROM servico s
      WHERE s.id = ?
      `,
      [id]
    );

    if (serviceRows.length === 0)
      return res.status(404).json({ message: "Serviço não encontrado" });

    const service = serviceRows[0];


    const [imagens] = await db.query(
      `SELECT imagem FROM imagen_servico WHERE servico_id = ?`,
      [service.id]
    );

    service.imagens = imagens.map((img) => {
      const val = img.imagem?.toString() || "";
      return val.startsWith("data:image") ? val : `data:image/jpeg;base64,${val}`;
    });

    service.imagem = service.imagens.length > 0 ? service.imagens[0] : null;

    const servicoId = Number(service.id);

    const [caracteristicas] = await db.query(
      `SELECT descricao FROM caracteristica_servico WHERE servico_id = ?`,
      [servicoId]
    );

    const [inclusos] = await db.query(
      `SELECT descricao FROM servico_incluido WHERE servico_id = ?`,
      [servicoId]
    );

    service.caracteristicas = caracteristicas.map((c) => c.descricao);
    service.inclusos = inclusos.map((i) => i.descricao);


    // 🔸 Avaliações mockadas (temporário)
    service.avaliacoes = [
      {
        autor: "Maria Silva",
        nota: 5,
        comentario: "Serviço excepcional! A equipe é muito atenciosa e profissional.",
        data: "15 de agosto, 2024",
      },
      {
        autor: "João Santos",
        nota: 4,
        comentario: "Experiência incrível! Superou todas as expectativas.",
        data: "10 de agosto, 2024",
      },
      {
        autor: "Ana Costa",
        nota: 5,
        comentario: "Muito bom, recomendo! Ambiente excelente.",
        data: "5 de agosto, 2024",
      },
    ];

    // 🔸 Retorno final
    res.json(service);
  } catch (error) {
    console.error("Erro no getServiceById:", error);
    res.status(500).json({ message: "Erro ao buscar detalhes do serviço" });
  }
};

// =========================
//  🔹 Serviços adicionais
// =========================
export const getAdditionalServices = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        id,
        titulo,
        descricao,
        preco,
        icone
      FROM servico_adicional
    `);

    res.json(rows);
  } catch (error) {
    console.error("Erro ao listar serviços adicionais:", error);
    res.status(500).json({ message: "Erro ao listar serviços adicionais" });
  }
};

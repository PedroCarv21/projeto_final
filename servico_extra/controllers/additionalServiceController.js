import db from "../config/db.js";

export const getAllAdditionalServices = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT id, titulo, descricao, preco, incluso, icone
      FROM servico_adicional
      ORDER BY id ASC
    `);
    res.json(rows);
  } catch (error) {
    console.error("Erro ao buscar serviços adicionais:", error);
    res.status(500).json({ message: "Erro ao listar serviços adicionais" });
  }
};

export const deleteAdditionalServiceById = async (req, res) => {
  try {
    const { id } = req.params;

    // Verifica se o serviço adicional existe antes de excluir
    const [existing] = await db.query(
      `SELECT id FROM servico_adicional WHERE id = ?`,
      [id]
    );

    if (existing.length === 0) {
      return res.status(404).json({ message: "Serviço adicional não encontrado" });
    }

    // Exclui o registro
    await db.query(`DELETE FROM servico_adicional WHERE id = ?`, [id]);

    res.status(200).json({ message: "Serviço adicional excluído com sucesso" });
  } catch (error) {
    console.error("Erro ao excluir serviço adicional:", error);
    res.status(500).json({ message: "Erro ao excluir serviço adicional" });
  }
};
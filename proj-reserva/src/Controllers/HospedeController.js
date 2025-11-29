import { v4 as uuidv4 } from "uuid";
import HospedeRepository from "../repositories/HospedeRepository.js";

class HospedeController {
  /**
   * Lida com a requisição para LER TODOS OS HÓSPEDES (GET /api/hospedes)
   */
  async index(req, res) {
    try {
      const hospedes = await HospedeRepository.findAll();
      res.status(200).json(hospedes);
    } catch (error) {
      console.error("Erro ao buscar hóspedes:", error);
      res.status(500).json({ message: "Erro ao buscar dados dos hóspedes." });
    }
  }

  /**
   * Lida com a requisição para LER UM HÓSPEDE (GET /api/hospedes/:id)
   */
  async show(req, res) {
    try {
      const { id } = req.params;
      const hospede = await HospedeRepository.findById(id);

      if (hospede) {
        res.status(200).json(hospede);
      } else {
        res.status(404).json({ message: "Hóspede não encontrado." });
      }
    } catch (error) {
      console.error("Erro ao buscar hóspede:", error);
      res.status(500).json({ message: "Erro ao buscar dados do hóspede." });
    }
  }

  /**
   * Lida com a requisição para CRIAR UM HÓSPEDE (POST /api/hospedes)
   * (Útil para cadastrar um hóspede sem criar uma reserva no mesmo momento)
   */
  async store(req, res) {
    try {
      const hospedeData = req.body;
      if (!hospedeData.nome || !hospedeData.CPF || !hospedeData.email) {
        return res
          .status(400)
          .json({ message: "Dados essenciais do hóspede faltando." });
      }

      // Garante a criação do nome completo se vier separado
      const nomeCompleto = `${hospedeData.nome} ${
        hospedeData.sobrenome || ""
      }`.trim();
      const novoHospede = { ...hospedeData, nome: nomeCompleto };

      const hospedeCriado = await HospedeRepository.create(novoHospede);
      res.status(201).json(hospedeCriado);
    } catch (error) {
      console.error("Erro ao criar hóspede:", error);
      res.status(500).json({ message: "Erro ao criar o hóspede." });
    }
  }

  /**
   * Lida com a requisição para ATUALIZAR UM HÓSPEDE (PUT /api/hospedes/:id)
   */
  async update(req, res) {
    try {
      const { id } = req.params;
      const camposParaAtualizar = req.body;

      if (Object.keys(camposParaAtualizar).length === 0) {
        return res
          .status(400)
          .json({ message: "Nenhum campo fornecido para atualização." });
      }

      // Lógica para juntar nome e sobrenome, se eles forem enviados na atualização
      if (camposParaAtualizar.nome || camposParaAtualizar.sobrenome) {
        const hospedeAtual = await HospedeRepository.findById(id);
        if (!hospedeAtual)
          return res.status(404).json({ message: "Hóspede não encontrado." });

        const nome =
          camposParaAtualizar.nome || hospedeAtual.nome.split(" ")[0];
        const sobrenome =
          camposParaAtualizar.sobrenome ||
          hospedeAtual.nome.split(" ").slice(1).join(" ");
        camposParaAtualizar.nome = `${nome} ${sobrenome}`.trim();
        delete camposParaAtualizar.sobrenome; // Remove para não tentar atualizar uma coluna que não existe
      }

      const result = await HospedeRepository.update(id, camposParaAtualizar);

      if (result.affectedRows > 0) {
        res.status(200).json({ message: "Hóspede atualizado com sucesso!" });
      } else {
        // Se o hóspede não foi encontrado no passo anterior, o update não afeta linhas
        res.status(404).json({ message: "Hóspede não encontrado." });
      }
    } catch (error) {
      console.error("Erro ao atualizar hóspede:", error);
      res.status(500).json({ message: "Erro ao atualizar o hóspede." });
    }
  }

  /**
   * Lida com a requisição para DELETAR UM HÓSPEDE (DELETE /api/hospedes/:id)
   */
  async destroy(req, res) {
    try {
      const { id } = req.params;
      const result = await HospedeRepository.delete(id);

      if (result.affectedRows > 0) {
        // Status 204 é o padrão para delete bem-sucedido, sem corpo de resposta
        res.status(204).send();
      } else {
        res.status(404).json({ message: "Hóspede não encontrado." });
      }
    } catch (error) {
      console.error("Erro ao deletar hóspede:", error);
      res.status(500).json({ message: "Erro ao deletar o hóspede." });
    }
  }
}

// Exporta uma instância da classe para ser usada no arquivo de rotas
export default new HospedeController();

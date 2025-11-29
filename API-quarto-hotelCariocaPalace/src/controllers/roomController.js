import roomService from "../service/roomService.js";

class roomController {

  // GET
  async listRooms(req, res, next) {
    try {
      const rooms = await roomService.getRooms();
      res.status(200).json(rooms);
    } catch (error) {
      console.error(error);
      // res.status(500).json({ error: "Erro ao buscar quartos" });
      next(error);
    }
  }

  // GET ID
  async showRoomId(req, res, next) {
    let id = req.params.id;

    try {
      const isUuid = await roomService.getRoomId(id);

      if (!isUuid) {
        return res.status(404).json({ mensagem: "Quarto não encontrado" });
      } else {
        return res.status(200).json(isUuid);
      }
    } catch (error) {
      console.error("Erro ao buscar esse quarto em específico:", error);
      // res
      //   .status(500)
      //   .json({ erro: "Erro ao buscar esse quarto em específico" });
      next(error);
    }
  }

  // UPDATED
  async updateRoom(req, res, next) {
    let id = req.params.id;
    const atualizacao = req.body;

    try {
      const roomEdited = await roomService.updateIdRoom(id, atualizacao);

      if (!roomEdited) {
        return res.status(404).json({ erro: "Quarto não encontrado" });
      }
      res
        .status(200)
        .json({
          mensagem: "Quarto atualizado com sucesso",
          quarto: roomEdited,
        });
    } catch (error) {
      console.log(error);
      // res.status(500).json({ erro: "Erro ao atualizar quarto." });
      next(error);
    }
  }

  // POST
  async newRoom(req, res, next){
    const dataRoom = req.body;

    try {
      const created = await roomService.postRoom(dataRoom);
      return res.status(201).json({mensagem: "Curso criado com sucesso", quarto: created})
    } catch (error) {
      console.log(error);
      return next(error)
      // res.status(500).json({erro: 'Erro ao criar Quarto'})
    }
  }
  
  // ADICIONAR IMAGEM
  async addImages(req, res, next) {
    try { 
      const { id } = req.params;
      await roomService.addRoomImages(id, req.body); // objeto único OU array
      return res.status(201).json({ mensagem: "Imagem(ns) adicionada(s) com sucesso" });
      
    } catch (error) {
      console.error(error);
      return next(error);
      // ou: return res.status(400).json({ erro: error.message || 'Erro ao anexar imagem' });
    }
  }

  // DELETE
  async delRoom(req, res, next){
    try {
      const { id } = req.params;
      await roomService.removeRoom(id);
       return res.status(200).json({ mensagem: "Quarto removido com sucesso" });
    } catch (error) {
      console.error(error);
      return next(error);
    }
  }

  // GET AVAILABLE ROOMS
  async listAvailableRooms(req, res, next) {
    try {
      const { checkIn, checkOut, guests } = req.query;

      // Validações básicas
      if (!checkIn || !checkOut) {
        return res.status(400).json({ 
          erro: "Os parâmetros checkIn e checkOut são obrigatórios" 
        });
      }

      const guestsNumber = guests ? parseInt(guests) : 1;
      
      const rooms = await roomService.getAvailableRooms(checkIn, checkOut, guestsNumber);
      res.status(200).json(rooms);
    } catch (error) {
      console.error('Erro ao buscar quartos disponíveis:', error);
      next(error);
    }
  }
}

export default new roomController();

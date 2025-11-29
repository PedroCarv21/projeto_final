import express from "express";
import cors from "cors";
import roomRoutes from "./src/routes/roomRoutes.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use(roomRoutes);

app.get("/", (req, res) => {
  res.send("API Hotel Backend funcionando!");
});

app.use((err, req, res, next) => {
  console.error('Erro pego pelo middleware:', err.stack); // Loga o erro completo
  // Envia a resposta de erro genérica
  res.status(500).json({ 
    error: "Erro interno no servidor. Tente novamente mais tarde." 
  });
});

export default app;

import express from "express";
import cors from "cors";
import serviceRoutes from "./routes/serviceRoutes.js";

const app = express();


app.use(cors());
app.use(express.json());


app.use("/api", serviceRoutes);


const PORT = 3001;
app.listen(PORT, () => {
  console.log(`✅ Servidor rodando em http://localhost:${PORT}/api/services`);
});

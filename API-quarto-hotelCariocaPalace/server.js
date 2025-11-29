import app from "./app.js";
import dotenv from "dotenv";

dotenv.config();

const port = process.env.PORT || 3003;

app.listen(port, "0.0.0.0", () => {
  console.log(`Servidor do quarto rodando em http://0.0.0.0:${port}`);
});

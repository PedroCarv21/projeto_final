import "dotenv/config";
import app from "./src/app.js";

const PORT = process.env.PORT || 3002;

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});

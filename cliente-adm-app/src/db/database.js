import mysql from "mysql2/promise";
import config from "../config/config.js";

const dbConfig = {
  host: config.database.host,
  user: config.database.user,
  password: config.database.password,
  database: config.database.name,
  port: config.database.port,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};

let connection;

try {
  connection = mysql.createPool(dbConfig);

  connection
    .getConnection()
    .then((conn) => {
      console.log("✅ Conexão com o banco de dados estabelecida com sucesso!");
      conn.release();
    })
    .catch((error) => {
      console.error("❌ Erro ao conectar ao banco de dados:");
      console.error(`   Host: ${dbConfig.host}`);
      console.error(`   Database: ${dbConfig.database}`);
      console.error(`   Erro: ${error.message}`);
      console.error(
        "\n⚠️  A aplicação continuará rodando, mas as operações de banco falharão."
      );
    });
} catch (error) {
  console.error("❌ Erro fatal ao criar pool de conexões:", error);
  process.exit(1);
}

export default connection;

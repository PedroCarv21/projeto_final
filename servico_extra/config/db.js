import mysql from "mysql2/promise";

const db = mysql.createPool({
  host: "edumysql.acesso.rj.senac.br",
  user: "20252_prjint5",
  password: "Senac@2025",
  database: "20252_prjint5_caiotomaz",
  port: 3306,
});

export default db;

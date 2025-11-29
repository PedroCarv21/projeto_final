import app from "./src/app.js";
import config from "./src/config/config.js";

const PORT = config.server.port;

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`🔐 Sistema de Autenticação Ativo`);
  console.log(`📍 Ambiente: ${config.server.nodeEnv}`);
  console.log(`🌐 CORS: ${config.cors.frontendUrl}`);
  console.log(`\n📋 Endpoints disponíveis:`);
  console.log(`\n🔑 Autenticação:`);
  console.log(`   POST   /auth/login`);
  console.log(`   POST   /auth/refresh`);
  console.log(`   POST   /auth/logout`);
  console.log(`\n👥 Clientes:`);
  console.log(`   GET    /clientes (🔒 Autenticado)`);
  console.log(`   GET    /clientes/:id (🔒 Autenticado)`);
  console.log(`   POST   /clientes (Público)`);
  console.log(`   PUT    /clientes/:id (🔒 Autenticado)`);
  console.log(`   DELETE /clientes (🔒 Autenticado)`);
  console.log(`\n💡 Dica: Configure as variáveis de ambiente no arquivo .env`);
});

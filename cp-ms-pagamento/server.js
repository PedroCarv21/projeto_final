require('dotenv').config();
const app = require('./src/app');

const port = process.env.PORT || 3005;

app.listen(port, () => {
  console.log(`[SERVER] Microsserviço de pagamento rodando na porta: ${port}`);
  console.log(`[SERVER] Ambiente: ${process.env.NODE_ENV || 'development'}`);
});
const requestLogger = (req, res, next) => {
  const start = Date.now();

  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);

  if (["POST", "PUT", "PATCH"].includes(req.method) && req.body) {
    const logBody = { ...req.body };
    if (logBody.card) {
      logBody.card = { ...logBody.card, number: "****", cvv: "***" };
    }
    if (logBody.cartao) {
      logBody.cartao = { ...logBody.cartao, number: "****", cvv: "***" };
    }
    if (logBody.password) {
      logBody.password = "***";
    }
    console.log("Request Body:", JSON.stringify(logBody, null, 2));
  }

  const originalEnd = res.end;
  res.end = function (...args) {
    const duration = Date.now() - start;
    console.log(
      `[${new Date().toISOString()}] ${req.method} ${req.originalUrl} - ${
        res.statusCode
      } - ${duration}ms`
    );
    originalEnd.apply(this, args);
  };

  next();
};

module.exports = requestLogger;

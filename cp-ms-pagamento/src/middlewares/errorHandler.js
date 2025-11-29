const errorHandler = (err, req, res, next) => {
  console.error('Error Handler:', err);

  const response = {
    success: false,
    message: 'Erro interno do servidor',
    timestamp: new Date().toISOString(),
    path: req.originalUrl,
    method: req.method
  };

  if (process.env.NODE_ENV === 'development') {
    response.error = err.message;
    response.stack = err.stack;
  }

  if (err.name === 'ValidationError') {
    response.message = 'Dados de entrada inválidos';
    return res.status(400).json(response);
  }

  if (err.name === 'UnauthorizedError') {
    response.message = 'Acesso não autorizado';
    return res.status(401).json(response);
  }

  if (err.statusCode) {
    return res.status(err.statusCode).json(response);
  }

  res.status(500).json(response);
};


const notFoundHandler = (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint não encontrado',
    timestamp: new Date().toISOString(),
    path: req.originalUrl,
    method: req.method
  });
};

module.exports = {
  errorHandler,
  notFoundHandler
};
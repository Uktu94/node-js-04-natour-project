const express = require('express');
const morgan = require('morgan');

const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

const app = express();
// MIDDLEWARE
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
  // Calling morgan fn will return a fn simiilar to our middleware fn
  // Morgan fn'ı loggler fn'ını döndürüyor (github'da morgan bulunduğu index.js file'ından görebiliriz)
}

// We define global middlewares before all our route handlers
app.use(express.json()); // is middleware. Middleware basically a fn that can modify
// incoming request data. Bodye ulaşabiliriz

app.use(express.static(`${__dirname}/public`));

// Simple middleware fns that we define they are going to apply every single request
app.use((req, res, next) => {
  console.log('Hello from the middleware :D');
  next(); // next methodunu çağırmazsak req, res methodu stucklanır. client'a response gönderemeyiz
});

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

// ROUTE
// Mounting routers
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

module.exports = app;

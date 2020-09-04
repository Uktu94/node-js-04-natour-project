const express = require('express');
const morgan = require('morgan');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
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

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  //console.log(req.headers);

  next();
});

// ROUTE
// Mounting routers
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

app.all('*', (req, res, next) => {
  // We're creating an error then we define the status and status code properties on it
  // ... so that our error handling middleware can then use them in the next step
  // const err = new Error(`Can't find ${req.originalUrl} on this server!`);
  // err.status = 'fail';
  // err.statusCode = 404;

  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

module.exports = app;

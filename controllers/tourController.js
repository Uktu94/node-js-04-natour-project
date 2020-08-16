const fs = require('fs');

// TOP LEVEL CODE ONLY EXECUTED ONCE
// only read at the begging when we start the server(tours-simple.json)
const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
);

// ****** MIDDLEWARES ******
exports.checkID = (req, res, next, val) => {
  console.log(`Tour id is: ${val}`);

  if (req.params.id * 1 > tours.length) {
    // If we didn't return this here then express would send this response back
    // ... but it would still contiuning the code in this function
    // ... So after sending the response it will then hit next() fn
    // ... and it would move on to the next middleware
    // ... and will then send another response to the client
    // ... That is not be allowed
    return res.status(404).json({
      status: 'fail',
      message: 'Invalid ID',
    });
  }
  next();
};

exports.checkBody = (req, res, next) => {
  if (!req.body.name || !req.body.price) {
    return res.status(400).json({
      status: 'fail',
      message: 'Bad request. Missing name or price',
    });
  }
  next();
};

exports.getAllTours = (req, res) => {
  console.log(req.requestTime);

  res.status(200).json({
    // Jsend
    status: 'success',
    requestedAt: req.requestTime,
    results: tours.length, // this is not a Jsend, this is make sense whenever we are sending an array(multiple obj)
    data: {
      tours,
    },
  });
};

exports.getTour = (req, res) => {
  // optional param "?"
  const id = req.params.id * 1; // A JS trick when we multiply a string that looks like a num
  // when we multiply that with another number, it'll then automatically convert string
  // id'lerimiz string'di num  a çevirmek için bu tricki kullandık.

  // It'll basically loop through thee array, and each of the iterations,
  // We'll have access to the cur el, and we'll return either true or false.
  const tour = tours.find((el) => el.id === id);

  res.status(200).json({
    // Jsend
    status: 'success',
    data: {
      tour,
    },
  });
};

exports.createTour = (req, res) => {
  // console.log(req.body);  gonna be avaible on the req BC we used middleware

  const newId = tours[tours.length - 1].id + 1; // data
  // This is allow us to craete a new object by merging two existing objects together
  const newTour = Object.assign({ id: newId }, req.body);

  tours.push(newTour);

  fs.writeFile(
    `${__dirname}/dev-data/data/tours-simple.json`,
    JSON.stringify(tours),
    (err) => {
      res.status(201).json({
        status: 'success',
        data: {
          tour: newTour,
        },
      });
    }
  );
};

exports.updateTour = (req, res) => {
  res.status(200).json({
    status: 'success',
    data: {
      tour: '<Updated tour here...>',
    },
  });
};

exports.deleteTour = (req, res) => {
  res.status(204).json({
    status: 'success',
    data: null,
  });
};

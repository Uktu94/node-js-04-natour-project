const Tour = require('../models/tourModel');

// TOP LEVEL CODE ONLY EXECUTED ONCE
// only read at the begging when we start the server(tours-simple.json)
// const tours = JSON.parse(
//   fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
// );

// ****** MIDDLEWARES ******
// exports.checkID = (req, res, next, val) => {
//   console.log(`Tour id is: ${val}`);

//   if (req.params.id * 1 > tours.length) {
//     // If we didn't return this here then express would send this response back
//     // ... but it would still contiuning the code in this function
//     // ... So after sending the response it will then hit next() fn
//     // ... and it would move on to the next middleware
//     // ... and will then send another response to the client
//     // ... That is not be allowed
//     return res.status(404).json({
//       status: 'fail',
//       message: 'Invalid ID'
//     });
//   }
//   next();
// };

// exports.checkBody = (req, res, next) => {
//   if (!req.body.name || !req.body.price) {
//     return res.status(400).json({
//       status: 'fail',
//       message: 'Bad request. Missing name or price'
//     });
//   }
//   next();
// };

exports.getAllTours = async (req, res) => {
  try {
    const tours = await Tour.find(); // return an array of all docs.

    // console.log(req.requestTime);

    res.status(200).json({
      // Jsend
      status: 'success',
      results: tours.length, // this is not a Jsend, this is make sense whenever we are sending an array(multiple obj)
      data: {
        tours
        // Data property to basically envelope the tours.
        // Then we also send this property which simply measures the number of results
        // ... hatt are in the tours array
      }
    });
  } catch (err) {
    // We will implement error handler later.
    res.status(404).json({
      status: 'fail',
      message: err
    });
  }
};

exports.getTour = async (req, res) => {
  try {
    const tour = await Tour.findById(req.params.id);
    // Tour.findOne({ _id: req.params.id }) // would work exact same way as this

    res.status(200).json({
      status: 'success',
      data: {
        tour
      }
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err
    });
  }

  // optional param "?"
  // const id = req.params.id * 1; // A JS trick when we multiply a string that looks like a num
  // when we multiply that with another number, it'll then automatically convert string
  // id'lerimiz string'di num  a çevirmek için bu tricki kullandık.

  // It'll basically loop through thee array, and each of the iterations,
  // We'll have access to the cur el, and we'll return either true or false.
  // const tour = tours.find((el) => el.id === id);

  // res.status(200).json({
  //   // Jsend
  //   status: 'success',
  //   data: {
  //     tour
  //   }
  // });
};

exports.createTour = async (req, res) => {
  try {
    // We can use the tour model directly and call create() method on it
    // Then we pass the data that we want to store in database as a new tour
    // This method will then return a promise
    // And then store that result into the newTour variable
    // Async kullandık çünkü Tour.create() promise döndürüyor
    const newTour = await Tour.create(req.body); // data that comes with the post request

    res.status(201).json({
      status: 'success',
      data: {
        tour: newTour
      }
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err // Don't do this in a real application!
    });
  }

  // // console.log(req.body);  gonna be avaible on the req BC we used middleware

  // const newId = tours[tours.length - 1].id + 1; // data
  // // This is allow us to craete a new object by merging two existing objects together
  // const newTour = Object.assign({ id: newId }, req.body);

  // tours.push(newTour);

  // fs.writeFile(
  //   `${__dirname}/dev-data/data/tours-simple.json`,
  //   JSON.stringify(tours),
  //   (err) => {
  //     res.status(201).json({
  //       status: 'success',
  //       data: {
  //         tour: newTour
  //       }
  //     });
  //   }
  // );
};

exports.updateTour = async (req, res) => {
  try {
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      new: true, // Then new updated document is the one that will be return
      runValidators: true
    });

    res.status(200).json({
      status: 'success',
      data: {
        tour
      }
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err
    });
  }
};

exports.deleteTour = async (req, res) => {
  try {
    await Tour.findByIdAndDelete(req.params.id);

    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err
    });
  }
};

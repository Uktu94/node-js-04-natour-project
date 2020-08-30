const Tour = require('../models/tourModel');
const APIFeatures = require('../utils/apiFeatures');

const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

// TOP LEVEL CODE ONLY EXECUTED ONCE
// only read at the begging when we start the server(tours-simple.json)
// const tours = JSON.parse(
//   fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
// );

// ****** MIDDLEWARES ******
// exports.checkID = (req, res, next, val) => {
//   console.log(`Tour id is: ${val}`);

//   if (req.params.id * 1 > tours.length) {
//      If we didn't return this here then express would send this response back
//      ... but it would still contiuning the code in this function
//      ... So after sending the response it will then hit next() fn
//      ... and it would move on to the next middleware
//      ... and will then send another response to the client
//      ... That is not be allowed
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

// This will do set properties of the query object to these values that we specifed
exports.aliasTopTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
};

// As soon as we then get to this fn, the query object is already prefilled
// ... even if the user didn't put any of params
exports.getAllTours = catchAsync(async (req, res, next) => {
  // ***** EXECUTE QUERY *****
  // We manipulate the query
  const features = new APIFeatures(Tour.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .pagination(); // This chain only works, when we return 'this'
  const tours = await features.query;

  // **** SEND RESPONSE ****
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
});

exports.getTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findById(req.params.id);
  // Tour.findOne({ _id: req.params.id }) // would work exact same way as this

  if (!tour) {
    return next(new AppError('No tour found with that ID', 404)); // We need this return immediatly
  }

  res.status(200).json({
    status: 'success',
    data: {
      tour
    }
  });
});

// optional param "?"
// const id = req.params.id * 1; // A JS trick when we multiply a string that looks like a num
// when we multiply that with another number, it'll then automatically convert string
// id'lerimiz string'di num  a çevirmek için bu tricki kullandık.

// It'll basically loop through thee array, and each of the iterations,
// We'll have access to the cur el, and we'll return either true or false.
// const tour = tours.find((el) => el.id === id);

// res.status(200).json({
//    Jsend
//   status: 'success',
//   data: {
//     tour
//   }
// });

exports.createTour = catchAsync(async (req, res, next) => {
  const newTour = await Tour.create(req.body); // data that comes with the post request

  res.status(201).json({
    status: 'success',
    data: {
      tour: newTour
    }
  });
});

// try {
//    We can use the tour model directly and call create() method on it
//    Then we pass the data that we want to store in database as a new tour
//    This method will then return a promise
//    And then store that result into the newTour variable
//    Async kullandık çünkü Tour.create() promise döndürüyor
//    const newTour = await Tour.create(req.body); // data that comes with the post request

//   res.status(201).json({
//     status: 'success',
//      data: {
//       tour: newTour
//      }
//   });
// } catch (err) {
//   res.status(400).json({
//     status: 'fail',
//     message: err // Don't do this in a real application!
//   });
// }

//  console.log(req.body);  gonna be avaible on the req BC we used middleware

// const newId = tours[tours.length - 1].id + 1; // data
// This is allow us to craete a new object by merging two existing objects together
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

exports.updateTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
    new: true, // Then new updated document is the one that will be return
    runValidators: true
  });

  if (!tour) {
    return next(new AppError('No tour found with that ID', 404)); // We need this return immediatly
  }

  res.status(200).json({
    status: 'success',
    data: {
      tour
    }
  });
});

exports.deleteTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findByIdAndDelete(req.params.id);

  if (!tour) {
    return next(new AppError('No tour found with that ID', 404)); // We need this return immediatly
  }

  res.status(204).json({
    status: 'success',
    data: null
  });
});

exports.getTourStats = catchAsync(async (req, res, next) => {
  // Match is basically to select or to filter certain documents
  const stats = await Tour.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4.5 } }
    },
    {
      $group: {
        _id: { $toUpper: '$difficulty' },
        numTours: { $sum: 1 },
        numRatings: { $sum: '$ratingsQuantity' },
        avgRating: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' }
      }
    },
    {
      $sort: { avgPrice: 1 }
    }
    // {
    //   $match: { _id: { $ne: 'EASY' } }
    // }
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      stats
    }
  });
});

exports.gethMonthlyPlan = catchAsync(async (req, res, next) => {
  const year = req.params.year * 1; // 2021
  const plan = await Tour.aggregate([
    {
      $unwind: '$startDates'
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-1`)
        }
      }
    },
    {
      $group: {
        _id: { $month: '$startDates' },
        numTourStarts: { $sum: 1 },
        tours: { $push: '$name' }
      }
    },
    {
      $addFields: { month: '$_id' }
    },
    {
      $project: {
        _id: 0
      }
    },
    {
      $sort: { numTourStarts: -1 }
    },
    {
      $limit: 12
    }
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      plan
    }
  });
});

const mongoose = require('mongoose');
const slugify = require('slugify');
// const validator = require('validator');

// This is the basic way desc our data and doing some validation
const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour mmust hahve a name'],
      unique: true,
      trim: true,
      maxlength: [40, 'A tour name must have less or equal than 40 characters'],
      minlength: [10, 'A tour name must have more or equal than 10 characters']
      // validate: [validator.isAlpha, 'Tour name must only contain characters']
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, 'A tour must have a duration']
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'Tour must have a group size']
    },
    difficulty: {
      type: String,
      required: [true, 'A tour must have a difficulty'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'Difficulty is either: easy, medium or difficult'
      }
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'Rating must be above 1.0'],
      max: [5, 'Rating must be below 5.0']
    },
    ratingsQuantity: {
      type: Number,
      default: 0
    },
    price: {
      type: Number,
      required: [true, 'A tour must have a price']
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function (val) {
          // this only points to current doc on NEW document creation
          return val < this.price; // 100 < 200 true, 250 < 200 false
        },
        message: 'Discount price ({VALUE}) should be below regular price'
      }
    },
    summary: {
      type: String,
      trim: true,
      // only works on strings.
      //Remove all the white spaces in the beginning and in the end of the string
      required: [true, 'A tours must have a description']
    },
    description: {
      type: String,
      trim: true
    },
    imageCover: {
      type: String,
      required: [true, 'A tour must have a cover image']
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false
    },
    startDates: [Date],
    secretTour: {
      type: Boolean,
      default: false
    }
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual propterties are basically fields, that we can define our schema
// ... but that will not be persisted(They will not be saved into the DB)
// ... in order to save us some space there (For example a conversion from miles to km(We dont need to store our DB))
// This virtual property will basically be creatted each time that we get some data out of the
// .get() fn called a getter
// We can not use 'durationWeeks' BC they are not part of database
tourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7; // This is how we calculate the duration in weeks
});

// DOCUMENT MIDDLEWARE, runs before .save() and .create() mongoose methods
// .insertMany() save middleware'ini triggerlamaz
// .pre() gonna run before an actual event
// That event in this case is the save event
// Function will be called before an actual document is saved to the database
tourSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

// tourSchema.pre('save', function (next) {
//   console.log('Will save document...');
//   next();
// });

//  Post middleware functions are executed after all the pre middleware functions
//  ... have completed
// tourSchema.post('save', function (doc, next) {
//   console.log(doc);
//   next();
// });

// QUERY MIDDLEWARE allows us to run functions beforre or after a certain query is executed
// 'this' keyword pointing query not document
// We're creating a find query and the find hook is then executed
// tourSchema.pre('find', function (next) {
// all thee strings that start with find /^find/
tourSchema.pre(/^find/, function (next) {
  this.find({ secretTour: { $ne: true } });

  this.start = Date.now();
  next();
});

tourSchema.post(/^find/, function (docs, next) {
  console.log(`Query took ${Date.now() - this.start} milliseconds!`);
  next();
});

// AGGREGATION MIDDLEWARE allows us to add hooks before or after an aggregation happens
// This is going to point to the current aggregation object
tourSchema.pre('aggregate', function (next) {
  this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });

  //console.log(this.pipeline());
  next();
});

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;

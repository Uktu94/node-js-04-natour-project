const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
    // security amaçlı expirelanma süresi config'de belirttiğimiz süre
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  // we only allow the data that we actually need
  // ... to be put into new user
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    passwordChangedAt: req.body.passwordChangedAt
  }); // all of that returns a promise

  // at this point first we have payload and second the secret
  // token header will actually created automatically
  const token = signToken(newUser._id);

  res.status(201).json({
    status: 'success',
    token,
    data: {
      user: newUser
    }
  });
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // 1) Check if email and password exist
  if (!email || !password) {
    // dont forget the RETURN
    return next(new AppError('Please provide email and password', 400));
  }

  // 2) Check if the user exist && password is correct
  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect email or password', 401));
  }

  // 3) If everything is okay, send the token to
  const token = signToken(user._id);

  res.status(200).json({
    status: 'success',
    token
  });
});

exports.protect = catchAsync(async (req, res, next) => {
  // 1) Getting to token and check if it's there
  let token;
  // We read the token from the authorization header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  // if there's no token
  if (!token) {
    return next(
      // We create this error whick will then trigger our error handler middleware to send
      // ... that error back to the client
      // and we don't get the access tours bc of course middleware runs
      // ... before the getAllTours controller
      new AppError('You are not logged in! Please log in to get access.', 401)
    );
  }

  // 2) Verification the token
  // this fn requires a callback fn and this cb fn is then gonna run
  // as soon as the verification has been completed
  // Yani bu method bir async function
  // It'll verify the token and then it will call cb fn that we can specify
  // All tthis here is a function that we need to call, which will then return a promise
  // Basically we have correct payload here(USER ID)
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // 3) Check if user still exists
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(
      new AppError(
        'The user belonging to this token does no longer exist!',
        401
      )
    );
  }

  // 4) Check if user changed password after the token was issued
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError('User recently changed password! Please log in again.', 401)
    );
  }

  // GRANT ACCESS TO PROTECTED ROUTE
  req.user = currentUser;
  next();
});

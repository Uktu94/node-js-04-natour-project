const express = require('express');
const tourController = require('../controllers/tourController');

const router = express.Router();

// router.param('id', tourController.checkID);

// We will start first middleware that's gonna be run is aliasTopTours
router
  .route('/top-5-cheap')
  .get(tourController.aliasTopTours, tourController.getAllTours);

router.route('/tour-stats').get(tourController.getTourStats);
router.route('/monthly-plan/:year').get(tourController.gethMonthlyPlan);

// They are actually kind of middleware themselves that only apply for a certain URL
router
  .route('/')
  .get(tourController.getAllTours)
  .post(tourController.createTour);
// Burası da bir nevi middleware olduğu için bu blok içerisine custom middleware konulduğu
// ... zaman çalışmaz. Çünkü cycle tamamlanmış oluyor ve custom'a sıra gelmiyor.

router
  .route('/:id')
  .get(tourController.getTour)
  .patch(tourController.updateTour)
  .delete(tourController.deleteTour);

module.exports = router;

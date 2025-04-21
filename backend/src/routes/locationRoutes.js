const express = require('express');
const router = express.Router();
const locationController = require('../controllers/locationController');
const { catchAsync } = require('../middleware/errorHandler');

// Location routes for cascading dropdowns
router.get('/provinces', catchAsync(locationController.getProvinces));
router.get('/districts', catchAsync(locationController.getDistricts));
router.get('/cities', catchAsync(locationController.getCities));

module.exports = router;

const express = require('express');
const {
  getLocations, addLocation, getLocation, updateLocation, deleteLocation
} = require('../controllers/locationController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.route('/').get(getLocations).post(addLocation);
router.route('/:id').get(getLocation).put(updateLocation).delete(deleteLocation);

module.exports = router;

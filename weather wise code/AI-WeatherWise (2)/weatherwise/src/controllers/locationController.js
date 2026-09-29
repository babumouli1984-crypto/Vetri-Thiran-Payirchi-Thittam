const Location = require('../models/Location');

// @route GET /api/locations
const getLocations = async (req, res, next) => {
  try {
    const locations = await Location.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, count: locations.length, data: locations });
  } catch (error) {
    next(error);
  }
};

// @route POST /api/locations
const addLocation = async (req, res, next) => {
  try {
    const { city, country } = req.body;
    const location = await Location.create({ city, country, user: req.user._id });
    res.status(201).json({ success: true, data: location });
  } catch (error) {
    next(error);
  }
};

// @route GET /api/locations/:id
const getLocation = async (req, res, next) => {
  try {
    const location = await Location.findOne({ _id: req.params.id, user: req.user._id });
    if (!location) return res.status(404).json({ success: false, message: 'Location not found' });
    res.json({ success: true, data: location });
  } catch (error) {
    next(error);
  }
};

// @route PUT /api/locations/:id
const updateLocation = async (req, res, next) => {
  try {
    const location = await Location.findOne({ _id: req.params.id, user: req.user._id });
    if (!location) return res.status(404).json({ success: false, message: 'Location not found' });

    if (req.body.city) location.city = req.body.city;
    if (req.body.country) location.country = req.body.country;

    await location.save();
    res.json({ success: true, data: location });
  } catch (error) {
    next(error);
  }
};

// @route DELETE /api/locations/:id
const deleteLocation = async (req, res, next) => {
  try {
    const location = await Location.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!location) return res.status(404).json({ success: false, message: 'Location not found' });
    res.json({ success: true, message: 'Location removed' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getLocations, addLocation, getLocation, updateLocation, deleteLocation };

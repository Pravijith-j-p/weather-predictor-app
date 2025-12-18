const express = require('express');
const WeatherController = require('../controllers/weatherController');

const setWeatherRoutes = (app) => {
    const router = express.Router();
    const weatherController = new WeatherController();

    router.get('/weather', weatherController.getWeather.bind(weatherController));

    app.use('/api', router);
};

module.exports = setWeatherRoutes;
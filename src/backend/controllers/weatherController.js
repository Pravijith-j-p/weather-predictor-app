class WeatherController {
    constructor(weatherService) {
        this.weatherService = weatherService;
    }

    async getWeather(req, res) {
        try {
            const { location } = req.query;
            if (!location) {
                return res.status(400).json({ error: 'Location is required' });
            }

            const weatherData = await this.weatherService.fetchWeather(location);
            return res.status(200).json(weatherData);
        } catch (error) {
            return res.status(500).json({ error: 'An error occurred while fetching weather data' });
        }
    }
}

export default WeatherController;
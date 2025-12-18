class WeatherService {
    constructor(apiKey) {
        this.apiKey = apiKey;
        this.baseUrl = 'https://api.example.com/weather'; // Replace with the actual weather API URL
    }

    async fetchWeather(location) {
        try {
            const response = await fetch(`${this.baseUrl}?q=${location}&appid=${this.apiKey}`);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();
            return data;
        } catch (error) {
            throw new Error(`Failed to fetch weather data: ${error.message}`);
        }
    }
}

export default WeatherService;
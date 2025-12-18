# Weather Predictor App

A full-stack weather prediction application with an Express.js backend and Angular frontend. Fetches weather data from an external weather API.

## 📁 Project Structure

```
weather-predictor-app/
├── src/
│   ├── backend/                    # Node.js/Express backend
│   │   ├── index.js               # Server entry point
│   │   ├── controllers/           # Request handlers
│   │   │   └── weatherController.js
│   │   ├── services/              # Business logic
│   │   │   └── weatherService.js
│   │   ├── routes/                # API routes
│   │   │   └── weatherRoutes.js
│   │   ├── middlewares/           # Express middlewares
│   │   │   └── errorHandler.js
│   │   └── utils/                 # Helper functions
│   │       └── formatResponse.js
│   └── frontend/                   # Angular frontend
│       ├── main.ts                # Angular bootstrap file
│       ├── app.component.*        # Root component
│       ├── dashboard.component.*  # Dashboard component
│       ├── current-weather.component.*  # Current weather display
│       ├── forecast.component.*   # Weather forecast
│       ├── location-search.component.*  # Location search
│       ├── weather-maps.component.*     # Weather maps
│       ├── weather.service.ts     # API communication
│       ├── weather.model.ts       # Type definitions
│       ├── angular.json           # Angular config
│       ├── tsconfig.json          # TypeScript config
│       ├── index.html             # Main HTML file
│       └── styles.css             # Global styles
├── config/
│   └── default.json               # Configuration settings
├── package.json                   # Dependencies
├── package-lock.json              # Dependency lock file
├── .env                          # Environment variables (local)
├── .env.example                  # Environment template
└── README.md                     # This file
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm (v6 or higher)

### Installation

1. Clone the repository
```bash
git clone <repo-url>
cd weather-predictor-app
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
```bash
cp .env.example .env
```

4. Add your API key to `.env`
```
API_KEY=your_actual_api_key_here
API_URL=https://api.weatherapi.com/v1/
PORT=5000
NODE_ENV=development
```

### Running the Application

**Development mode** (with auto-reload):
```bash
npm run dev
```

**Production mode**:
```bash
npm start
```

Server will run on `http://localhost:5000`

## 📦 Dependencies

### Backend
- **express**: Web framework for Node.js
- **axios**: HTTP client for external API requests
- **dotenv**: Environment variable management

### Dev
- **nodemon**: Auto-restart server on file changes during development

### Frontend
- **Angular**: Frontend framework
- **TypeScript**: Type-safe JavaScript

## 🔧 Configuration

### Environment Variables (.env)
Set up your `.env` file with:
- `API_KEY` - Your weather API key (from weatherapi.com)
- `API_URL` - Weather API base URL
- `PORT` - Server port (default: 5000)
- `NODE_ENV` - Environment (development/production)

### Application Configuration
Edit `config/default.json` for application settings.

## 📝 Scripts

- `npm start` - Run production server
- `npm run dev` - Run development server with auto-reload (nodemon)
- `npm test` - Run tests (not configured yet)

## 🌐 API Endpoints

Backend endpoints are defined in `src/backend/routes/weatherRoutes.js`:
- Check the routes file for available endpoints

## 🎨 Frontend Components

Located in `src/frontend/`:
- **AppComponent**: Root component
- **DashboardComponent**: Main dashboard view
- **CurrentWeatherComponent**: Current weather display
- **ForecastComponent**: Weather forecast display
- **LocationSearchComponent**: Location/city search
- **WeatherMapsComponent**: Weather maps visualization

## 🛠 Development

To make changes:

1. **Backend**: Edit files in `src/backend/`
   - Server auto-reloads with nodemon in dev mode
   
2. **Frontend**: Edit files in `src/frontend/`
   - Angular build configuration in `angular.json`

## 📄 License

ISC

## 👤 Author

Pravijith J Prakash


## API Endpoints
- `GET /weather`: Fetches the current weather data.

## Contributing
Contributions are welcome! Please open an issue or submit a pull request for any improvements or bug fixes.

## License
This project is licensed under the MIT License.
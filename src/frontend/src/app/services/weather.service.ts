import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

import { WeatherData, ForecastData, LocationData, WeatherLocation } from '../models/weather.model';

@Injectable({
  providedIn: 'root'
})
export class WeatherService {
  private readonly OPENWEATHER_API_KEY = 'YOUR_API_KEY_HERE'; // Replace with your OpenWeatherMap API key
  private readonly OPENWEATHER_BASE_URL = 'https://api.openweathermap.org/data/2.5';
  private readonly NOMINATIM_BASE_URL = 'https://nominatim.openstreetmap.org';
  
  // For demo purposes, we'll use a free service. In production, get your API key from openweathermap.org
  private readonly DEMO_MODE = true;
  
  private currentLocationSubject = new BehaviorSubject<WeatherLocation | null>(null);
  public currentLocation$ = this.currentLocationSubject.asObservable();

  constructor(private http: HttpClient) {
    this.initializeLocation();
  }

  private initializeLocation(): void {
    // Try to get user's location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location: WeatherLocation = {
            name: 'Current Location',
            lat: position.coords.latitude,
            lon: position.coords.longitude
          };
          this.setCurrentLocation(location);
        },
        () => {
          // Fallback to default location (London)
          this.setCurrentLocation({
            name: 'London',
            lat: 51.5074,
            lon: -0.1278,
            country: 'GB'
          });
        }
      );
    } else {
      // Fallback to default location
      this.setCurrentLocation({
        name: 'London',
        lat: 51.5074,
        lon: -0.1278,
        country: 'GB'
      });
    }
  }

  setCurrentLocation(location: WeatherLocation): void {
    this.currentLocationSubject.next(location);
  }

  getCurrentWeather(lat: number, lon: number): Observable<WeatherData> {
    if (this.DEMO_MODE) {
      return this.getDemoWeatherData(lat, lon);
    }
    
    const url = `${this.OPENWEATHER_BASE_URL}/weather?lat=${lat}&lon=${lon}&appid=${this.OPENWEATHER_API_KEY}&units=metric`;
    return this.http.get<WeatherData>(url).pipe(
      catchError(error => {
        console.error('Error fetching weather data:', error);
        return this.getDemoWeatherData(lat, lon);
      })
    );
  }

  getForecast(lat: number, lon: number): Observable<ForecastData> {
    if (this.DEMO_MODE) {
      return this.getDemoForecastData(lat, lon);
    }
    
    const url = `${this.OPENWEATHER_BASE_URL}/forecast?lat=${lat}&lon=${lon}&appid=${this.OPENWEATHER_API_KEY}&units=metric`;
    return this.http.get<ForecastData>(url).pipe(
      catchError(error => {
        console.error('Error fetching forecast data:', error);
        return this.getDemoForecastData(lat, lon);
      })
    );
  }

  searchLocations(query: string): Observable<LocationData[]> {
    if (!query || query.length < 3) {
      return of([]);
    }
    
    const url = `${this.NOMINATIM_BASE_URL}/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1`;
    return this.http.get<LocationData[]>(url).pipe(
      catchError(error => {
        console.error('Error searching locations:', error);
        return of([]);
      })
    );
  }

  // Demo data methods for when API key is not available
  private getDemoWeatherData(lat: number, lon: number): Observable<WeatherData> {
    const demoData: WeatherData = {
      coord: { lat, lon },
      weather: [
        {
          id: 800,
          main: 'Clear',
          description: 'clear sky',
          icon: '01d'
        }
      ],
      main: {
        temp: Math.round(Math.random() * 15 + 15), // 15-30°C
        feels_like: Math.round(Math.random() * 15 + 15),
        temp_min: Math.round(Math.random() * 10 + 10),
        temp_max: Math.round(Math.random() * 10 + 20),
        pressure: Math.round(Math.random() * 50 + 1000),
        humidity: Math.round(Math.random() * 40 + 40)
      },
      wind: {
        speed: Math.round(Math.random() * 10 + 2),
        deg: Math.round(Math.random() * 360)
      },
      clouds: {
        all: Math.round(Math.random() * 50)
      },
      dt: Date.now() / 1000,
      sys: {
        country: 'GB',
        sunrise: Date.now() / 1000 - 3600 * 2,
        sunset: Date.now() / 1000 + 3600 * 8
      },
      timezone: 0,
      id: 2643743,
      name: this.getLocationName(lat, lon),
      cod: 200
    };
    
    return of(demoData);
  }

  private getDemoForecastData(lat: number, lon: number): Observable<ForecastData> {
    const forecastItems = [];
    const now = new Date();
    
    for (let i = 0; i < 40; i++) {
      const date = new Date(now.getTime() + i * 3 * 60 * 60 * 1000); // 3 hour intervals
      forecastItems.push({
        dt: date.getTime() / 1000,
        main: {
          temp: Math.round(Math.random() * 15 + 10),
          feels_like: Math.round(Math.random() * 15 + 10),
          temp_min: Math.round(Math.random() * 10 + 5),
          temp_max: Math.round(Math.random() * 10 + 15),
          pressure: Math.round(Math.random() * 50 + 1000),
          humidity: Math.round(Math.random() * 40 + 40)
        },
        weather: [
          {
            id: 800,
            main: ['Clear', 'Clouds', 'Rain'][Math.floor(Math.random() * 3)],
            description: 'demo weather',
            icon: '01d'
          }
        ],
        clouds: {
          all: Math.round(Math.random() * 100)
        },
        wind: {
          speed: Math.round(Math.random() * 10 + 2),
          deg: Math.round(Math.random() * 360)
        },
        visibility: 10000,
        pop: Math.random() * 0.5,
        sys: {
          pod: date.getHours() > 6 && date.getHours() < 18 ? 'd' : 'n'
        },
        dt_txt: date.toISOString().replace('T', ' ').substring(0, 19)
      });
    }

    const demoForecast: ForecastData = {
      cod: '200',
      message: 0,
      cnt: 40,
      list: forecastItems,
      city: {
        id: 2643743,
        name: this.getLocationName(lat, lon),
        coord: { lat, lon },
        country: 'GB',
        population: 1000000,
        timezone: 0,
        sunrise: Date.now() / 1000 - 3600 * 2,
        sunset: Date.now() / 1000 + 3600 * 8
      }
    };

    return of(demoForecast);
  }

  private getLocationName(lat: number, lon: number): string {
    // Simple location mapping for demo
    if (lat > 51 && lat < 52 && lon > -1 && lon < 0) return 'London';
    if (lat > 40 && lat < 41 && lon > -74 && lon < -73) return 'New York';
    if (lat > 48 && lat < 49 && lon > 2 && lon < 3) return 'Paris';
    return 'Unknown Location';
  }

  getWeatherIconUrl(icon: string): string {
    return `https://openweathermap.org/img/wn/${icon}@2x.png`;
  }
}
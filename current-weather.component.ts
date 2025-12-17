import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';

import { WeatherService } from '../../services/weather.service';
import { WeatherData, WeatherLocation, LocationData } from '../../models/weather.model';

@Component({
  selector: 'app-current-weather',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './current-weather.component.html',
  styleUrls: ['./current-weather.component.css']
})
export class CurrentWeatherComponent implements OnInit, OnDestroy {
  currentWeather?: WeatherData;
  currentLocation?: WeatherLocation;
  loading = false;
  error?: string;
  
  searchQuery = '';
  searchResults: LocationData[] = [];
  searching = false;
  showSearchResults = false;

  private destroy$ = new Subject<void>();
  private searchSubject = new Subject<string>();

  constructor(private weatherService: WeatherService) {}

  ngOnInit(): void {
    this.initializeSearch();
    this.loadCurrentLocationWeather();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeSearch(): void {
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(query => {
      if (query.length >= 3) {
        this.performSearch(query);
      } else {
        this.searchResults = [];
        this.showSearchResults = false;
      }
    });
  }

  private loadCurrentLocationWeather(): void {
    this.weatherService.currentLocation$
      .pipe(takeUntil(this.destroy$))
      .subscribe(location => {
        if (location) {
          this.currentLocation = location;
          this.loadWeather(location.lat, location.lon);
        }
      });
  }

  private loadWeather(lat: number, lon: number): void {
    this.loading = true;
    this.error = undefined;

    this.weatherService.getCurrentWeather(lat, lon)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (weather) => {
          this.currentWeather = weather;
          this.loading = false;
        },
        error: (error) => {
          this.error = 'Failed to load weather data';
          this.loading = false;
          console.error('Error loading weather:', error);
        }
      });
  }

  onSearchInput(): void {
    this.searchSubject.next(this.searchQuery);
  }

  private performSearch(query: string): void {
    this.searching = true;
    
    this.weatherService.searchLocations(query)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (results) => {
          this.searchResults = results;
          this.showSearchResults = true;
          this.searching = false;
        },
        error: (error) => {
          console.error('Search error:', error);
          this.searching = false;
          this.searchResults = [];
        }
      });
  }

  selectLocation(location: LocationData): void {
    const weatherLocation: WeatherLocation = {
      name: location.display_name.split(',')[0],
      lat: parseFloat(location.lat),
      lon: parseFloat(location.lon)
    };

    this.weatherService.setCurrentLocation(weatherLocation);
    this.searchQuery = '';
    this.showSearchResults = false;
    this.searchResults = [];
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.showSearchResults = false;
    this.searchResults = [];
  }

  useCurrentLocation(): void {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location: WeatherLocation = {
            name: 'Current Location',
            lat: position.coords.latitude,
            lon: position.coords.longitude
          };
          this.weatherService.setCurrentLocation(location);
        },
        (error) => {
          console.error('Geolocation error:', error);
          this.error = 'Unable to access your location';
        }
      );
    } else {
      this.error = 'Geolocation is not supported by this browser';
    }
  }

  refreshWeather(): void {
    if (this.currentLocation) {
      this.loadWeather(this.currentLocation.lat, this.currentLocation.lon);
    }
  }

  getWeatherIconUrl(icon: string): string {
    return this.weatherService.getWeatherIconUrl(icon);
  }

  formatTime(timestamp: number): string {
    return new Date(timestamp * 1000).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getWindDirection(deg: number): string {
    const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE',
                       'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
    return directions[Math.round(deg / 22.5) % 16];
  }
}
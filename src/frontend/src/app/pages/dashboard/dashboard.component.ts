import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Subject, takeUntil, combineLatest } from 'rxjs';

import { WeatherService } from '../../services/weather.service';
import { WeatherData, WeatherLocation } from '../../models/weather.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit, OnDestroy {
  currentWeather?: WeatherData;
  currentLocation?: WeatherLocation;
  loading = false;
  error?: string;
  private destroy$ = new Subject<void>();

  constructor(private weatherService: WeatherService) {}

  ngOnInit(): void {
    this.loadWeatherData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadWeatherData(): void {
    this.loading = true;
    this.error = undefined;

    this.weatherService.currentLocation$
      .pipe(takeUntil(this.destroy$))
      .subscribe(location => {
        if (location) {
          this.currentLocation = location;
          this.loadCurrentWeather(location.lat, location.lon);
        }
      });
  }

  private loadCurrentWeather(lat: number, lon: number): void {
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

  getWeatherIconUrl(icon: string): string {
    return this.weatherService.getWeatherIconUrl(icon);
  }

  refreshWeather(): void {
    if (this.currentLocation) {
      this.loadCurrentWeather(this.currentLocation.lat, this.currentLocation.lon);
    }
  }
}
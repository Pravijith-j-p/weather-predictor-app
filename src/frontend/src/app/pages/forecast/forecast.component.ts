import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { Chart, ChartConfiguration, ChartType, registerables } from 'chart.js';

import { WeatherService } from '../../services/weather.service';
import { ForecastData, ForecastItem, WeatherLocation } from '../../models/weather.model';

Chart.register(...registerables);

@Component({
  selector: 'app-forecast',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './forecast.component.html',
  styleUrls: ['./forecast.component.css']
})
export class ForecastComponent implements OnInit, OnDestroy {
  @ViewChild('tempChart', { static: false }) tempChart!: ElementRef<HTMLCanvasElement>;
  @ViewChild('humidityChart', { static: false }) humidityChart!: ElementRef<HTMLCanvasElement>;

  forecastData?: ForecastData;
  currentLocation?: WeatherLocation;
  loading = false;
  error?: string;
  
  dailyForecasts: any[] = [];
  selectedDay?: any;
  
  private destroy$ = new Subject<void>();
  private tempChartInstance?: Chart;
  private humidityChartInstance?: Chart;

  constructor(private weatherService: WeatherService) {}

  ngOnInit(): void {
    this.loadForecastData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.destroyCharts();
  }

  private loadForecastData(): void {
    this.loading = true;
    this.error = undefined;

    this.weatherService.currentLocation$
      .pipe(takeUntil(this.destroy$))
      .subscribe(location => {
        if (location) {
          this.currentLocation = location;
          this.loadForecast(location.lat, location.lon);
        }
      });
  }

  private loadForecast(lat: number, lon: number): void {
    this.weatherService.getForecast(lat, lon)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (forecast) => {
          this.forecastData = forecast;
          this.processForecastData();
          this.loading = false;
          setTimeout(() => this.createCharts(), 100);
        },
        error: (error) => {
          this.error = 'Failed to load forecast data';
          this.loading = false;
          console.error('Error loading forecast:', error);
        }
      });
  }

  private processForecastData(): void {
    if (!this.forecastData) return;

    const dailyData = new Map<string, ForecastItem[]>();
    
    this.forecastData.list.forEach(item => {
      const date = item.dt_txt.split(' ')[0];
      if (!dailyData.has(date)) {
        dailyData.set(date, []);
      }
      dailyData.get(date)!.push(item);
    });

    this.dailyForecasts = Array.from(dailyData.entries()).slice(0, 5).map(([date, items]) => {
      const dayItems = items.sort((a, b) => a.dt - b.dt);
      const temps = dayItems.map(item => item.main.temp);
      const minTemp = Math.min(...temps);
      const maxTemp = Math.max(...temps);
      
      // Get midday forecast for main conditions
      const middayItem = dayItems.find(item => {
        const hour = parseInt(item.dt_txt.split(' ')[1].split(':')[0]);
        return hour >= 12 && hour <= 15;
      }) || dayItems[Math.floor(dayItems.length / 2)];

      return {
        date,
        dateObj: new Date(date),
        items: dayItems,
        minTemp,
        maxTemp,
        mainCondition: middayItem.weather[0],
        avgHumidity: Math.round(dayItems.reduce((sum, item) => sum + item.main.humidity, 0) / dayItems.length),
        avgPressure: Math.round(dayItems.reduce((sum, item) => sum + item.main.pressure, 0) / dayItems.length),
        avgWindSpeed: dayItems.reduce((sum, item) => sum + item.wind.speed, 0) / dayItems.length,
        precipitationProb: Math.max(...dayItems.map(item => item.pop)) * 100
      };
    });

    this.selectedDay = this.dailyForecasts[0];
  }

  private createCharts(): void {
    if (!this.forecastData) return;

    this.createTemperatureChart();
    this.createHumidityChart();
  }

  private createTemperatureChart(): void {
    if (this.tempChartInstance) {
      this.tempChartInstance.destroy();
    }

    const ctx = this.tempChart.nativeElement.getContext('2d');
    if (!ctx) return;

    const last24Hours = this.forecastData!.list.slice(0, 8);
    const labels = last24Hours.map(item => {
      const hour = parseInt(item.dt_txt.split(' ')[1].split(':')[0]);
      return `${hour}:00`;
    });
    const temperatures = last24Hours.map(item => Math.round(item.main.temp));

    const config: ChartConfiguration = {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'Temperature (°C)',
            data: temperatures,
            borderColor: '#74b9ff',
            backgroundColor: 'rgba(116, 185, 255, 0.1)',
            borderWidth: 3,
            fill: true,
            tension: 0.4,
            pointBackgroundColor: '#0984e3',
            pointBorderColor: '#ffffff',
            pointBorderWidth: 2,
            pointRadius: 6
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
            title: {
            display: true,
            text: '24-Hour Temperature Trend',
            color: '#2d3436',
            font: {
              size: 16,
              weight: 600
            }
          }
        },
        scales: {
          y: {
            beginAtZero: false,
            grid: {
              color: 'rgba(0, 0, 0, 0.1)'
            },
            ticks: {
              callback: function(value) {
                return value + '°C';
              }
            }
          },
          x: {
            grid: {
              color: 'rgba(0, 0, 0, 0.1)'
            }
          }
        }
      }
    };

    this.tempChartInstance = new Chart(ctx, config);
  }

  private createHumidityChart(): void {
    if (this.humidityChartInstance) {
      this.humidityChartInstance.destroy();
    }

    const ctx = this.humidityChart.nativeElement.getContext('2d');
    if (!ctx) return;

    const last24Hours = this.forecastData!.list.slice(0, 8);
    const labels = last24Hours.map(item => {
      const hour = parseInt(item.dt_txt.split(' ')[1].split(':')[0]);
      return `${hour}:00`;
    });
    const humidity = last24Hours.map(item => item.main.humidity);

    const config: ChartConfiguration = {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: 'Humidity (%)',
            data: humidity,
            backgroundColor: 'rgba(0, 184, 148, 0.7)',
            borderColor: '#00b894',
            borderWidth: 1,
            borderRadius: 4
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
            title: {
            display: true,
            text: '24-Hour Humidity Levels',
            color: '#2d3436',
            font: {
              size: 16,
              weight: 600
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            max: 100,
            grid: {
              color: 'rgba(0, 0, 0, 0.1)'
            },
            ticks: {
              callback: function(value) {
                return value + '%';
              }
            }
          },
          x: {
            grid: {
              color: 'rgba(0, 0, 0, 0.1)'
            }
          }
        }
      }
    };

    this.humidityChartInstance = new Chart(ctx, config);
  }

  private destroyCharts(): void {
    if (this.tempChartInstance) {
      this.tempChartInstance.destroy();
    }
    if (this.humidityChartInstance) {
      this.humidityChartInstance.destroy();
    }
  }

  selectDay(day: any): void {
    this.selectedDay = day;
  }

  refreshForecast(): void {
    if (this.currentLocation) {
      this.loadForecast(this.currentLocation.lat, this.currentLocation.lon);
    }
  }

  getWeatherIconUrl(icon: string): string {
    return this.weatherService.getWeatherIconUrl(icon);
  }

  getDayName(dateObj: Date): string {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    if (dateObj.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (dateObj.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    } else {
      return dateObj.toLocaleDateString('en-US', { weekday: 'short' });
    }
  }

  formatTime(timestamp: number): string {
    return new Date(timestamp * 1000).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getAverageTemperature(): number {
    if (!this.dailyForecasts.length) return 0;
    return this.dailyForecasts.reduce((sum, day) => sum + ((day.maxTemp + day.minTemp) / 2), 0) / this.dailyForecasts.length;
  }

  getMinHumidity(): number {
    if (!this.dailyForecasts.length) return 0;
    return Math.min(...this.dailyForecasts.map(day => day.avgHumidity));
  }

  getMaxHumidity(): number {
    if (!this.dailyForecasts.length) return 0;
    return Math.max(...this.dailyForecasts.map(day => day.avgHumidity));
  }

  hasHighRainChance(): boolean {
    return this.dailyForecasts.some(day => day.precipitationProb > 50);
  }

  hasModerateRainChance(): boolean {
    return !this.hasHighRainChance() && this.dailyForecasts.some(day => day.precipitationProb > 20);
  }

  hasClearSkies(): boolean {
    return !this.dailyForecasts.some(day => day.precipitationProb > 20);
  }
}
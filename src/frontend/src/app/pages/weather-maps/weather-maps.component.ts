import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';

import { WeatherService } from '../../services/weather.service';
import { WeatherLocation } from '../../models/weather.model';

interface MapLayer {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
}

@Component({
  selector: 'app-weather-maps',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './weather-maps.component.html',
  styleUrls: ['./weather-maps.component.css']
})
export class WeatherMapsComponent implements OnInit, OnDestroy {
  currentLocation?: WeatherLocation;
  selectedLayer: string = 'temperature';
  mapZoom: number = 6;
  
  mapLayers: MapLayer[] = [
    {
      id: 'temperature',
      name: 'Temperature',
      description: 'Current temperature across regions',
      icon: '🌡️',
      color: '#ff6b6b'
    },
    {
      id: 'precipitation',
      name: 'Precipitation',
      description: 'Rainfall and snow patterns',
      icon: '☔',
      color: '#74b9ff'
    },
    {
      id: 'clouds',
      name: 'Cloud Cover',
      description: 'Cloud coverage and density',
      icon: '☁️',
      color: '#95a5a6'
    },
    {
      id: 'wind',
      name: 'Wind Speed',
      description: 'Wind patterns and speed',
      icon: '💨',
      color: '#00b894'
    },
    {
      id: 'pressure',
      name: 'Pressure',
      description: 'Atmospheric pressure systems',
      icon: '🔽',
      color: '#6c5ce7'
    },
    {
      id: 'humidity',
      name: 'Humidity',
      description: 'Relative humidity levels',
      icon: '💧',
      color: '#00cec9'
    }
  ];

  predefinedLocations = [
    { name: 'Global View', lat: 20, lon: 0, zoom: 2 },
    { name: 'North America', lat: 45, lon: -100, zoom: 3 },
    { name: 'Europe', lat: 50, lon: 10, zoom: 4 },
    { name: 'Asia', lat: 30, lon: 100, zoom: 3 },
    { name: 'Australia', lat: -25, lon: 135, zoom: 4 }
  ];

  private destroy$ = new Subject<void>();

  constructor(private weatherService: WeatherService) {}

  ngOnInit(): void {
    this.loadCurrentLocation();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadCurrentLocation(): void {
    this.weatherService.currentLocation$
      .pipe(takeUntil(this.destroy$))
      .subscribe(location => {
        this.currentLocation = location || undefined;
      });
  }

  selectLayer(layerId: string): void {
    this.selectedLayer = layerId;
  }

  getSelectedLayer(): MapLayer {
    return this.mapLayers.find(layer => layer.id === this.selectedLayer) || this.mapLayers[0];
  }

  zoomIn(): void {
    if (this.mapZoom < 10) {
      this.mapZoom++;
    }
  }

  zoomOut(): void {
    if (this.mapZoom > 1) {
      this.mapZoom--;
    }
  }

  jumpToLocation(location: any): void {
    this.mapZoom = location.zoom;
    // In a real implementation, this would center the map on the location
  }

  centerOnCurrentLocation(): void {
    if (this.currentLocation) {
      this.mapZoom = 8;
      // In a real implementation, this would center the map on current location
    }
  }

  getOpenWeatherMapUrl(): string {
    const layer = this.selectedLayer;
    const zoom = this.mapZoom;
    const lat = this.currentLocation?.lat || 20;
    const lon = this.currentLocation?.lon || 0;
    
    // OpenWeatherMap tile layer URLs (these work with the free API)
    const layerMappings: { [key: string]: string } = {
      'temperature': 'temp_new',
      'precipitation': 'precipitation_new',
      'clouds': 'clouds_new',
      'wind': 'wind_new',
      'pressure': 'pressure_new',
      'humidity': 'humidity_new'
    };

    const mapLayer = layerMappings[layer] || 'temp_new';
    
    // Return a static image URL for demonstration
    return `https://tile.openweathermap.org/map/${mapLayer}/${zoom}/${Math.floor((lon + 180) / 360 * Math.pow(2, zoom))}/${Math.floor((1 - Math.log(Math.tan(lat * Math.PI / 180) + 1 / Math.cos(lat * Math.PI / 180)) / Math.PI) / 2 * Math.pow(2, zoom))}.png?appid=YOUR_API_KEY`;
  }

  getLayerInfo(): string {
    const layer = this.getSelectedLayer();
    switch (layer.id) {
      case 'temperature':
        return 'Shows current temperature distribution. Red areas are warmer, blue areas are cooler.';
      case 'precipitation':
        return 'Displays current and forecasted precipitation. Blue indicates rain, white indicates snow.';
      case 'clouds':
        return 'Shows cloud coverage density. Darker areas have more cloud cover.';
      case 'wind':
        return 'Visualizes wind speed and direction. Arrows show direction, colors show intensity.';
      case 'pressure':
        return 'Displays atmospheric pressure systems. High pressure (H) and low pressure (L) areas.';
      case 'humidity':
        return 'Shows relative humidity levels. Higher values indicate more moisture in the air.';
      default:
        return 'Weather data visualization for the selected layer.';
    }
  }

  refreshMap(): void {
    // In a real implementation, this would refresh the map data
    console.log('Refreshing map data...');
  }
}
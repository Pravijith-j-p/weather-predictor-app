import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';

import { WeatherService } from '../../services/weather.service';
import { LocationData, WeatherLocation } from '../../models/weather.model';

interface SavedLocation extends WeatherLocation {
  id: string;
  savedAt: Date;
}

@Component({
  selector: 'app-location-search',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './location-search.component.html',
  styleUrls: ['./location-search.component.css']
})
export class LocationSearchComponent implements OnInit, OnDestroy {
  searchQuery = '';
  searchResults: LocationData[] = [];
  searching = false;
  showSearchResults = false;
  
  currentLocation?: WeatherLocation;
  savedLocations: SavedLocation[] = [];
  recentSearches: LocationData[] = [];
  
  popularCities: WeatherLocation[] = [
    { name: 'New York', lat: 40.7128, lon: -74.0060, country: 'US' },
    { name: 'London', lat: 51.5074, lon: -0.1278, country: 'GB' },
    { name: 'Paris', lat: 48.8566, lon: 2.3522, country: 'FR' },
    { name: 'Tokyo', lat: 35.6762, lon: 139.6503, country: 'JP' },
    { name: 'Sydney', lat: -33.8688, lon: 151.2093, country: 'AU' },
    { name: 'Dubai', lat: 25.2048, lon: 55.2708, country: 'AE' },
    { name: 'Mumbai', lat: 19.0760, lon: 72.8777, country: 'IN' },
    { name: 'São Paulo', lat: -23.5558, lon: -46.6396, country: 'BR' }
  ];

  private destroy$ = new Subject<void>();
  private searchSubject = new Subject<string>();

  constructor(private weatherService: WeatherService) {}

  ngOnInit(): void {
    this.initializeSearch();
    this.loadCurrentLocation();
    this.loadSavedData();
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

  private loadCurrentLocation(): void {
    this.weatherService.currentLocation$
      .pipe(takeUntil(this.destroy$))
      .subscribe(location => {
        this.currentLocation = location || undefined;
      });
  }

  private loadSavedData(): void {
    // Load from localStorage
    const saved = localStorage.getItem('weatherApp_savedLocations');
    if (saved) {
      this.savedLocations = JSON.parse(saved);
    }

    const recent = localStorage.getItem('weatherApp_recentSearches');
    if (recent) {
      this.recentSearches = JSON.parse(recent);
    }
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
      name: this.formatLocationName(location.display_name),
      lat: parseFloat(location.lat),
      lon: parseFloat(location.lon),
      country: this.extractCountry(location.display_name)
    };

    this.weatherService.setCurrentLocation(weatherLocation);
    this.addToRecentSearches(location);
    this.clearSearch();
  }

  selectSavedLocation(location: SavedLocation): void {
    const weatherLocation: WeatherLocation = {
      name: location.name,
      lat: location.lat,
      lon: location.lon,
      country: location.country
    };

    this.weatherService.setCurrentLocation(weatherLocation);
  }

  selectPopularCity(city: WeatherLocation): void {
    this.weatherService.setCurrentLocation(city);
  }

  saveCurrentLocation(): void {
    if (!this.currentLocation) return;

    const savedLocation: SavedLocation = {
      ...this.currentLocation,
      id: Date.now().toString(),
      savedAt: new Date()
    };

    // Check if already saved
    if (!this.savedLocations.find(loc => 
      Math.abs(loc.lat - savedLocation.lat) < 0.01 && 
      Math.abs(loc.lon - savedLocation.lon) < 0.01
    )) {
      this.savedLocations.unshift(savedLocation);
      
      // Limit to 10 saved locations
      if (this.savedLocations.length > 10) {
        this.savedLocations = this.savedLocations.slice(0, 10);
      }
      
      this.saveSavedLocations();
    }
  }

  removeSavedLocation(locationId: string): void {
    this.savedLocations = this.savedLocations.filter(loc => loc.id !== locationId);
    this.saveSavedLocations();
  }

  private addToRecentSearches(location: LocationData): void {
    // Remove if already exists
    this.recentSearches = this.recentSearches.filter(search => 
      search.place_id !== location.place_id
    );
    
    // Add to beginning
    this.recentSearches.unshift(location);
    
    // Limit to 5 recent searches
    if (this.recentSearches.length > 5) {
      this.recentSearches = this.recentSearches.slice(0, 5);
    }
    
    localStorage.setItem('weatherApp_recentSearches', JSON.stringify(this.recentSearches));
  }

  private saveSavedLocations(): void {
    localStorage.setItem('weatherApp_savedLocations', JSON.stringify(this.savedLocations));
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
        }
      );
    }
  }

  private formatLocationName(displayName: string): string {
    return displayName.split(',')[0];
  }

  private extractCountry(displayName: string): string {
    const parts = displayName.split(',');
    return parts[parts.length - 1].trim();
  }

  formatSavedDate(date: Date): string {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  }
}
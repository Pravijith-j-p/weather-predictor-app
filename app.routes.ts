import { Routes } from '@angular/router';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { CurrentWeatherComponent } from './pages/current-weather/current-weather.component';
import { ForecastComponent } from './pages/forecast/forecast.component';
import { LocationSearchComponent } from './pages/location-search/location-search.component';
import { WeatherMapsComponent } from './pages/weather-maps/weather-maps.component';

export const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'current-weather', component: CurrentWeatherComponent },
  { path: 'forecast', component: ForecastComponent },
  { path: 'location-search', component: LocationSearchComponent },
  { path: 'weather-maps', component: WeatherMapsComponent },
  { path: '**', redirectTo: '/dashboard' }
];

import { Routes } from '@angular/router';
import { WindyPageComponent } from './windy-page/windy-page.component';
import { GribPageComponent } from './grib-page/grib-page.component';

export const routes: Routes = [
  { path: 'windy', loadComponent: () => WindyPageComponent },
  { path: 'grib', loadComponent: () => GribPageComponent },
];

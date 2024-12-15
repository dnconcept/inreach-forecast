import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { WindyPageComponent } from './app/windy-page/windy-page.component';

bootstrapApplication(WindyPageComponent, appConfig)
  .catch((err) => console.error(err));

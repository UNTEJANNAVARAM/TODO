import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { NavbarComponent } from './components/navbar/navbar';

export const appConfig = {
  providers: [provideRouter(routes)],
  standaloneComponents: [NavbarComponent]
};

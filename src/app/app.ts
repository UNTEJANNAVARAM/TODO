import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { environment } from '../environments/environment';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `<router-outlet></router-outlet>`
})
export class AppComponent {
  constructor() {
    console.log('🌐 Angular App Started');
    console.log('Environment:', environment.production ? 'PRODUCTION' : 'DEVELOPMENT');
    console.log('Auth API URL:', environment.authApiUrl);
    console.log('Task API URL:', environment.taskApiUrl);
    console.log('Build time:', new Date());
  }
}

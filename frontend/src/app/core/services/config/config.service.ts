import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';

@Injectable({
    providedIn: 'root',
})
export class ConfigService {
    isProd = environment.production;
    apiUrl = environment.apiUrl;
}

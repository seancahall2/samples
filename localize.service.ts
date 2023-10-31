import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root'
})
export class LocalizeService {

    constructor() { }

    readonly METERS_PER_MILE = 1609.344;
    readonly KILOMETERS_PER_MILE = 1.609344;
    readonly MILES_PER_KILOMETER = 0.621371;
    readonly SECONDS_PER_HOUR = 3600.0;
    readonly KILOPASCAL_PER_PSI = 6.89476;

    languageDisplay = {
        'us': { code: 'en-US', language: 'English' },
        'mx': { code: 'es-MX', language: 'Español' },
        'it': { code: 'it', language: 'Italiano' },
        'cn': { code: 'zh_CN', language: '华语' }
    }

    defaultLanguage = 'en-US';

    getDisplaySpeed(currentLanguage, speed) {
        return currentLanguage.includes('US') ? (speed / this.KILOMETERS_PER_MILE).toFixed(0) : speed.toFixed(0);
    }

    getDisplayOdometer(currentLanguage, odometer) {
        return currentLanguage.includes('US') ? (odometer / this.METERS_PER_MILE).toFixed(0) : (odometer / 1000).toFixed(0);
    }

    // kPa value = psi value x 68.9476
    getTirePressure(currentLanguage, pressure) {
        return currentLanguage.includes('US') ? pressure : pressure * this.KILOPASCAL_PER_PSI;
    }

    getTemperature(currentLanguage, temperature) {
        return currentLanguage.includes('US') ? temperature : (temperature - 32) * 5 / 9;
    }

    getCustomLabels(showLanguage) {
        if (showLanguage === 'true') {
            return {
                'us': 'English',
                'mx': 'Español',
                'it': 'Italiano',
                'cn': '华语'
            }
        } else {
            return {
                'us': 'US',
                'mx': 'MX',
                'it': 'IT',
                'cn': 'CN'
            }
        };
    }

    getShortCountryCodes() {
        return ['us', 'mx', 'it', 'cn'];
    }

    getLongCountryCodes() {
        return ['en-US', 'es-MX', 'it', 'zh_CN'];
    }

    getCountryCode(shortCode) {
        return this.languageDisplay[shortCode].code;
    }

    doGoggleMap(language) {
        if (!document.getElementById('google')) {
            const script = document.createElement('script');
            script.type = 'text/javascript';
            script.src = environment.googleMapsApi +
                '&language=' + language;
            script.id = 'google';
            document.body.appendChild(script);
        } else {
            const temp = document.getElementById('google');
            temp.remove();
            this.doGoggleMap(language);
        }
    }
}

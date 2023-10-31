import { Pipe, PipeTransform } from '@angular/core';
import * as timeago from 'timeago.js';
import { TranslateService } from '@ngx-translate/core';
import { TenantState } from 'src/app/store/state/tenant.state';
import { Select } from '@ngxs/store';
import { Observable, throwError } from 'rxjs';
@Pipe({
    name: 'timeAgo'
})
export class TimeAgoPipe implements PipeTransform {
    @Select(TenantState.getLanguage) getLanguage: Observable<string>;
    languageSubscription: any;
    localizer = {
        'it': this.localeIt,
        'es-MX': this.localeMx,
        'zh_CN': this.localeZh
    }

    constructor(private translateService: TranslateService) {
        this.languageSubscription = this.getLanguage.subscribe(language => {
            timeago.register(language, this.localizer[language]);
        })
    }

    transform(data: any): string {
        const currentLanguage = this.translateService.currentLang ? this.translateService.currentLang : "en-US";
        return data ? timeago.format(data, currentLanguage) : '';
    }

    localeMx(number, index, total_sec) {
        return [
            ['justo ahora', 'en un rato'],
            ['hace %s segundos', 'en %s segundos'],
            ['hace 1 minuto', 'en 1 minuto'],
            ['hace %s minutos', 'en %s minutos'],
            ['hace 1 hora', 'en 1 hora'],
            ['hace %s horas', 'en %s horas'],
            ['hace 1 día', 'en 1 día'],
            ['hace %s días', 'en %s días'],
            ['hace 1 semana', 'en 1 semana'],
            ['hace %s semanas', 'en %s semanas'],
            ['hace 1 mes', 'en 1 mes'],
            ['hace %s meses', 'en %s meses'],
            ['hace 1 año', 'en 1 año'],
            ['hace %s años', 'en %s años'],
        ][index] as [string, string];
    };

    localeIt(number, index, total_sec) {
        return [
            ['poco fa', 'fra poco'],
            ['%s secondi fa', 'in %s secondi'],
            ['un minuto fa', 'fra un minuto'],
            ['%s minuti fa', 'fra %s minuti'],
            ["un'ora fa", "fra un'ora"],
            ['%s ore fa', 'fra %s ore'],
            ['un giorno fa', 'fra un giorno'],
            ['%s giorni fa', 'fra %s giorni'],
            ['una settimana fa', 'fra una settimana'],
            ['%s settimane fa', 'fra %s settimane'],
            ['un mese fa', 'fra un mese'],
            ['%s mesi fa', 'fra %s mesi'],
            ['un anno fa', 'fra un anno'],
            ['%s anni fa', 'fra %s anni'],
        ][index] as [string, string];
    };

    localeZh(diff: number, idx: number): [string, string] {
        const ZH_CN = ['秒', '分钟', '小时', '天', '周', '个月', '年'];
        if (idx === 0) return ['刚刚', '片刻后'];
        const unit = ZH_CN[~~(idx / 2)];
        return [`${diff} ${unit}前`, `${diff} ${unit}后`];
    }

}

import { Router } from '@angular/router';
import { AuthService } from './auth.service';
import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, from } from 'rxjs';
import { environment } from 'src/environments/environment';
import { catchError } from 'rxjs/operators'
import { ToastGlobalService } from 'src/app/shared/toast-global/toast-global.service';
export const skipList = ['uploadLogo'];

@Injectable({
    providedIn: 'root'
})
export class AuthInterceptorService implements HttpInterceptor {

    constructor(
        private _authService: AuthService,
        private _router: Router,
        private toastGlobalService: ToastGlobalService
    ) { }

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        // determine if this url does not need a token
        if (skipList.some(function (item) { return req.url.indexOf(item) >= 0; })) {
            return next.handle(req);
        }
        return from(
            this._authService.getAccessToken()
                .then(token => {
                    return next.handle(this.addTokenToRequest(
                        req,
                        token
                    ))
                        .pipe(
                            catchError((err: HttpErrorResponse) => {
                                const env = environment.apiServer;
                                if (err && (err.status === 401 || err.status === 403)) {
                                    this._router.navigate(['/unauthorized']);
                                }
                                let errorMessage = null;
                                if (err.error instanceof ErrorEvent) {
                                    errorMessage = `Error: ${err.error.message}`;
                                } else if (err instanceof HttpErrorResponse) {
                                    errorMessage = `Error Status ${err.status}: ${err.message}`;
                                }
                                // if (env.includes('dev') || env.includes('localhost')) {
                                //   this.toastGlobalService.show(errorMessage, { classname: 'error' });
                                // }
                                console.error(errorMessage ? errorMessage : err);
                                throw 'error in a request ' + err.status;
                            })
                        ).toPromise();
                })
        );
    }

    addTokenToRequest(req: HttpRequest<any>, token: string): HttpRequest<any> {
        return req.clone({
            setHeaders: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Authorization': 'Bearer ' + token
            }
        });
    }

}
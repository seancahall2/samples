// import { EventManagementService } from './event.mamagement.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, OnInit } from '@angular/core';
import { AuthService } from 'src/app/shared/services/auth.service';
import { Observable, throwError } from 'rxjs';
import { catchError, share, tap } from 'rxjs/operators';
import { SelectSnapshot } from '@ngxs-labs/select-snapshot';
import { TenantState } from 'src/app/store/state/tenant.state';
import { Tenant } from 'src/app/models/tenant';
import { environment } from 'src/environments/environment';
@Injectable({ providedIn: 'root' })
export class ApiDataService {
    @SelectSnapshot(TenantState.getCurrentTenant) getCurrentTenant: Tenant;
    externalId: string;
    constructor(
        private readonly http: HttpClient,
        private authService: AuthService
    ) { }

    buildUrl(
        controller: string,
        version: string = 'v1'): string {
        this.externalId = this.getCurrentTenant.externalId;
        return `${environment.apiServer}/${version}/${this.externalId}/${controller}`;
    }

    buildGetUrl(
        controller: string,
        jsonFilter: string,
        jsonSort: string,
        offset: number,
        limit: number,
        version: string = 'v1'): string {

        this.externalId = this.getCurrentTenant.externalId;
        offset = parseInt(offset.toString().replace(/\,/g, ''), 10);
        limit = parseInt(limit.toString().replace(/\,/g, ''), 10);

        return `${environment.apiServer}/${version}/${this.externalId}/${controller}`
            + '?jsonFilter=' + JSON.stringify(jsonFilter)
            + '&jsonSort=' + JSON.stringify(jsonSort)
            + '&offset=' + offset
            + '&limit=' + limit;
    }

    get<T>(path: string): Observable<any> {
        return this.http.get<T>(`${path}`).pipe(
            tap((data: any) => {
                this.errorHandler(data);
            }),
            share(), // change the observable from COLD to hot!
            catchError((e) => {
                this.exceptionHandler(e);
                return throwError(e);
            })
        );
    }

    post<T>(path: string, params: any): Observable<any> {
        if (params === undefined) {
            params = {};
        }

        return this.http.post<T>(`${path}`, params).pipe(
            tap((data: any) => {
                this.errorHandler(data);
            }),
            share(), // change the observable from COLD to hot!
            catchError((e) => {
                this.exceptionHandler(e);
                return throwError(e);
            })
        );
    }

    put<T>(path: string, params: any): Observable<any> {
        if (params === undefined) {
            params = {};
        }

        return this.http.put<T>(`${path}`, params).pipe(
            tap((data: any) => {
                this.errorHandler(data);
            }),
            share(), // change the observable from COLD to hot!
            catchError((e) => {
                this.exceptionHandler(e);
                return throwError(e);
            })
        );
    }

    delete<T>(path: string, params: any): Observable<any> {
        if (params === undefined) {
            params = {};
        }
        const options = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
            }),
            body:
                params,
        };
        return this.http.delete<T>(`${path}`, options).pipe(
            tap((data: any) => {
                this.errorHandler(data);
            }),
            share(), // change the observable from COLD to hot!
            catchError((e) => {
                this.exceptionHandler(e);
                return throwError(e);
            })
        );
    }

    uploadFile(path: string, params: any): Observable<any> {
        if (params === undefined) {
            params = {};
        }

        const token = this.authService.getAuthorizationHeaderValue();

        const requestHeaders = new HttpHeaders(
            {
                'Access-Control-Allow-Origin': '*',
                'Authorization': token
            });

        return this.http.post(`${path}`, params, { headers: requestHeaders }).pipe(
            tap((data: any) => {
                this.errorHandler(data);
            }),
            share(), // change the observable from COLD to hot!
            catchError((e) => {
                this.exceptionHandler(e);
                return throwError(e);
            })
        );
    }

    private errorHandler(data: any): void {
        // console.log(data);
        if (data != null && !data.Success) {
        }
    }

    private exceptionHandler(err: any): void {
        console.log(err);
    }
}

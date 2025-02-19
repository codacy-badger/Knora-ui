import { HttpClient, HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { ApiServiceError, KuiCoreConfigToken } from '@knora/core';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { SessionService } from './session/session.service';

/**
 * Authentication service includes the login, logout method and a session method to check if a user is logged in or not.
 */
@Injectable({
    providedIn: 'root'
})
export class AuthenticationService {

    constructor(public http: HttpClient,
                private _session: SessionService,
                @Inject(KuiCoreConfigToken) public config) {

        // console.log('AuthenticationService constructor: config', config);
    }

    /**
     * validate if a user is logged in or not
     * returns true if the session is active
     *
     * @returns boolean
     */
    session(): boolean {
        return this._session.validateSession();
    }

    /**
     * update the session storage
     * @param jwt
     * @param username
     *
     * @returns boolean
     */
    updateSession(jwt: string, username: string): boolean {
        if (jwt && username) {
            this._session.setSession(jwt, username);
            return true;
        } else {
            return false;
        }
    }

    /**
     * login process;
     * it's used by the login component
     *
     * @param {string} identifier email or username
     * @param {string} password
     * @returns Observable<any>
     */
    login(username: string, password: string): Observable<any> {

        // console.log('AuthenticationService - login - api: ', this.config.api);

        return this.http.post(
            this.config.api + '/v2/authentication',
            {username: username, password: password},
            {observe: 'response'}).pipe(
                map((response: HttpResponse<any>): any => {
                    return response;
                }),
                catchError((error: HttpErrorResponse) => {

                    return this.handleRequestError(error);
                })
            );
    }


    /**
     * logout the user by destroying the session
     *
     * @param
     */
    logout() {
        // destroy the session
        localStorage.removeItem('session');
    }


    /**
     * @ignore
     * handle request error in case of server error
     *
     * @param error
     * @returns
     */
    protected handleRequestError(error: HttpErrorResponse): Observable<ApiServiceError> {
        const serviceError = new ApiServiceError();
        serviceError.status = error.status;
        serviceError.statusText = error.statusText;
        serviceError.errorInfo = error.message;
        serviceError.url = error.url;
        return throwError(serviceError);
    }
}

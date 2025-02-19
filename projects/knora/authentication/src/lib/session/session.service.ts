import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { ApiServiceError, KnoraConstants, KuiCoreConfigToken, User, UsersService } from '@knora/core';
import { Session } from '../declarations';

import * as momentImported from 'moment';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

const moment = momentImported;


@Injectable({
    providedIn: 'root'
})
export class SessionService {

    public session: Session;

    /**
     * max session time in milliseconds
     * default value (24h): 86400000
     *
     */
    readonly MAX_SESSION_TIME: number = 86400000; // 1d = 24 * 60 * 60 * 1000

    constructor(
        private _http: HttpClient,
        @Inject(KuiCoreConfigToken) public config,
        private _users: UsersService) {
    }

    /**
     * set the session by using the json web token (jwt) and the user object;
     * it will be used in the login process
     *
     * @param jwt
     * @param username
     */
    setSession(jwt: string, username: string) {

        this.session = {
            id: this.setTimestamp(),
            user: {
                name: username,
                jwt: jwt,
                lang: 'en',
                sysAdmin: false,
                projectAdmin: []
            }
        };
        // store in the localStorage
        localStorage.setItem('session', JSON.stringify(this.session));

        // get user information
        this._users.getUserByUsername(username).subscribe(
            (result: User) => {
                let sysAdmin: boolean = false;
                const projectAdmin: string[] = [];

                const groupsPerProjectKeys: string[] = Object.keys(result.permissions.groupsPerProject);

                for (const key of groupsPerProjectKeys) {
                    if (key === KnoraConstants.SystemProjectIRI) {
                        sysAdmin = result.permissions.groupsPerProject[key].indexOf(KnoraConstants.SystemAdminGroupIRI) > -1;
                    }

                    if (result.permissions.groupsPerProject[key].indexOf(KnoraConstants.ProjectAdminGroupIRI) > -1) {
                        projectAdmin.push(key);
                    }
                }

                // define a session id, which is the timestamp of login
                this.session = {
                    id: this.setTimestamp(),
                    user: {
                        name: result.username,
                        jwt: jwt,
                        lang: result.lang,
                        sysAdmin: sysAdmin,
                        projectAdmin: projectAdmin
                    }
                };
                // store in the localStorage
                localStorage.setItem('session', JSON.stringify(this.session));

            },
            (error: ApiServiceError) => {
                console.error(error);
            }
        );
    }

    private setTimestamp() {
        return (moment().add(0, 'second')).valueOf();
    }

    getSession() {

    }

    updateSession() {

    }

    validateSession() {
        // mix of checks with session.validation and this.authenticate
        this.session = JSON.parse(localStorage.getItem('session'));

        const tsNow: number = this.setTimestamp();

        if (this.session) {
            // the session exists
            // check if the session is still valid:
            // if session.id + MAX_SESSION_TIME > now: _session.validateSession()
            if (this.session.id + this.MAX_SESSION_TIME < tsNow) {
                // the internal session has expired
                // check if the api v2/authentication is still valid

                if (this.authenticate()) {
                    // the api authentication is valid;
                    // update the session.id
                    this.session.id = tsNow;

                    // localStorage.removeItem('session');
                    localStorage.setItem('session', JSON.stringify(this.session));
                    return true;

                } else {
                    // console.error('session.service -- validateSession -- authenticate: the session expired on API side');
                    // a user is not authenticated anymore!
                    this.destroySession();
                    return false;
                }

            } else {
                return true;
            }
        }
        return false;
    }


    private authenticate(): Observable<boolean> {
        return this._http.get(this.config.api + '/v2/authentication').pipe(
            map((result: any) => {

                // console.log('AuthenticationService - authenticate - result: ', result);
                // return true || false
                return result.status === 200;
            })
        );
    }

    destroySession() {
        localStorage.removeItem('session');
    }


}

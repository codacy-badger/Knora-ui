import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { ApiService } from '../api.service';
import {
    ApiServiceResult,
    Group,
    GroupsResponse,
    User,
    UserResponse,
    UsersResponse
} from '../../declarations/';

/**
 * This service uses the Knora admin API and handles all user data.
 */
@Injectable({
    providedIn: 'root'
})
export class UsersService extends ApiService {
    // ------------------------------------------------------------------------
    // GET
    // ------------------------------------------------------------------------

    /**
     * Returns a list of all users.
     *
     * @returns Observable<User[]>
     */
    getAllUsers(): Observable<User[]> {
        return this.httpGet('/admin/users').pipe(
            map((result: ApiServiceResult) => result.getBody(UsersResponse).users),
            catchError(this.handleJsonError)
        );
    }

    /**
     * Get user by username, email or by iri.
     * @ignore
     *
     * @param  {string} identifier username, email or by iri
     * @param  {String} identifierType
     * @returns Observable<User>
     */
    private getUser(identifier: string, identifierType: String): Observable<User> {
        const path = '/admin/users/' + identifierType + '/' + encodeURIComponent(identifier);
        return this.httpGet(path).pipe(
            map((result: ApiServiceResult) => result.getBody(UserResponse).user),
            catchError(this.handleJsonError)
        );
    }

    /**
     * Get user by IRI
     *
     * @param  {string} iri
     * @returns Observable<User>
     */
    getUserByIri(iri: string): Observable<User> {
        return this.getUser(iri, 'iri');
    }

    /**
     * Get user by email
     *
     * @param  {string} email
     * @returns Observable<User>
     */
    getUserByEmail(email: string): Observable<User> {
        return this.getUser(email, 'email');
    }

    /**
     * Get user by username.
     *
     * @param  {string} username
     * @returns Observable<User>
     */
    getUserByUsername(username: string): Observable<User> {
        return this.getUser(username, 'username');
    }

    /**
     * Get all groups, where the user is member of
     *
     * @param  {string} userIri
     * @returns Observable<Group[]>
     */
    getUsersGroupMemberships(userIri: string): Observable<Group[]> {
        const path = '/admin/users/iri/' + encodeURIComponent(userIri) + '/group-memberships';
        return this.httpGet(path).pipe(
            map((result: ApiServiceResult) => result.getBody(GroupsResponse).groups),
            catchError(this.handleJsonError)
        );

    }

    // ------------------------------------------------------------------------
    // POST
    // ------------------------------------------------------------------------

    /**
     * Create new user.
     *
     * @param {any} data
     * @returns Observable<User>
     */
    createUser(data: any): Observable<User> {
        const path = '/admin/users';
        return this.httpPost(path, data).pipe(
            map((result: ApiServiceResult) => result.getBody(UserResponse).user),
            catchError(this.handleJsonError)
        );
    }

    /**
     * Add user to a project.
     *
     * @param {string} userIri
     * @param {string} projectIri
     * @returns Observable<User>
     */
    addUserToProject(userIri: string, projectIri: string): Observable<User> {
        const path = '/admin/users/iri/' + encodeURIComponent(userIri) + '/project-memberships/' + encodeURIComponent(projectIri);
        return this.httpPost(path).pipe(
            map((result: ApiServiceResult) => result.getBody(UserResponse).user),
            catchError(this.handleJsonError)
        );
    }

    /**
     * Remove user from project.
     *
     * @param {string} userIri
     * @param {string} projectIri
     * @returns Observable<User>
     */
    removeUserFromProject(userIri: string, projectIri: string): Observable<User> {
        const path = '/admin/users/iri/' + encodeURIComponent(userIri) + '/project-memberships/' + encodeURIComponent(projectIri);
        return this.httpDelete(path).pipe(
            map((result: ApiServiceResult) => result.getBody(UserResponse).user),
            catchError(this.handleJsonError)
        );
    }

    /**
     * Add user to the admin group of a project.
     *
     * @param {string} userIri
     * @param {string} projectIri
     * @returns Observable<User>
     */
    addUserToProjectAdmin(userIri: string, projectIri: string): Observable<User> {
        const path = '/admin/users/iri/' + encodeURIComponent(userIri) + '/project-admin-memberships/' + encodeURIComponent(projectIri);
        return this.httpPost(path).pipe(
            map((result: ApiServiceResult) => result.getBody(UserResponse).user),
            catchError(this.handleJsonError)
        );
    }

    /**
     * Delete user from the admin group of a project.
     *
     * @param {string} userIri
     * @param {string} projectIri
     * @returns Observable<User>
     */
    removeUserFromProjectAdmin(userIri: string, projectIri: string): Observable<User> {
        const path = '/admin/users/iri/' + encodeURIComponent(userIri) + '/project-admin-memberships/' + encodeURIComponent(projectIri);
        return this.httpDelete(path).pipe(
            map((result: ApiServiceResult) => result.getBody(UserResponse).user),
            catchError(this.handleJsonError)
        );
    }

    /**
     * Add user to project specific group
     *
     * @param {string} userIri
     * @param {string} groupIri
     * @returns Observable<User>
     */
    addUserToGroup(userIri: string, groupIri: string): Observable<User> {
        const path = '/admin/users/iri/' + encodeURIComponent(userIri) + '/group-memberships/' + encodeURIComponent(groupIri);
        return this.httpPost(path).pipe(
            map((result: ApiServiceResult) => result.getBody(UserResponse).user),
            catchError(this.handleJsonError)
        );

    }

    /**
     * remove user from project specific group
     *
     * @param {string} userIri
     * @param {string} groupIri
     * @returns Observable<User>
     */
    removeUserFromGroup(userIri: string, groupIri: string): Observable<User> {
        const path = '/admin/users/iri/' + encodeURIComponent(userIri) + '/group-memberships/' + encodeURIComponent(groupIri);
        return this.httpDelete(path).pipe(
            map((result: ApiServiceResult) => result.getBody(UserResponse).user),
            catchError(this.handleJsonError)
        );

    }


    // ------------------------------------------------------------------------
    // PUT
    // ------------------------------------------------------------------------


    /**
     * Add user to the admin system.
     *
     * @param {string} userIri
     * @returns Observable<User>
     */
    addUserToSystemAdmin(userIri: string): Observable<User> {
        const data = {
            'systemAdmin': true
        };

        return this.updateUserSystemAdmin(userIri, data);

    }

    /**
     * Remove user from the admin system.
     * @param {string} userIri
     * @returns Observable<User>
     */
    removeUserFromSystemAdmin(userIri: string): Observable<User> {
        const data = {
            'systemAdmin': false
        };

        return this.updateUserSystemAdmin(userIri, data);
    }

    /**
     * Update user system admin membership
     * @ignore
     *
     * @param {string} userIri
     * @param {any} data
     *
     * @returns Observable<User>
     */
    private updateUserSystemAdmin(userIri: string, data: any): Observable<User> {
        const path = '/admin/users/iri/' + encodeURIComponent(userIri) + '/SystemAdmin';
        return this.httpPut(path, data).pipe(
            map((result: ApiServiceResult) => result.getBody(UserResponse).user),
            catchError(this.handleJsonError)
        );
    }


    /**
     * Activate user.
     *
     * @param {string} userIri
     * @returns Observable<User>
     */
    activateUser(userIri: string): Observable<User> {
        const path = '/admin/users/iri/' + encodeURIComponent(userIri) + '/Status';

        const data: any = {
            status: true
        };

        return this.httpPut(path, data).pipe(
            map((result: ApiServiceResult) => result.getBody(UserResponse).user),
            catchError(this.handleJsonError)
        );
    }


    /**
     * Update own password.
     *
     * @param {string} userIri
     * @param {string} oldPassword
     * @param {string} newPassword
     * @returns Observable<User>
     */
    updateOwnPassword(userIri: string, oldPassword: string, newPassword: string): Observable<User> {
        const path = '/admin/users/iri/' + encodeURIComponent(userIri) + '/Password';

        const data = {
            newPassword: newPassword,
            requesterPassword: oldPassword
        };

        return this.httpPut(path, data).pipe(
            map((result: ApiServiceResult) => result.getBody(UserResponse).user),
            catchError(this.handleJsonError)
        );
    }

    /**
     * Update password of another user (not own).
     *
     * @param {string} userIri
     * @param {string} requesterPassword
     * @param {string} newPassword
     * @returns Observable<User>
     */
    updateUsersPassword(userIri: string, requesterPassword: string, newPassword: string): Observable<User> {
        const path = '/admin/users/iri/' + encodeURIComponent(userIri) + '/Password';

        const data = {
            newPassword: newPassword,
            requesterPassword: requesterPassword
        };

        return this.httpPut(path, data).pipe(
            map((result: ApiServiceResult) => result.getBody(UserResponse).user),
            catchError(this.handleJsonError)
        );
    }

    /**
     * Update basic user information: given name, family name
     * @param userIri
     * @param data
     * @returns Observable<User>
     */
    updateBasicUserInformation(userIri: string, data: any): Observable<User> {
        const path = '/admin/users/iri/' + encodeURIComponent(userIri) + '/BasicUserInformation';

        return this.httpPut(path, data).pipe(
            map((result: ApiServiceResult) => result.getBody(UserResponse).user),
            catchError(this.handleJsonError)
        );
    }


    // ------------------------------------------------------------------------
    // DELETE
    // ------------------------------------------------------------------------

    /**
     * Delete / deactivate user.
     *
     * @param {string} userIri
     * @returns Observable<User>
     */
    deleteUser(userIri: string): Observable<User> {
        const path = '/admin/users/iri/' + encodeURIComponent(userIri);
        return this.httpDelete(path).pipe(
            map((result: ApiServiceResult) => result.getBody(UserResponse).user),
            catchError(this.handleJsonError)
        );

    }


}

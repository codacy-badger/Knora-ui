# Knora-ui modules

[![CircleCI](https://circleci.com/gh/dhlab-basel/Knora-ui/tree/master.svg?style=svg)](https://circleci.com/gh/dhlab-basel/Knora-ui/tree/master)
[![Build Status](https://travis-ci.com/dhlab-basel/Knora-ui.svg?branch=master)](https://travis-ci.com/dhlab-basel/Knora-ui)
[![Codacy Badge](https://api.codacy.com/project/badge/Grade/f3a4a40b35d040718377aef57bd15205)](https://www.codacy.com/app/dhlab-basel/Knora-ui?utm_source=github.com&utm_medium=referral&utm_content=dhlab-basel/Knora-ui&utm_campaign=Badge_Grade)

This is the demo and developing environment for Knora ui modules.

The modules helps to create a graphical user interface, a web application to use [Knora](https://www.knora.org) in a quick and simple way. The modules are written in typescript to use them with [Angular](https://angular.io) (version 7). We decided to style the components and directives with [material design](https://material.angular.io).

But you can use only @knora/core which contains almost all services for the Knora web API. Knora is a software framework for storing, sharing, and working with primary sources and data in the humanities.

Knora and the Knora ui modules is [free software](http://www.gnu.org/philosophy/free-sw.en.html), released under the [GNU Affero General Public](http://www.gnu.org/licenses/agpl-3.0.en.html).

This version of Knora-ui requires [Knora v6.0.1](https://github.com/dhlab-basel/Knora/releases/tag/v6.0.1).

## Already published modules

### @knora/core

[![npm (scoped)](https://img.shields.io/npm/v/@knora/core.svg)](https://www.npmjs.com/package/@knora/core)

The core module contains every service to use Knora's RESTful webapi.
[read more...](https://dhlab-basel.github.io/Knora-ui/modules/core)

* * *

### @knora/authentication

[![npm (scoped)](https://img.shields.io/npm/v/@knora/authentication.svg)](https://www.npmjs.com/package/@knora/authentication)

The authentication module contains the login form (for standalone usage) or a complete login- / logout-button environment incl. the login form.
[read more...](https://dhlab-basel.github.io/Knora-ui/modules/authentication)

* * *

### @knora/search

[![npm (scoped)](https://img.shields.io/npm/v/@knora/search.svg)](https://www.npmjs.com/package/@knora/search)

Search module allows to make simple searches or extended searches in Knora. In extended search, resource class and its properties related to one specific ontology are selected to create your query.
[read more...](https://dhlab-basel.github.io/Knora-ui/modules/search)

* * *

### @knora/viewer

[![npm (scoped)](https://img.shields.io/npm/v/@knora/viewer.svg)](https://www.npmjs.com/package/@knora/viewer)

The viewer module contains object components to show the resource class representations from Knora, the gui-elements for the property values and different kind of view frameworks.
[read more...](https://dhlab-basel.github.io/Knora-ui/modules/viewer)

* * *

### @knora/action

[![npm (scoped)](https://img.shields.io/npm/v/@knora/action.svg)](https://www.npmjs.com/package/@knora/action)

The action module contains special buttons (e.g. to sort a list), pipes and directives.
[read more...](https://dhlab-basel.github.io/Knora-ui/modules/action)

* * *

## Developers note

### Prerequisites

We develop the Knora-ui modules with Angular 6, especially with Angular-cli, which requires the following tools:

#### Yarn

We use [yarn](https://yarnpkg.com/en/) instead of npm. To install yarn on macOS:

```bash
$ brew install yarn
```

For other platforms, please go to the yarn website.

#### Node

Install [Node](https://nodejs.org/en/download/) in version >=4 &lt;=9. We recommend to use version 8.9.0. The easiest way to install node
in the correct version is to use ['n'](https://github.com/tj/n):

```bash
$ yarn global add n
$ n v8.9.0
```

### First steps

Install the node packages with:

```bash
$ yarn install --prod=false
```

and build the libraries with:

```bash
$ yarn build-lib
```

### Develop

<!--
Please use the following command schema to create a new module

`$ ng generate library @knora/[module-name] --prefix=kui`
-->

If you want to add more components, services and so on to a module library, you can do it with:

`$ ng generate component [path/in/your/module/][name-of-component] --project @knora/[module-name] --styleext scss`

It puts the component or the service into `lib/` directly. Otherwise you can define a path inside of `lib/`.

Before using the module inside of the app, you have to rebuild after the changes: `ng build @knora/[module-name]`.

### Run the demo app

Run the app with `ng s`. The demo app runs on <http://localhost:4200> and we use it for documentation on [Knora-ui Github page](https://dhlab-basel.github.io/Knora-ui).

There's a test environment for the modules on <https://github.com/dhlab-basel/knora-ui-playground> with yalc

* * *

<!--
## Unit Testing Services

Testing services with HttpClient and HttpTestingController

* Then a test expects that certain requests have or have not been made, performs assertions against those requests, and finally provide responses by "flushing" each expected request.
https://angular.io/guide/http#testing-http-requests
* See https://stackblitz.com/edit/angular-uy5cdl?file=src%2Fapp%2Fheroes%2Fheroes.service.spec.ts for a working example.

 ```TypeScript
 getAllHeroes (): Observable<any[]> {
    const observables = [];

    for (let i = 0; i <= 2; i++) {
      observables.push(
        this.http.get<Hero[]>(this.heroesUrl)
        .pipe(
          catchError(this.handleError('getAllHeroes', []))
      )
      );
    }

    return forkJoin(observables);

  }
  ```

* Several http requests are created and pushed on an array, then they are passed to forkJoin and returned. With forkJoin, we get one Observable that we can subscribe to (executed once all Observables have been completed). Then we get the results of all Observables from within the subscription to the Observable returned by forkJoin.

```TypeScript
 it('should get all heroes', () => {

      let res = heroService.getAllHeroes();

      res.subscribe(
        (obs) => {

          console.log("test")

          expect(obs[0]).toEqual(expectedHeroes, 'should return expected heroes');
          expect(obs[1]).toEqual(expectedHeroes, 'should return expected heroes');
          expect(obs[2]).toEqual(expectedHeroes, 'should return expected heroes');
        }, fail
      );

      // HeroService should have made three requests to GET heroes from expected URL
      const req = httpTestingController.match(
        (request) => {
          return request.url === heroService.heroesUrl && request.method === 'GET'
        }
      );

      // Respond with the mock heroes
      expect(req.length).toEqual(3);

      req[0].flush(expectedHeroes)
      req[1].flush(expectedHeroes)
      req[2].flush(expectedHeroes)

    });
```

* The clue is that for each http request made, a response has to be "flushed". Otherwise the subscription to the Observable returned by forkJoin is never executed:
If an inner observable does not complete forkJoin will never emit a value!
https://www.learnrxjs.io/operators/combination/forkjoin.html

> This is why the subscription never worked, because we did not flush all necessary responses. -->

### YALC

> Better workflow than `npm` \| `yarn` link for package authors.

Yalc publishes the packages to a local store (not the npm website).
From there, the packages can be added to your depending project.

#### Install [yalc](https://github.com/whitecolor/yalc):

```bash
$ yarn global add yalc
```

#### Usage

Publish library to local store:

```bash
$ yarn build-lib-prod
$ yarn yalc-publish
```

Use them in your application:

```bash
$ yalc add @knora/action
$ yalc add @knora/authentication
$ yalc add @knora/core
$ yalc add @knora/search
$ yalc add @knora/viewer
```

To remove from the project and restore `package.json` run:

```bash
$ yalc remove --all
```

* * *

## Required version of Knora: 6.0.1

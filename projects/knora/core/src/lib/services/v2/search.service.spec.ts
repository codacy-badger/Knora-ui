import { async, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import {FulltextSearchParams, SearchByLabelParams, SearchService} from './search.service';
import { KuiCoreModule } from '../../core.module';
import { ApiService } from '../api.service';
import { OntologyCacheService, OntologyInformation, Properties, ResourceClasses } from './ontology-cache.service';
import { of } from 'rxjs';
import { CountQueryResult } from '../../declarations';
import {HttpParams} from '@angular/common/http';

describe('SearchService', () => {
    let httpTestingController: HttpTestingController;
    let spyOntoCache;

    let searchService: SearchService;

    beforeEach(() => {
        spyOntoCache = jasmine.createSpyObj('OntologyCacheService', ['getResourceClassDefinitions']);

        TestBed.configureTestingModule({
            imports: [
                HttpClientTestingModule,
                KuiCoreModule.forRoot({ name: '', api: 'http://0.0.0.0:3333', app: '', media: '' })
            ],
            providers: [
                ApiService,
                SearchService,
                { provide: OntologyCacheService, useValue: spyOntoCache }
            ]
        });

        httpTestingController = TestBed.get(HttpTestingController);
        searchService = TestBed.get(SearchService);

        const resourceClassesThing: ResourceClasses = require('../../test-data/ontologyinformation/thing-resource-classes.json');
        const propertiesThing: Properties = require('../../test-data/ontologyinformation/thing-properties.json');

        const ontoInfoThing = of(new OntologyInformation({}, resourceClassesThing, propertiesThing));

        spyOntoCache.getResourceClassDefinitions.and.returnValue(ontoInfoThing);
    });

    afterEach(() => {
        httpTestingController.verify();
    });

    it('should be created', () => {
        expect(searchService).toBeDefined();
    });

    it('should perform a fulltext search for the term "testding"', async(() => {
        const expectedResources = require('../../test-data/resources/Testthing.json');

        searchService.doFulltextSearch('testding').subscribe(
            (res) => {
                expect(res.body).toEqual(expectedResources);
            }
        );

        const httpRequest = httpTestingController.expectOne('http://0.0.0.0:3333/v2/search/testding?offset=0');

        expect(httpRequest.request.method).toEqual('GET');

        httpRequest.flush(expectedResources);

    }));

    it('should perform a fulltext search for the term "testding" and restrict it to a project', async(() => {

        const expectedResources = require('../../test-data/resources/Testthing.json');

        searchService.doFulltextSearch('testding', 0, { limitToProject: 'http://rdfh.ch/projects/0001' }).subscribe(
            (res) => {
                expect(res.body).toEqual(expectedResources);
            }
        );

        // see https://www.ng-conf.org/2019/angulars-httpclient-testing-depth/
        const httpRequest = httpTestingController.match((request) => {
            return request.url === 'http://0.0.0.0:3333/v2/search/testding' &&
                request.params.get('offset') === '0' &&
                request.params.get('limitToProject') === 'http://rdfh.ch/projects/0001' &&
                request.params.keys().length === 2;

        });

        expect(httpRequest.length).toEqual(1);

        expect(httpRequest[0].request.method).toEqual('GET');

        httpRequest[0].flush(expectedResources);

    }));

    it('should perform a fulltext search for the term "testding" with offset 1', async(() => {

        const expectedResources = require('../../test-data/resources/Testthing.json');

        searchService.doFulltextSearch('testding', 1).subscribe();

        const httpRequest = httpTestingController.expectOne('http://0.0.0.0:3333/v2/search/testding?offset=1');

        expect(httpRequest.request.method).toEqual('GET');

        httpRequest.flush(expectedResources);

    }));

    it('should search for "testding" and return a ReadResourceSequence', async(() => {

        const expectedResources = require('../../test-data/resources/Testthing.json');

        searchService.doFullTextSearchReadResourceSequence('testding').subscribe(
            (res) => {
                expect(res.numberOfResources).toEqual(1);
                expect(res.resources[0].id).toEqual('http://rdfh.ch/0001/H6gBWUuJSuuO-CilHV8kQw');
                expect(res.resources[0].type).toEqual('http://0.0.0.0:3333/ontology/0001/anything/v2#Thing');

                expect(Object.keys(res.resources[0].properties).length).toEqual(12);

                const propertiesThing: Properties = require('../../test-data/ontologyinformation/thing-properties.json');
                expect(res.ontologyInformation.getProperties()).toEqual(propertiesThing);

                const resourceClassesThing: ResourceClasses = require('../../test-data/ontologyinformation/thing-resource-classes.json');
                expect(res.ontologyInformation.getResourceClasses()).toEqual(resourceClassesThing);

                expect(spyOntoCache.getResourceClassDefinitions.calls.count()).toBe(1);
                expect(spyOntoCache.getResourceClassDefinitions.calls.mostRecent().args).toEqual([['http://0.0.0.0:3333/ontology/0001/anything/v2#Thing']]);

            }
        );

        const httpRequest = httpTestingController.expectOne('http://0.0.0.0:3333/v2/search/testding?offset=0');

        expect(httpRequest.request.method).toEqual('GET');

        httpRequest.flush(expectedResources);

    }));

    it('should search for "testdin?" (wildcard) and return a ReadResourceSequence', async(() => {

        const expectedResources = require('../../test-data/resources/Testthing.json');

        searchService.doFullTextSearchReadResourceSequence('testdin?').subscribe(
            (res) => {
                expect(res.numberOfResources).toEqual(1);
                expect(res.resources[0].id).toEqual('http://rdfh.ch/0001/H6gBWUuJSuuO-CilHV8kQw');
                expect(res.resources[0].type).toEqual('http://0.0.0.0:3333/ontology/0001/anything/v2#Thing');

                expect(Object.keys(res.resources[0].properties).length).toEqual(12);

                const propertiesThing: Properties = require('../../test-data/ontologyinformation/thing-properties.json');
                expect(res.ontologyInformation.getProperties()).toEqual(propertiesThing);

                const resourceClassesThing: ResourceClasses = require('../../test-data/ontologyinformation/thing-resource-classes.json');
                expect(res.ontologyInformation.getResourceClasses()).toEqual(resourceClassesThing);

                expect(spyOntoCache.getResourceClassDefinitions.calls.count()).toBe(1);
                expect(spyOntoCache.getResourceClassDefinitions.calls.mostRecent().args).toEqual([['http://0.0.0.0:3333/ontology/0001/anything/v2#Thing']]);

            }
        );

        // ? has to be URL encoded
        const httpRequest = httpTestingController.expectOne('http://0.0.0.0:3333/v2/search/testdin%3F?offset=0');

        expect(httpRequest.request.method).toEqual('GET');

        httpRequest.flush(expectedResources);

    }));

    it('should search for "testding" restricted to a project and return a ReadResourceSequence', async(() => {

        const expectedResources = require('../../test-data/resources/Testthing.json');

        searchService.doFullTextSearchReadResourceSequence('testding', 0, { limitToProject: 'http://rdfh.ch/projects/0001' }).subscribe(
            (res) => {
                expect(res.numberOfResources).toEqual(1);
                expect(res.resources[0].id).toEqual('http://rdfh.ch/0001/H6gBWUuJSuuO-CilHV8kQw');
                expect(res.resources[0].type).toEqual('http://0.0.0.0:3333/ontology/0001/anything/v2#Thing');

                expect(Object.keys(res.resources[0].properties).length).toEqual(12);

                const propertiesThing: Properties = require('../../test-data/ontologyinformation/thing-properties.json');
                expect(res.ontologyInformation.getProperties()).toEqual(propertiesThing);

                const resourceClassesThing: ResourceClasses = require('../../test-data/ontologyinformation/thing-resource-classes.json');
                expect(res.ontologyInformation.getResourceClasses()).toEqual(resourceClassesThing);

                expect(spyOntoCache.getResourceClassDefinitions.calls.count()).toBe(1);
                expect(spyOntoCache.getResourceClassDefinitions.calls.mostRecent().args).toEqual([['http://0.0.0.0:3333/ontology/0001/anything/v2#Thing']]);

            }
        );

        // see https://www.ng-conf.org/2019/angulars-httpclient-testing-depth/
        const httpRequest = httpTestingController.match((request) => {
            return request.url === 'http://0.0.0.0:3333/v2/search/testding' &&
                request.params.get('offset') === '0' &&
                request.params.get('limitToProject') === 'http://rdfh.ch/projects/0001' &&
                request.params.keys().length === 2;
        });

        expect(httpRequest.length).toEqual(1);

        expect(httpRequest[0].request.method).toEqual('GET');

        httpRequest[0].flush(expectedResources);

    }));

    it('should perform a fulltext search for "testding" with offset 1 and return a ReadResourceSequence', async(() => {

        const expectedResources = require('../../test-data/resources/Testthing.json');

        searchService.doFullTextSearchReadResourceSequence('testding', 1).subscribe();

        const httpRequest = httpTestingController.expectOne('http://0.0.0.0:3333/v2/search/testding?offset=1');

        expect(httpRequest.request.method).toEqual('GET');

        httpRequest.flush(expectedResources);

    }));

    it('should perform a count query for a fulltext search', async(() => {

        const expectedResult = require('../../test-data/resources/countQueryResult.json');

        searchService.doFulltextSearchCountQuery('testding').subscribe(
            (res) => {
                expect(res.body).toEqual(expectedResult);
            }
        );

        const httpRequest = httpTestingController.expectOne('http://0.0.0.0:3333/v2/search/count/testding');

        expect(httpRequest.request.method).toEqual('GET');

        httpRequest.flush(expectedResult);

    }));

    it('should perform a count query for a fulltext search and restrict it to a project', async(() => {

        const expectedResult = require('../../test-data/resources/countQueryResult.json');

        searchService.doFulltextSearchCountQuery('testding', { limitToProject: 'http://rdfh.ch/projects/0001' }).subscribe(
            (res) => {
                expect(res.body).toEqual(expectedResult);
            }
        );

        // see https://www.ng-conf.org/2019/angulars-httpclient-testing-depth/
        const httpRequest = httpTestingController.match((request) => {
            return request.url === 'http://0.0.0.0:3333/v2/search/count/testding' &&
                request.params.get('limitToProject') === 'http://rdfh.ch/projects/0001' &&
                request.params.keys().length === 1;
        });

        expect(httpRequest.length).toEqual(1);

        expect(httpRequest[0].request.method).toEqual('GET');

        httpRequest[0].flush(expectedResult);

    }));

    it('should perform a count query for a fulltext search and return a count query result', async(() => {

        const expectedResult = require('../../test-data/resources/countQueryResult.json');

        searchService.doFullTextSearchCountQueryCountQueryResult('testding').subscribe(
            (res) => {

                const expectedCountQueryRes = new CountQueryResult(197);

                expect(res).toEqual(expectedCountQueryRes);
            }
        );

        const httpRequest = httpTestingController.expectOne('http://0.0.0.0:3333/v2/search/count/testding');

        expect(httpRequest.request.method).toEqual('GET');

        httpRequest.flush(expectedResult);

    }));

    it('should perform a count query for a fulltext search restricted to a project and return a count query result', async(() => {

        const expectedResult = require('../../test-data/resources/countQueryResult.json');

        searchService.doFullTextSearchCountQueryCountQueryResult('testding', { limitToProject: 'http://rdfh.ch/projects/0001' }).subscribe(
            (res) => {

                const expectedCountQueryRes = new CountQueryResult(197);

                expect(res).toEqual(expectedCountQueryRes);
            }
        );

        // see https://www.ng-conf.org/2019/angulars-httpclient-testing-depth/
        const httpRequest = httpTestingController.match((request) => {
            return request.url === 'http://0.0.0.0:3333/v2/search/count/testding' &&
                request.params.get('limitToProject') === 'http://rdfh.ch/projects/0001' &&
                request.params.keys().length === 1;
        });

        expect(httpRequest.length).toEqual(1);

        expect(httpRequest[0].request.method).toEqual('GET');

        httpRequest[0].flush(expectedResult);

    }));

    it('should correctly handle "FulltextSearchParams"', () => {

        let searchParams: FulltextSearchParams = {
            limitToProject: 'http://rdfh.ch/projects/0001'
        };

        let httpParams = searchService['processFulltextSearchParams'](searchParams, new HttpParams());

        expect(httpParams.get('limitToProject')).toEqual('http://rdfh.ch/projects/0001');
        expect(httpParams.keys().length).toEqual(1);

        searchParams = {
            limitToResourceClass: 'http://0.0.0.0:3333/ontology/0001/anything/v2#Thing'
        };

        httpParams = searchService['processFulltextSearchParams'](searchParams, new HttpParams());

        expect(httpParams.get('limitToResourceClass')).toEqual('http://0.0.0.0:3333/ontology/0001/anything/v2#Thing');
        expect(httpParams.keys().length).toEqual(1);

        searchParams = {
            limitToStandoffClass: 'http://api.knora.org/ontology/standoff/v2#StandoffParagraphTag'
        };

        httpParams = searchService['processFulltextSearchParams'](searchParams, new HttpParams());

        expect(httpParams.get('limitToStandoffClass')).toEqual('http://api.knora.org/ontology/standoff/v2#StandoffParagraphTag');
        expect(httpParams.keys().length).toEqual(1);

    });

    it('should perform an extended search', async(() => {

        const gravsearch = `
PREFIX knora-api: <http://api.knora.org/ontology/knora-api/simple/v2#>
CONSTRUCT {
    ?mainRes knora-api:isMainResource true .
} WHERE {
    ?mainRes a knora-api:Resource .

    ?mainRes a <http://0.0.0.0:3333/ontology/0001/anything/v2#Thing> .

}

OFFSET 0`;

        const expectedResources = require('../../test-data/resources/Testthing.json');

        searchService.doExtendedSearch(gravsearch).subscribe(
            (res) => {
                expect(res.body).toEqual(expectedResources);
            }
        );

        const httpRequest = httpTestingController.expectOne('http://0.0.0.0:3333/v2/searchextended');

        expect(httpRequest.request.method).toEqual('POST');

        expect(httpRequest.request.body).toEqual(gravsearch);

        httpRequest.flush(expectedResources);

    }));

    it('should perform an extended search and return a ReadResourceSequence', async(() => {

        const gravsearch = `
PREFIX knora-api: <http://api.knora.org/ontology/knora-api/simple/v2#>
CONSTRUCT {
    ?mainRes knora-api:isMainResource true .
} WHERE {
    ?mainRes a knora-api:Resource .

    ?mainRes a <http://0.0.0.0:3333/ontology/0001/anything/v2#Thing> .

}

OFFSET 0`;

        const expectedResources = require('../../test-data/resources/Testthing.json');

        searchService.doExtendedSearchReadResourceSequence(gravsearch).subscribe(
            (res) => {

                expect(res.numberOfResources).toEqual(1);
                expect(res.resources[0].id).toEqual('http://rdfh.ch/0001/H6gBWUuJSuuO-CilHV8kQw');
                expect(res.resources[0].type).toEqual('http://0.0.0.0:3333/ontology/0001/anything/v2#Thing');

                expect(Object.keys(res.resources[0].properties).length).toEqual(12);

                const propertiesThing: Properties = require('../../test-data/ontologyinformation/thing-properties.json');
                expect(res.ontologyInformation.getProperties()).toEqual(propertiesThing);

                const resourceClassesThing: ResourceClasses = require('../../test-data/ontologyinformation/thing-resource-classes.json');
                expect(res.ontologyInformation.getResourceClasses()).toEqual(resourceClassesThing);

                expect(spyOntoCache.getResourceClassDefinitions.calls.count()).toBe(1);
                expect(spyOntoCache.getResourceClassDefinitions.calls.mostRecent().args).toEqual([['http://0.0.0.0:3333/ontology/0001/anything/v2#Thing']]);

            }
        );

        const httpRequest = httpTestingController.expectOne('http://0.0.0.0:3333/v2/searchextended');

        expect(httpRequest.request.method).toEqual('POST');

        expect(httpRequest.request.body).toEqual(gravsearch);

        httpRequest.flush(expectedResources);

    }));

    it('should perform a count query for an extended search', async(() => {

        const gravsearch = `
PREFIX knora-api: <http://api.knora.org/ontology/knora-api/simple/v2#>
CONSTRUCT {
    ?mainRes knora-api:isMainResource true .
} WHERE {
    ?mainRes a knora-api:Resource .

    ?mainRes a <http://0.0.0.0:3333/ontology/0001/anything/v2#Thing> .

}

OFFSET 0`;

        const expectedResult = require('../../test-data/resources/countQueryResult.json');

        searchService.doExtendedSearchCountQuery(gravsearch).subscribe(
            (res) => {
                expect(res.body).toEqual(expectedResult);
            }
        );

        const httpRequest = httpTestingController.expectOne('http://0.0.0.0:3333/v2/searchextended/count');

        expect(httpRequest.request.method).toEqual('POST');

        expect(httpRequest.request.body).toEqual(gravsearch);

        httpRequest.flush(expectedResult);

    }));

    it('should perform a count query for an extended search and return a CountQueryResult', async(() => {

        const gravsearch = `
PREFIX knora-api: <http://api.knora.org/ontology/knora-api/simple/v2#>
CONSTRUCT {
    ?mainRes knora-api:isMainResource true .
} WHERE {
    ?mainRes a knora-api:Resource .

    ?mainRes a <http://0.0.0.0:3333/ontology/0001/anything/v2#Thing> .

}

OFFSET 0`;

        const expectedResult = require('../../test-data/resources/countQueryResult.json');

        searchService.doExtendedSearchCountQueryCountQueryResult(gravsearch).subscribe(
            (res) => {
                const expectedCountQueryRes = new CountQueryResult(197);

                expect(res).toEqual(expectedCountQueryRes);
            }
        );

        const httpRequest = httpTestingController.expectOne('http://0.0.0.0:3333/v2/searchextended/count');

        expect(httpRequest.request.method).toEqual('POST');

        expect(httpRequest.request.body).toEqual(gravsearch);

        httpRequest.flush(expectedResult);

    }));

    it('should perform a search by label for "testding"', async(() => {

        const expectedResource = require('../../test-data/resources/Testthing.json');

        searchService.searchByLabel('testding').subscribe(
            (res) => {

                expect(res.body).toEqual(expectedResource);
            }
        );

        const httpRequest = httpTestingController.expectOne('http://0.0.0.0:3333/v2/searchbylabel/testding?offset=0');

        expect(httpRequest.request.method).toEqual('GET');

        httpRequest.flush(expectedResource);

    }));

    it('should perform a search by label for "testding" restricted by resource class', async(() => {

        const expectedResource = require('../../test-data/resources/Testthing.json');

        searchService.searchByLabel('testding', 0, { limitToResourceClass: 'http://0.0.0.0:3333/ontology/0001/anything/v2#Thing' }).subscribe(
            (res) => {

                expect(res.body).toEqual(expectedResource);
            }
        );

        // see https://www.ng-conf.org/2019/angulars-httpclient-testing-depth/
        const httpRequest = httpTestingController.match((request) => {
            return request.url === 'http://0.0.0.0:3333/v2/searchbylabel/testding' &&
                request.params.get('offset') === '0' &&
                request.params.get('limitToResourceClass') === 'http://0.0.0.0:3333/ontology/0001/anything/v2#Thing' &&
                request.params.keys().length === 2;
        });

        expect(httpRequest.length).toEqual(1);

        httpRequest[0].flush(expectedResource);

    }));

    it('should perform a search by label for "testding" restricted by project', async(() => {

        const expectedResource = require('../../test-data/resources/Testthing.json');

        searchService.searchByLabel('testding', 0, { limitToProject: 'http://rdfh.ch/projects/0001' }).subscribe(
            (res) => {

                expect(res.body).toEqual(expectedResource);
            }
        );

        // see https://www.ng-conf.org/2019/angulars-httpclient-testing-depth/
        const httpRequest = httpTestingController.match((request) => {
            return request.url === 'http://0.0.0.0:3333/v2/searchbylabel/testding' &&
                request.params.get('offset') === '0' &&
                request.params.get('limitToProject') === 'http://rdfh.ch/projects/0001' &&
                request.params.keys().length === 2;
        });

        expect(httpRequest.length).toEqual(1);

        httpRequest[0].flush(expectedResource);

    }));

    it('should perform a search by label for "testding" restricted by resource class and project', async(() => {

        const expectedResource = require('../../test-data/resources/Testthing.json');

        searchService.searchByLabel('testding', 0, { limitToResourceClass: 'http://0.0.0.0:3333/ontology/0001/anything/v2#Thing', limitToProject: 'http://rdfh.ch/projects/0001' }).subscribe(
            (res) => {

                expect(res.body).toEqual(expectedResource);
            }
        );

        // see https://www.ng-conf.org/2019/angulars-httpclient-testing-depth/
        const httpRequest = httpTestingController.match((request) => {

            return request.url === 'http://0.0.0.0:3333/v2/searchbylabel/testding'
                && request.params.get('offset') === '0'
                && request.params.get('limitToProject') === 'http://rdfh.ch/projects/0001'
                && request.params.get('limitToResourceClass') === 'http://0.0.0.0:3333/ontology/0001/anything/v2#Thing'
                && request.params.keys().length === 3;
        });

        expect(httpRequest.length).toEqual(1);

        httpRequest[0].flush(expectedResource);

    }));

    it('should perform a search by label for "testding" returning a ReadResourceSequence', async(() => {

        const expectedResource = require('../../test-data/resources/Testthing.json');

        searchService.searchByLabelReadResourceSequence('testding').subscribe(
            (res) => {

                expect(res.numberOfResources).toEqual(1);
                expect(res.resources[0].id).toEqual('http://rdfh.ch/0001/H6gBWUuJSuuO-CilHV8kQw');
                expect(res.resources[0].type).toEqual('http://0.0.0.0:3333/ontology/0001/anything/v2#Thing');

                expect(Object.keys(res.resources[0].properties).length).toEqual(12);

                const propertiesThing: Properties = require('../../test-data/ontologyinformation/thing-properties.json');
                expect(res.ontologyInformation.getProperties()).toEqual(propertiesThing);

                const resourceClassesThing: ResourceClasses = require('../../test-data/ontologyinformation/thing-resource-classes.json');
                expect(res.ontologyInformation.getResourceClasses()).toEqual(resourceClassesThing);

                expect(spyOntoCache.getResourceClassDefinitions.calls.count()).toBe(1);
                expect(spyOntoCache.getResourceClassDefinitions.calls.mostRecent().args).toEqual([['http://0.0.0.0:3333/ontology/0001/anything/v2#Thing']]);

            }
        );

        const httpRequest = httpTestingController.expectOne('http://0.0.0.0:3333/v2/searchbylabel/testding?offset=0');

        expect(httpRequest.request.method).toEqual('GET');

        httpRequest.flush(expectedResource);
    }));

    it('should perform a search by label for "testding" limited by resource class returning a ReadResourceSequence', async(() => {

        const expectedResource = require('../../test-data/resources/Testthing.json');

        searchService.searchByLabelReadResourceSequence('testding', 0, { limitToResourceClass: 'http://0.0.0.0:3333/ontology/0001/anything/v2#Thing' }).subscribe(
            (res) => {

                expect(res.numberOfResources).toEqual(1);
                expect(res.resources[0].id).toEqual('http://rdfh.ch/0001/H6gBWUuJSuuO-CilHV8kQw');
                expect(res.resources[0].type).toEqual('http://0.0.0.0:3333/ontology/0001/anything/v2#Thing');

                expect(Object.keys(res.resources[0].properties).length).toEqual(12);

                const propertiesThing: Properties = require('../../test-data/ontologyinformation/thing-properties.json');
                expect(res.ontologyInformation.getProperties()).toEqual(propertiesThing);

                const resourceClassesThing: ResourceClasses = require('../../test-data/ontologyinformation/thing-resource-classes.json');
                expect(res.ontologyInformation.getResourceClasses()).toEqual(resourceClassesThing);

                expect(spyOntoCache.getResourceClassDefinitions.calls.count()).toBe(1);
                expect(spyOntoCache.getResourceClassDefinitions.calls.mostRecent().args).toEqual([['http://0.0.0.0:3333/ontology/0001/anything/v2#Thing']]);

            }
        );

        // see https://www.ng-conf.org/2019/angulars-httpclient-testing-depth/
        const httpRequest = httpTestingController.match((request) => {

            return request.url === 'http://0.0.0.0:3333/v2/searchbylabel/testding'
                && request.params.get('offset') === '0'
                && request.params.get('limitToResourceClass') === 'http://0.0.0.0:3333/ontology/0001/anything/v2#Thing'
                && request.params.keys().length === 2;
        });

        expect(httpRequest.length).toEqual(1);

        httpRequest[0].flush(expectedResource);
    }));

    it('should perform a search by label for "testding" limited by project returning a ReadResourceSequence', async(() => {

        const expectedResource = require('../../test-data/resources/Testthing.json');

        searchService.searchByLabelReadResourceSequence('testding', 0, { limitToProject: 'http://rdfh.ch/projects/0001' }).subscribe(
            (res) => {

                expect(res.numberOfResources).toEqual(1);
                expect(res.resources[0].id).toEqual('http://rdfh.ch/0001/H6gBWUuJSuuO-CilHV8kQw');
                expect(res.resources[0].type).toEqual('http://0.0.0.0:3333/ontology/0001/anything/v2#Thing');

                expect(Object.keys(res.resources[0].properties).length).toEqual(12);

                const propertiesThing: Properties = require('../../test-data/ontologyinformation/thing-properties.json');
                expect(res.ontologyInformation.getProperties()).toEqual(propertiesThing);

                const resourceClassesThing: ResourceClasses = require('../../test-data/ontologyinformation/thing-resource-classes.json');
                expect(res.ontologyInformation.getResourceClasses()).toEqual(resourceClassesThing);

                expect(spyOntoCache.getResourceClassDefinitions.calls.count()).toBe(1);
                expect(spyOntoCache.getResourceClassDefinitions.calls.mostRecent().args).toEqual([['http://0.0.0.0:3333/ontology/0001/anything/v2#Thing']]);

            }
        );

        // see https://www.ng-conf.org/2019/angulars-httpclient-testing-depth/
        const httpRequest = httpTestingController.match((request) => {

            return request.url === 'http://0.0.0.0:3333/v2/searchbylabel/testding'
                && request.params.get('offset') === '0'
                && request.params.get('limitToProject') === 'http://rdfh.ch/projects/0001'
                && request.params.keys().length === 2;
        });

        expect(httpRequest.length).toEqual(1);

        httpRequest[0].flush(expectedResource);
    }));

    it('should perform a search by label for "testding" limited by resurce class and project returning a ReadResourceSequence', async(() => {

        const expectedResource = require('../../test-data/resources/Testthing.json');

        searchService.searchByLabelReadResourceSequence('testding', 0, { limitToResourceClass: 'http://0.0.0.0:3333/ontology/0001/anything/v2#Thing', limitToProject: 'http://rdfh.ch/projects/0001' }).subscribe(
            (res) => {

                expect(res.numberOfResources).toEqual(1);
                expect(res.resources[0].id).toEqual('http://rdfh.ch/0001/H6gBWUuJSuuO-CilHV8kQw');
                expect(res.resources[0].type).toEqual('http://0.0.0.0:3333/ontology/0001/anything/v2#Thing');

                expect(Object.keys(res.resources[0].properties).length).toEqual(12);

                const propertiesThing: Properties = require('../../test-data/ontologyinformation/thing-properties.json');
                expect(res.ontologyInformation.getProperties()).toEqual(propertiesThing);

                const resourceClassesThing: ResourceClasses = require('../../test-data/ontologyinformation/thing-resource-classes.json');
                expect(res.ontologyInformation.getResourceClasses()).toEqual(resourceClassesThing);

                expect(spyOntoCache.getResourceClassDefinitions.calls.count()).toBe(1);
                expect(spyOntoCache.getResourceClassDefinitions.calls.mostRecent().args).toEqual([['http://0.0.0.0:3333/ontology/0001/anything/v2#Thing']]);

            }
        );

        // see https://www.ng-conf.org/2019/angulars-httpclient-testing-depth/
        const httpRequest = httpTestingController.match((request) => {

            return request.url === 'http://0.0.0.0:3333/v2/searchbylabel/testding'
                && request.params.get('offset') === '0'
                && request.params.get('limitToProject') === 'http://rdfh.ch/projects/0001'
                && request.params.get('limitToResourceClass') === 'http://0.0.0.0:3333/ontology/0001/anything/v2#Thing'
                && request.params.keys().length === 3;
        });

        expect(httpRequest.length).toEqual(1);

        httpRequest[0].flush(expectedResource);
    }));

    it('should correctly handle "SearchByLabelParams"', () => {

        let searchParams: SearchByLabelParams = {
            limitToProject: 'http://rdfh.ch/projects/0001'
        };

        let httpParams = searchService['processSearchByLabelParams'](searchParams, new HttpParams());

        expect(httpParams.get('limitToProject')).toEqual('http://rdfh.ch/projects/0001');
        expect(httpParams.keys().length).toEqual(1);

        searchParams = {
            limitToResourceClass: 'http://0.0.0.0:3333/ontology/0001/anything/v2#Thing'
        };

        httpParams = searchService['processSearchByLabelParams'](searchParams, new HttpParams());

        expect(httpParams.get('limitToResourceClass')).toEqual('http://0.0.0.0:3333/ontology/0001/anything/v2#Thing');
        expect(httpParams.keys().length).toEqual(1);

    });
});

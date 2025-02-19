import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, ViewChild } from '@angular/core';
import {
    ConvertJSONLD,
    ImageRegion,
    ReadResource,
    ReadResourcesSequence,
    ReadStillImageFileValue,
    StillImageRepresentation
} from '@knora/core';
import { StillImageComponent } from './still-image.component';
import { MatIconModule, MatToolbarModule } from '@angular/material';

// Attention: make sure OpenSeadragon and svg-overlay have to be loaded
// projects/knora/viewer/karma.conf.js -> 'files' needs to contain the js

describe('StillImageOSDViewerComponent', () => {
    let component: StillImageComponent;
    let host: TestHostComponent;
    let fixture: ComponentFixture<TestHostComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [StillImageComponent, TestHostComponent],
            imports: [
                MatIconModule,
                MatToolbarModule
            ]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(TestHostComponent);
        host = fixture.componentInstance;
        component = fixture.componentInstance.osdViewerComp;
    });

    it('should be created', () => {
        expect(component).toBeTruthy();
    });

    // atm StillImageOSDViewerComponent has not many public methods or members.
    // to be able to still test state of StillImageOSDViewerComponent we use the following technique for the first couple of tests:
    // test private methods, members with: component["method"](param), or compomnent["member"]
    // this prevents TS compiler from restricting access, while still checking type safety.

    it('should have initialized viewer after resources change', () => {
        host.resourcesHost = images;
        fixture.detectChanges();

        expect(component['viewer']).toBeTruthy();
    });

    it('should have OpenSeadragon.Viewer.isVisible() == true after resources change', () => {
        host.resourcesHost = images;
        fixture.detectChanges();
        expect(component['viewer'].isVisible()).toBeTruthy();
    });

    it('should have 1 image loaded after resources change with 1 full size image and 1 (ignored) preview image', () => {
        host.resourcesHost = images;
        fixture.detectChanges();
        component['viewer'].addHandler('open', function (args) {
            expect(component['viewer'].world.getItemCount()).toEqual(1);
        });
        component['viewer'].addHandler('open-failed', function (args) {
            expect(component['viewer'].world.getItemCount()).toEqual(0);
        });
    });

    it('should have 5 test regions loaded (rect, circle, poylgon, circle_from_multiregion, rect_from_multiregion)', () => {
        host.resourcesHost = images;
        fixture.detectChanges();
        const overlay = component['viewer'].svgOverlay();
        expect(overlay.node().childElementCount).toEqual(5);
    });

    it('should emit the region\'s Iri when a region is hovered', () => {
        host.resourcesHost = images;
        fixture.detectChanges();

        const overlay = component['viewer'].svgOverlay();

        // first region -> polygon element (second element in <g> element)
        const regionSvgEle: HTMLElement = overlay.node().childNodes[0].childNodes[1];

        const event = new MouseEvent('click', {
            bubbles: true,
            cancelable: true,
            view: window
        });

        regionSvgEle.dispatchEvent(event);

        fixture.detectChanges();

        expect(host.activeRegion).toEqual('http://rdfh.ch/b6b64a62b006');

    });

    it('should highlight a region', () => {
        host.resourcesHost = images;
        fixture.detectChanges();

        component['highlightRegion']('http://rdfh.ch/b6b64a62b006');
        fixture.detectChanges();

        const overlay = component['viewer'].svgOverlay();

        // first region -> polygon element (second element in <g> element)
        const regionSvgEle: HTMLElement = overlay.node().childNodes[0].childNodes[1];

        let attr = regionSvgEle.getAttribute('class');
        expect(attr).toEqual('roi-svgoverlay active');

        component['unhighlightAllRegions']();
        fixture.detectChanges();

        attr = regionSvgEle.getAttribute('class');
        expect(attr).toEqual('roi-svgoverlay');

    });

    it('should highlight a region using the input "activateRegion"', () => {
        host.resourcesHost = images;
        host.inputActivateRegion = 'http://rdfh.ch/b6b64a62b006';
        fixture.detectChanges();

        const overlay = component['viewer'].svgOverlay();

        // first region -> polygon element (second element in <g> element)
        const regionSvgEle: HTMLElement = overlay.node().childNodes[0].childNodes[1];

        const attr = regionSvgEle.getAttribute('class');
        expect(attr).toEqual('roi-svgoverlay active');
    });

});

// define and create host component

@Component({
    template: `
        <kui-still-image [images]="resourcesHost"
                         [imageCaption]="caption"
                         (regionHovered)="regionActive($event)"
                         [activateRegion]="inputActivateRegion">
        </kui-still-image>`
})
class TestHostComponent {
    resourcesHost: StillImageRepresentation[] = [];
    caption = 'test';
    activeRegion: string;
    inputActivateRegion: string;

    @ViewChild(StillImageComponent) osdViewerComp: StillImageComponent;

    regionActive(regionIri: string) {
        this.activeRegion = regionIri;
    }
}

// create test input data

const stillImageFullSize: ReadStillImageFileValue = new ReadStillImageFileValue(
    'http://data.knora.org/22cf0ce68901/reps/dd4b1264ff02',
    'http://api.knora.org/ontology/knora-api/v2#hasStillImageFileValue',
    'incunabula_0000001722.jp2',
    'http://localhost:1024/knora',
    'http://localhost:1024/knora/incunabula_0000001722.jp2/full/3428,5061/0/default.jpg',
    3428,
    5061
);

const stillImagePreview: ReadStillImageFileValue = new ReadStillImageFileValue(
    'http://data.knora.org/22cf0ce68901/reps/dd4b1264ff02',
    'http://api.knora.org/ontology/knora-api/v2#hasStillImageFileValue',
    'incunabula_0000001722.jp2',
    'http://localhost:1024/knora',
    'http://localhost:1024/knora/incunabula_0000001722.jpg/full/86,128/0/default.jpg',
    86,
    128
);

const testRegionRectangle: ReadResource = createTestRegionRectangle();
const testRegionPolygon: ReadResource = createTestRegionPolygon();
const testRegionCircle: ReadResource = createTestRegionCircle();
const testRegionMulti: ReadResource = createTestRegionMulti();

const images: StillImageRepresentation[] = [
    new StillImageRepresentation(stillImageFullSize, [new ImageRegion(testRegionRectangle), new ImageRegion(testRegionPolygon), new ImageRegion(testRegionCircle), new ImageRegion(testRegionMulti)])
];

// utility functions

function createTestRegionRectangle() {
    const testRegionRect_compacted_json = `
{
  "@id": "http://rdfh.ch/b6b64a62b006",
  "@type": "http://api.knora.org/ontology/knora-api/v2#Region",
  "http://api.knora.org/ontology/knora-api/v2#hasColor": {
    "@id": "http://rdfh.ch/b6b64a62b006/values/8da571610f27",
    "@type": "http://api.knora.org/ontology/knora-api/v2#ColorValue",
    "http://api.knora.org/ontology/knora-api/v2#colorValueAsColor": "#ff3333"
  },
  "http://api.knora.org/ontology/knora-api/v2#hasComment": {
    "@id": "http://rdfh.ch/b6b64a62b006/values/0752cbee0e27",
    "@type": "http://api.knora.org/ontology/knora-api/v2#TextValue",
    "http://api.knora.org/ontology/knora-api/v2#valueAsString": "Derselbe Holzschnitt wird auf Seite c5v verwendet."
  },
  "http://api.knora.org/ontology/knora-api/v2#hasGeometry": {
    "@id": "http://rdfh.ch/b6b64a62b006/values/ca7b1e280f27",
    "@type": "http://api.knora.org/ontology/knora-api/v2#GeomValue",
    "http://api.knora.org/ontology/knora-api/v2#geometryValueAsGeometry": "{\\"status\\":\\"active\\",\\"lineColor\\":\\"#ff3333\\",\\"lineWidth\\":2,\\"points\\":[{\\"x\\":0.0989010989010989,\\"y\\":0.18055555555555555},{\\"x\\":0.7252747252747253,\\"y\\":0.7245370370370371}],\\"type\\":\\"rectangle\\"}"
  },
  "http://api.knora.org/ontology/knora-api/v2#isRegionOfValue": {
    "@id": "http://rdfh.ch/b6b64a62b006/values/d2893190-53ae-452f-adca-e8a0c68c4df6",
    "@type": "http://api.knora.org/ontology/knora-api/v2#LinkValue",
    "http://api.knora.org/ontology/knora-api/v2#linkValueHasTarget": {
      "@id": "http://rdfh.ch/9d626dc76c03",
      "@type": "http://0.0.0.0:3333/ontology/0803/incunabula/v2#page",
      "http://www.w3.org/2000/01/rdf-schema#label": "u1r"
    }
  },
  "http://www.w3.org/2000/01/rdf-schema#label": "Derselbe Holzschnitt wird auf Seite c5v verwendet."
}
      `;
    const testRegionRect_compacted = JSON.parse(testRegionRect_compacted_json);
    const testRegionRect_resources: ReadResourcesSequence = ConvertJSONLD.createReadResourcesSequenceFromJsonLD(testRegionRect_compacted);
    return testRegionRect_resources.resources[0];
}

function createTestRegionPolygon() {
    const testRegionPolygon_compacted_json = `
{
  "@id": "http://rdfh.ch/f1b0bb27b006",
  "@type": "http://api.knora.org/ontology/knora-api/v2#Region",
  "http://api.knora.org/ontology/knora-api/v2#hasColor": {
    "@id": "http://rdfh.ch/f1b0bb27b006/values/bed4d1420e27",
    "@type": "http://api.knora.org/ontology/knora-api/v2#ColorValue",
    "http://api.knora.org/ontology/knora-api/v2#colorValueAsColor": "#ff3333"
  },
  "http://api.knora.org/ontology/knora-api/v2#hasComment": {
    "@id": "http://rdfh.ch/f1b0bb27b006/values/38812bd00d27",
    "@type": "http://api.knora.org/ontology/knora-api/v2#TextValue",
    "http://api.knora.org/ontology/knora-api/v2#valueAsString": "Derselbe Holzschnitt wird auf Seite u1r verwendet."
  },
  "http://api.knora.org/ontology/knora-api/v2#hasGeometry": {
    "@id": "http://rdfh.ch/f1b0bb27b006/values/fbaa7e090e27",
    "@type": "http://api.knora.org/ontology/knora-api/v2#GeomValue",
    "http://api.knora.org/ontology/knora-api/v2#geometryValueAsGeometry": "{\\"status\\":\\"active\\",\\"lineColor\\":\\"#ff3333\\",\\"lineWidth\\":2,\\"points\\":[{\\"x\\":0.17532467532467533,\\"y\\":0.18049792531120332},{\\"x\\":0.8051948051948052,\\"y\\":0.17012448132780084},{\\"x\\":0.8311688311688312,\\"y\\":0.7261410788381742},{\\"x\\":0.19480519480519481,\\"y\\":0.7323651452282157},{\\"x\\":0.17857142857142858,\\"y\\":0.17842323651452283},{\\"x\\":0.18506493506493507,\\"y\\":0.1825726141078838},{\\"x\\":0.17857142857142858,\\"y\\":0.1825726141078838}],\\"type\\":\\"polygon\\"}"
  },
  "http://api.knora.org/ontology/knora-api/v2#isRegionOfValue": {
    "@id": "http://rdfh.ch/f1b0bb27b006/values/f8b6da78-fba7-43ff-b7ce-d2de0e12ae16",
    "@type": "http://api.knora.org/ontology/knora-api/v2#LinkValue",
    "http://api.knora.org/ontology/knora-api/v2#linkValueHasTarget": {
      "@id": "http://rdfh.ch/3a757e9e3003",
      "@type": "http://0.0.0.0:3333/ontology/0803/incunabula/v2#page",
      "http://www.w3.org/2000/01/rdf-schema#label": "c5v"
    }
  },
  "http://www.w3.org/2000/01/rdf-schema#label": "Derselbe Holzschnitt wird auf Seite u1r verwendet."
}
      `;
    const testRegionPolygon_compacted = JSON.parse(testRegionPolygon_compacted_json);
    const testRegionPolygon_resources: ReadResourcesSequence = ConvertJSONLD.createReadResourcesSequenceFromJsonLD(testRegionPolygon_compacted);
    return testRegionPolygon_resources.resources[0];
}

function createTestRegionCircle() {
    const testRegionCircle_compacted_json = `
{
  "@id": "http://rdfh.ch/2357e0d64407",
  "@type": "http://api.knora.org/ontology/knora-api/v2#Region",
  "http://api.knora.org/ontology/knora-api/v2#hasColor": {
    "@id": "http://rdfh.ch/2357e0d64407/values/65579b06ee2a",
    "@type": "http://api.knora.org/ontology/knora-api/v2#ColorValue",
    "http://api.knora.org/ontology/knora-api/v2#colorValueAsColor": "#3333ff"
  },
  "http://api.knora.org/ontology/knora-api/v2#hasComment": {
    "@id": "http://rdfh.ch/2357e0d64407/values/df03f593ed2a",
    "@type": "http://api.knora.org/ontology/knora-api/v2#TextValue",
    "http://api.knora.org/ontology/knora-api/v2#valueAsString": "Kolorierung in Rot"
  },
  "http://api.knora.org/ontology/knora-api/v2#hasGeometry": {
    "@id": "http://rdfh.ch/2357e0d64407/values/a22d48cded2a",
    "@type": "http://api.knora.org/ontology/knora-api/v2#GeomValue",
    "http://api.knora.org/ontology/knora-api/v2#geometryValueAsGeometry": "{\\"status\\":\\"active\\",\\"lineColor\\":\\"#3333ff\\",\\"lineWidth\\":2,\\"points\\":[{\\"x\\":0.3400735294117647,\\"y\\":0.45376078914919854}],\\"type\\":\\"circle\\",\\"radius\\":{\\"x\\":0.04595588235294118,\\"y\\":0.03082614056720101},\\"original_index\\":1}"
  },
  "http://api.knora.org/ontology/knora-api/v2#isRegionOfValue": {
    "@id": "http://rdfh.ch/2357e0d64407/values/74b82006-d4b2-4e06-8ca4-585753f49415",
    "@type": "http://api.knora.org/ontology/knora-api/v2#LinkValue",
    "http://api.knora.org/ontology/knora-api/v2#linkValueHasTarget": {
      "@id": "http://rdfh.ch/1a01fe39e701",
      "@type": "http://0.0.0.0:3333/ontology/0803/incunabula/v2#page",
      "http://www.w3.org/2000/01/rdf-schema#label": "o6r"
    }
  },
  "http://www.w3.org/2000/01/rdf-schema#label": "Kolorierung in Rot"
}
      `;
    const testRegionCircle_compacted = JSON.parse(testRegionCircle_compacted_json);
    const testRegionCircle_resources: ReadResourcesSequence = ConvertJSONLD.createReadResourcesSequenceFromJsonLD(testRegionCircle_compacted);
    return testRegionCircle_resources.resources[0];
}

function createTestRegionMulti() {
    const testRegionMulti_compacted_json = `
{
  "@id": "http://rdfh.ch/29c5b0b65732",
  "@type": "http://api.knora.org/ontology/knora-api/v2#Region",
  "http://api.knora.org/ontology/knora-api/v2#hasColor": {
    "@id": "http://rdfh.ch/29c5b0b65732/values/e4a0f250326101",
    "@type": "http://api.knora.org/ontology/knora-api/v2#ColorValue",
    "http://api.knora.org/ontology/knora-api/v2#colorValueAsColor": "#ff3333"
  },
  "http://api.knora.org/ontology/knora-api/v2#hasComment": {
    "@id": "http://rdfh.ch/29c5b0b65732/values/9b23f9a4316101",
    "@type": "http://api.knora.org/ontology/knora-api/v2#TextValue",
    "http://api.knora.org/ontology/knora-api/v2#valueAsString": "TESTREGION JUNI"
  },
  "http://api.knora.org/ontology/knora-api/v2#hasGeometry": [
    {
      "@id": "http://rdfh.ch/29c5b0b65732/values/5e4d4cde316101",
      "@type": "http://api.knora.org/ontology/knora-api/v2#GeomValue",
      "http://api.knora.org/ontology/knora-api/v2#geometryValueAsGeometry": "{\\"status\\":\\"active\\",\\"lineColor\\":\\"#ff3333\\",\\"lineWidth\\":2,\\"points\\":[{\\"x\\":0.5305232558139537,\\"y\\":0.3126142595978062}],\\"type\\":\\"circle\\",\\"radius\\":{\\"x\\":0.18023255813953487,\\"y\\":0.08957952468007313},\\"original_index\\":0}"
    },
    {
      "@id": "http://rdfh.ch/29c5b0b65732/values/21779f17326101",
      "@type": "http://api.knora.org/ontology/knora-api/v2#GeomValue",
      "http://api.knora.org/ontology/knora-api/v2#geometryValueAsGeometry": "{\\"status\\":\\"active\\",\\"lineColor\\":\\"#ff3333\\",\\"lineWidth\\":2,\\"points\\":[{\\"x\\":0.17296511627906977,\\"y\\":0.08226691042047532},{\\"x\\":0.7122093023255814,\\"y\\":0.16544789762340037}],\\"type\\":\\"rectangle\\",\\"original_index\\":1}"
    }
  ],
  "http://api.knora.org/ontology/knora-api/v2#isRegionOfValue": {
    "@id": "http://rdfh.ch/29c5b0b65732/values/d9ebd265-f4c5-4a5d-8943-06e97942c555",
    "@type": "http://api.knora.org/ontology/knora-api/v2#LinkValue",
    "http://api.knora.org/ontology/knora-api/v2#linkValueHasTarget": {
      "@id": "http://rdfh.ch/9ee8aa313503",
      "@type": "http://0.0.0.0:3333/ontology/0803/incunabula/v2#page",
      "http://www.w3.org/2000/01/rdf-schema#label": "d7v"
    }
  },
  "http://www.w3.org/2000/01/rdf-schema#label": "TESTREGION JUNI"
}
       `;
    const testRegionMulti_compacted = JSON.parse(testRegionMulti_compacted_json);
    const testRegionMulti_resources: ReadResourcesSequence = ConvertJSONLD.createReadResourcesSequenceFromJsonLD(testRegionMulti_compacted);
    return testRegionMulti_resources.resources[0];
}

import { inject, TestBed } from '@angular/core/testing';
import { BasicOntologyService } from './basic-ontology.service';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { HttpClient } from '@angular/common/http';
import { KuiCoreModule } from '../../core.module';

describe('BasicOntologyService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        KuiCoreModule.forRoot({ name: '', api: 'http://0.0.0.0:3333', app: '', media: '' })
      ],
      providers: [BasicOntologyService]
    });
  });

  it('should be created', inject([BasicOntologyService], (service: BasicOntologyService) => {
    expect(service).toBeTruthy();
  }));
});

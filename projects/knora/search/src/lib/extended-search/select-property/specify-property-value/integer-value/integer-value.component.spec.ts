import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IntegerValueComponent } from './integer-value.component';
import { MatCheckboxModule, MatFormFieldModule, MatIconModule, MatInputModule } from '@angular/material';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute } from '@angular/router';
import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { By } from '@angular/platform-browser';
import { KuiCoreConfig, KuiCoreConfigToken, ValueLiteral } from '@knora/core';

describe('IntegerValueComponent', () => {
    let testHostComponent: TestHostComponent;
    let testHostFixture: ComponentFixture<TestHostComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                IntegerValueComponent,
                TestHostComponent
            ],
            imports: [
                FormsModule,
                ReactiveFormsModule,
                MatFormFieldModule,
                MatIconModule,
                MatCheckboxModule,
                BrowserAnimationsModule,
                MatInputModule,
                RouterTestingModule.withRoutes([])
            ],
            providers: [
                {
                    provide: ActivatedRoute,
                    useValue: {
                        params: null
                    },
                },
                {
                    provide: KuiCoreConfigToken,
                    useValue: KuiCoreConfig
                },
                FormBuilder
            ]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        testHostFixture = TestBed.createComponent(TestHostComponent);
        testHostComponent = testHostFixture.componentInstance;
        testHostFixture.detectChanges();

        expect(testHostComponent).toBeTruthy();
    });

    it('should create', () => {
        // access the test host component's child
        expect(testHostComponent.integerValue).toBeTruthy();
    });

    it('should get a integer literal of 1.1', () => {
        // access the test host component's child
        expect(testHostComponent.integerValue).toBeTruthy();

        const hostCompDe = testHostFixture.debugElement;

        const intLiteralVal = new ValueLiteral('1', 'http://www.w3.org/2001/XMLSchema#integer');

        const decVal = hostCompDe.query(By.directive(IntegerValueComponent));

        const matInput = decVal.query(By.css('input'));

        matInput.nativeElement.value = '1';

        matInput.triggerEventHandler('input', {target: matInput.nativeElement});

        testHostFixture.detectChanges();

        expect(testHostComponent.integerValue.getValue()).toEqual(intLiteralVal);

    });

});

/**
 * Test host component to simulate parent component.
 */
@Component({
    selector: `host-component`,
    template: `
        <integer-value #intVal [formGroup]="form"></integer-value>`
})
class TestHostComponent implements OnInit {

    form;

    @ViewChild('intVal') integerValue: IntegerValueComponent;

    constructor(@Inject(FormBuilder) private fb: FormBuilder) {
    }

    ngOnInit() {
        this.form = this.fb.group({});

    }
}

import { Component, EventEmitter, Inject, Input, OnChanges, OnDestroy, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ResourceClass } from '@knora/core';
import { Subscription } from 'rxjs';

// https://stackoverflow.com/questions/45661010/dynamic-nested-reactive-form-expressionchangedafterithasbeencheckederror
const resolvedPromise = Promise.resolve(null);

@Component({
    selector: 'kui-select-resource-class',
    templateUrl: './select-resource-class.component.html',
    styleUrls: ['./select-resource-class.component.scss']
})
export class SelectResourceClassComponent implements OnInit, OnChanges, OnDestroy {

    @Input() formGroup: FormGroup;

    // setter method for resource classes when being updated by parent component
    @Input()
    set resourceClasses(value: Array<ResourceClass>) {
        this.resourceClassSelected = undefined; // reset on updates
        this._resourceClasses = value;
    }

    // getter method for resource classes (used in template)
    get resourceClasses() {
        return this._resourceClasses;
    }

    // event emitted to parent component once a resource class is selected by the user
    @Output() resourceClassSelectedEvent = new EventEmitter<string>();

    // available resource classes for selection
    private _resourceClasses: Array<ResourceClass>;

    // stores the currently selected resource class
    private resourceClassSelected: string;

    form: FormGroup;

    formSubscription: Subscription;

    constructor(@Inject(FormBuilder) private fb: FormBuilder) {
    }

    /**
     * Returns the Iri of the selected resource class.
     *
     * @returns the Iri of the selected resource class or false in case no resource class is selected.
     */
    getResourceClassSelected(): any {
        if (this.resourceClassSelected !== undefined && this.resourceClassSelected !== null) {
            return this.resourceClassSelected;
        } else {
            return false;
        }
    }

    /**
     * Initalizes the FormGroup for the resource class selection.
     * The initial value is set to null.
     */
    private initForm() {
        // build a form for the resource class selection
        this.form = this.fb.group({
            resourceClass: [null] // resource class selection is optional
        });

        // store and emit Iri of the resource class when selected
        this.formSubscription = this.form.valueChanges.subscribe((data) => {
            this.resourceClassSelected = data.resourceClass;
            this.resourceClassSelectedEvent.emit(this.resourceClassSelected);
        });
    }

    ngOnInit() {

        this.initForm();

        // add form to the parent form group
        this.formGroup.addControl('resourceClass', this.form);

    }

    ngOnDestroy() {

        if (this.formSubscription !== undefined) {
            this.formSubscription.unsubscribe();
        }
    }

    ngOnChanges() {

        if (this.form !== undefined) {

            // resource classes have been reinitialized
            // reset form
            resolvedPromise.then(() => {

                // unsubscribe from this.form.valueChanges subscription
                if (this.formSubscription !== undefined) {
                    this.formSubscription.unsubscribe();
                }

                // remove this form from the parent form group
                this.formGroup.removeControl('resourceClass');

                this.initForm();

                // add form to the parent form group
                this.formGroup.addControl('resourceClass', this.form);

            });

        }
    }

}

import { Component, Inject, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import {
    Cardinality,
    CardinalityOccurrence,
    ComparisonOperatorAndValue,
    Properties,
    Property,
    PropertyWithValue,
    ResourceClass
} from '@knora/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SpecifyPropertyValueComponent } from './specify-property-value/specify-property-value.component';
import { OntologyInformation } from '@knora/core';


// https://stackoverflow.com/questions/45661010/dynamic-nested-reactive-form-expressionchangedafterithasbeencheckederror
const resolvedPromise = Promise.resolve(null);

@Component({
    selector: 'kui-select-property',
    templateUrl: './select-property.component.html',
    styleUrls: ['./select-property.component.scss', '../../assets/style/search.scss']
})
export class SelectPropertyComponent implements OnInit, OnDestroy {

    // parent FormGroup
    @Input() formGroup: FormGroup;

    // index of the given property (unique)
    @Input() index: number;

    // setter method for properties when being updated by parent component
    @Input()
    set properties(value: Properties) {
        this.propertySelected = undefined; // reset selected property (overwriting any previous selection)
        this._properties = value;
        this.updatePropertiesArray();
    }

    get properties() {
        return this._properties;
    }

    _activeResourceClass: ResourceClass;

    // setter method for selected resource class
    @Input()
    set activeResourceClass(value: ResourceClass) {
        this._activeResourceClass = value;
    }

    // reference to child component: combination of comparison operator and value for chosen property
    @ViewChild('specifyPropertyValue') specifyPropertyValue: SpecifyPropertyValueComponent;

    // properties that can be selected from
    private _properties: Properties;

    // properties as an Array structure (based on this.properties)
    propertiesAsArray: Array<Property>;

    // represents the currently selected property
    propertySelected: Property;

    form: FormGroup;

    // unique name for this property to be used in the parent FormGroup
    propIndex: string;

    constructor (@Inject(FormBuilder) private fb: FormBuilder) {

    }

    ngOnInit() {

        // build a form for the property selection
        this.form = this.fb.group({
            property: [null, Validators.required],
            isSortCriterion: [false, Validators.required]
        });

        // update the selected property
        this.form.valueChanges.subscribe((data) => {
            const propIri = data.property;
            this.propertySelected = this._properties[propIri];
        });

        resolvedPromise.then(() => {
            this.propIndex = 'property' + this.index;

            // add form to the parent form group
            this.formGroup.addControl(this.propIndex, this.form);
        });

    }

    ngOnDestroy() {

        // remove form from the parent form group
        resolvedPromise.then(() => {
            this.formGroup.removeControl(this.propIndex);
        });
    }

    /**
     * Indicates if property can be used as a sort criterion.
     * Property has to have cardinality or max cardinality 1 for the chosen resource class.
     *
     * We cannot sort by properties whose cardinality is greater than 1.
     * Return boolean
     */
    sortCriterion() {

        // check if a resource class is selected and if the property's cardinality is 1 for the selected resource class
        if (this._activeResourceClass !== undefined && this.propertySelected !== undefined && !this.propertySelected.isLinkProperty) {

            const cardinalities: Cardinality[] = this._activeResourceClass.cardinalities.filter(
                (card: Cardinality) => {
                    // cardinality 1 or max occurrence 1
                    return card.property === this.propertySelected.id
                        && card.value === 1
                        && (card.occurrence === CardinalityOccurrence.card || card.occurrence === CardinalityOccurrence.maxCard);

                }
            );

            return cardinalities.length === 1;
        } else {
            return false;
        }

    }

    /**
     * Updates the properties array that is accessed by the template.
     */
    private updatePropertiesArray() {

        // represent the properties as an array to be accessed by the template
        const propsArray = [];

        for (const propIri in this._properties) {
            if (this._properties.hasOwnProperty(propIri)) {
                const prop = this._properties[propIri];

                // only list editable props that are not link value props
                if (prop.isEditable && !prop.isLinkValueProperty) {
                    propsArray.push(this._properties[propIri]);
                }
            }
        }

        // sort properties by label (ascending)
        propsArray.sort(OntologyInformation.sortFunc);

        this.propertiesAsArray = propsArray;
    }

    /**
     * Returns the selected property with the specified value.
     */
    getPropertySelectedWithValue(): PropertyWithValue {

        const propVal: ComparisonOperatorAndValue = this.specifyPropertyValue.getComparisonOperatorAndValueLiteralForProperty();

        let isSortCriterion = false;

        // only non linking properties can be used for sorting
        if (!this.propertySelected.isLinkProperty) {
            isSortCriterion = this.form.value.isSortCriterion;
        }

        return new PropertyWithValue(this.propertySelected, propVal, isSortCriterion);

    }


}

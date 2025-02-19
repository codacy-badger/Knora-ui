import { animate, state, style, transition, trigger } from '@angular/animations';
import { ConnectionPositionPair, Overlay, OverlayConfig, OverlayRef, PositionStrategy } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { Component, Input, TemplateRef, ViewChild, ViewContainerRef, ElementRef } from '@angular/core';

/**
 * The search-panel contains the kui-fulltext-search and the kui-extended-search components.
 */
@Component({
    selector: 'kui-search-panel',
    templateUrl: './search-panel.component.html',
    styleUrls: ['./search-panel.component.scss', '../assets/style/search.scss']
})
export class SearchPanelComponent {
    /**
     * @param  {string} route Route to navigate after search. This route path should contain a component for search results.
     */
    @Input() route: string = '/search';

    /**
     *@param  {boolean} [projectfilter] If true it shows the selection of projects to filter by one of them
     */
    @Input() projectfilter?: boolean = false;

    /**
     * @param  {string} [filterbyproject] If your full-text search should be filtered by one project, you can define it with project iri in the parameter filterbyproject.
     */
    @Input() filterbyproject?: string;

    @ViewChild('fullSearchPanel') searchPanel: ElementRef;
    @ViewChild('extendedSearchMenu') searchMenu: TemplateRef<any>;

    showMenu: boolean = false;
    focusOnExtended: string = 'inactive';

    // overlay reference
    overlayRef: OverlayRef;

    constructor (private _overlay: Overlay,
        private _viewContainerRef: ViewContainerRef, ) { }

    /**
     * Show or hide the extended search menu
     * @ignore
     *
     */
    toggleMenu(): void {
        this.showMenu = !this.showMenu;
        this.focusOnExtended =
            this.focusOnExtended === 'active' ? 'inactive' : 'active';
    }

    openPanelWithBackdrop() {
        const config = new OverlayConfig({
            hasBackdrop: true,
            backdropClass: 'cdk-overlay-transparent-backdrop',
            // backdropClass: 'cdk-overlay-dark-backdrop',
            positionStrategy: this.getOverlayPosition(),
            scrollStrategy: this._overlay.scrollStrategies.block()
        });

        this.overlayRef = this._overlay.create(config);
        this.overlayRef.attach(new TemplatePortal(this.searchMenu, this._viewContainerRef));
        this.overlayRef.backdropClick().subscribe(() => {
            this.overlayRef.detach();
        });
    }

    getOverlayPosition(): PositionStrategy {
        const positions = [
            new ConnectionPositionPair({ originX: 'start', originY: 'bottom' }, { overlayX: 'start', overlayY: 'top' }),
            new ConnectionPositionPair({ originX: 'start', originY: 'top' }, { overlayX: 'start', overlayY: 'bottom' })
        ];

        const overlayPosition = this._overlay.position().flexibleConnectedTo(this.searchPanel).withPositions(positions).withLockedPosition(false);

        return overlayPosition;
    }

    closeMenu(): void {
        this.overlayRef.detach();
    }
}

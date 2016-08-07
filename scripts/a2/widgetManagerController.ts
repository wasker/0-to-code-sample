import { upgradeAdapter } from "./upgrade";
import { Component, Input, Inject } from "@angular/core";

import { testWidgetComponent } from "./testWidgetComponent"; 

export const WidgetTable = upgradeAdapter.upgradeNg1Component("widgetTable");
export const WidgetEditor = upgradeAdapter.upgradeNg1Component("widgetEditor");

/** Widget manager controller. */
@Component({
	selector: "widget-manager",
	directives: [WidgetTable, WidgetEditor, testWidgetComponent],
	template: `
<div class="alert alert-danger" *ngIf="model.errorMessage">
	{{model.errorMessage}}
</div>

<test-widget [widgets]="model.widgets"></test-widget>

<!-- Must use camelCase instead of kebab-case. -->
<!-- $event contains data that is passed by the caller, no need to use structs (keeping to be compatible with v1). -->
<widget-table [(model)]="model.widgets"
			  tableClass="table-striped"
			  (onEditWidget)="editWidget($event.widget)" 
			  (onDeleteWidget)="deleteWidget($event.widget)" 
			  (onUndeleteWidget)="undeleteWidget($event.widget)"></widget-table>

<div class="row">

	<div class="col-xs-12">

		<button id="add-widget" 
				(click)="addWidget()" 
				[disabled]="model.operationInProgress">Add</button>

	</div>
	
</div>

<div id="widgetEditorHost" class="modal">
	<div class="modal-dialog">
		<div class="modal-content">

			<widget-editor [(model)]="editWidgetModel" *ngIf="editWidgetModel"></widget-editor>

		</div>
	</div>
</div>
	`
})
export class WidgetManagerController implements WidgetRegistry.IWidgetManagerController {
	static DowngradeDirectiveName = "widgetManager";

	constructor(
		@Inject("appConfig") private appConfig: WidgetRegistry.AppConfig,
		@Inject("widgetService") private widgetService: WidgetRegistry.IWidgetService,
		@Inject("modalHostFactory") private modalHostFactory: WidgetRegistry.IModalHostFactory,
		@Inject("$q") private $promise: ng.IQService) {

	}

	/** Part of ng.IComponentController. */		
	public ngOnInit(): void {
		this.performOperation(this.widgetService.getWidgets()
			.then((widgets: WidgetRegistry.WidgetList) => this.model.widgets = widgets)
			.catch(() => this.model.errorMessage = "Cannot get list of widgets. Please try again later."));
	}

	/** Part of IWidgetManagerController. */
	public model: WidgetRegistry.WidgetManagerModel = {
		widgets: [],
		operationInProgress: false
	};

	/** Part of IWidgetManagerController. */
	public editWidgetModel: WidgetRegistry.WidgetEditorModel;

	/** Part of IWidgetManagerController. */
	public addWidget = (): void => {
		let widget: WidgetRegistry.Widget = {
			$state: WidgetRegistry.WidgetState.new,
			id: (Math.random() * 100).toFixed(0),
			name: "",
			amount: Math.floor(Math.random() * 1000),
			description: ""
		};
	
		this.editWidgetImpl(widget, this.widgetService.createWidget).then(() => {
			this.model.widgets.push(widget);
		});	
	}
	
	/** Part of IWidgetManagerController. */
	public editWidget = (widget: WidgetRegistry.Widget): void => {
		let selectedWidget = angular.copy(widget);
	
		this.editWidgetImpl(selectedWidget, this.widgetService.updateWidget).then(() => {
			angular.copy(selectedWidget, widget);
		});	
	}

	/** Part of IWidgetManagerController. */
	public deleteWidget = (widget: WidgetRegistry.Widget): void => {
		let widgetWasNew = (widget.$state && WidgetRegistry.WidgetState.new == widget.$state);
		widget.$state = WidgetRegistry.WidgetState.deleting;

		this.performOperation(
			this.widgetService.deleteWidget(widget)
				.then(() => {
					if (widgetWasNew) {
						//	Delete newly created widgets.
						let idx = this.model.widgets.indexOf(widget);
						if (idx > -1) {
							this.model.widgets.splice(idx, 1);
						}
					}
					else {
						//	Allow to undo when an existing widget was deleted.
						widget.$state = WidgetRegistry.WidgetState.deleted;
					}
				})
				.catch(() => {
					widget.$state = (widgetWasNew) ? WidgetRegistry.WidgetState.new : WidgetRegistry.WidgetState.existing;
					this.model.errorMessage = "Cannot delete widget. Please try again later.";
				}));
	}

	/** Part of IWidgetManagerController. */
	public undeleteWidget = (widget: WidgetRegistry.Widget): void => {
		widget.$state = WidgetRegistry.WidgetState.undeleting;

		this.performOperation(
			this.widgetService.undoWidgetDelete(widget)
				.then(() => {
					widget.$state = WidgetRegistry.WidgetState.existing;
				})
				.catch(() => {
					widget.$state = WidgetRegistry.WidgetState.deleted;
					this.model.errorMessage = "Cannot restore deleted widget. Please try again later.";
				}));
	}

	/** Wraps an operation with operationInProgress indicator. */		
	private performOperation = (operationPromise: ng.IPromise<any>): void => {
		this.model.operationInProgress = true;
		this.model.errorMessage = "";

		operationPromise.finally(() => this.model.operationInProgress = false);
	}
	
	/** Invokes widget editor. */		
	private editWidgetImpl = (widget: WidgetRegistry.Widget, callback: WidgetRegistry.WidgetOperationCallback): ng.IPromise<any> => {
		let modalHost = this.modalHostFactory.create("#widgetEditorHost", {
			show: true,
			keyboard: false,
			backdrop: "static"
		});			

		this.editWidgetModel = {
			widget,
			deferred: modalHost.getDeferred(),
			performWidgetOperation: callback
		};

		return modalHost.show().finally(() => {
			delete this.editWidgetModel;
		});
	}
}

/// <reference path="../appTypes.d.ts" />

namespace WidgetRegistry {

	/** Widget manager controller. */	
	class WidgetManagerController implements IWidgetManagerController {
		/** Dependencies. */
		public static $inject = ["appConfig", "widgetService", "$q"];

		constructor(
			private appConfig: AppConfig,
			private widgetService: IWidgetService,
			private $promise: ng.IQService) {

		}

		/** Part of ng.IComponentController. */		
		public $onInit = (): void => {
			this.performOperation(this.widgetService.getWidgets()
				.then((widgets: WidgetList) => this.model.widgets = widgets)
				.catch(() => this.model.errorMessage = "Cannot get list of widgets. Please try again later."));
		}

		/** Part of IWidgetManagerController. */
		public model: WidgetManagerModel = {
			widgets: [],
			operationInProgress: false
		};

		/** Part of IWidgetManagerController. */
		public editWidgetModel: WidgetEditorModel;

		/** Part of IWidgetManagerController. */
		public addWidget = (): void => {
			let widget: Widget = {
				$state: WidgetState.new,
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
		public editWidget = (widget: Widget): void => {
			let selectedWidget = angular.copy(widget);
		
			this.editWidgetImpl(selectedWidget, this.widgetService.updateWidget).then(() => {
				angular.copy(selectedWidget, widget);
			});	
		}

		/** Part of IWidgetManagerController. */
		public deleteWidget = (widget: Widget): void => {
			let widgetWasNew = (widget.$state && WidgetState.new == widget.$state);
			widget.$state = WidgetState.deleting;

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
							widget.$state = WidgetState.deleted;
						}
					})
					.catch(() => {
						widget.$state = (widgetWasNew) ? WidgetState.new : WidgetState.existing;
						this.model.errorMessage = "Cannot delete widget. Please try again later.";
					}));
		}

		/** Part of IWidgetManagerController. */
		public undeleteWidget = (widget: Widget): void => {
			widget.$state = WidgetState.undeleting;

			this.performOperation(
				this.widgetService.undoWidgetDelete(widget)
					.then(() => {
						widget.$state = WidgetState.existing;
					})
					.catch(() => {
						widget.$state = WidgetState.deleted;
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
		private editWidgetImpl = (widget: Widget, callback: WidgetOperationCallback): ng.IPromise<any> => {
			let deferred = this.$promise.defer();

			this.editWidgetModel = {
				widget,
				deferred,
				performWidgetOperation: callback
			};

			let modalHost = angular.element("#widgetEditorHost");			

			let promise = deferred.promise;
			promise.finally(() => {
				modalHost.modal("hide");
				delete this.editWidgetModel;
			});
			
			modalHost.modal({
				show: true,
				keyboard: false,
				backdrop: "static"
			});

			return promise;
		}
	}

	//	Register with application module.	
	angular.module(appModuleName).component("widgetManager", {
		templateUrl: "/templates/widgetManager.html",	// TODO
		controller: WidgetManagerController
	});

}

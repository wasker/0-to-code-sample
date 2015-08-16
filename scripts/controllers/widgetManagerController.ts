/// <reference path="../appTypes.d.ts" />

namespace WidgetRegistry {

	/** Widget manager controller. */	
	export class WidgetManagerController {
		/** Dependencies. */
		public static $inject = ["appConfig", "$scope", "widgetService", "$modal"];

		constructor(
			private appConfig: AppConfig,
			private $scope: WidgetManagerScope,
			private widgetService: IWidgetService,
			private $modal: ng.ui.bootstrap.IModalService) {

			$scope.model = {
				widgets: [],
				operationInProgress: false
			};
			$scope.addWidget = this.addWidget;
			$scope.editWidget = this.editWidget;
			$scope.deleteWidget = this.deleteWidget;
			$scope.undeleteWidget = this.undeleteWidget;

			this.performOperation(this.widgetService.getWidgets()
				.then((widgets: WidgetList) => this.$scope.model.widgets = widgets)
				.catch(() => this.$scope.model.errorMessage = "Cannot get list of widgets. Please try again later."));
		}

		/** Wraps an operation with operationInProgress indicator. */		
		private performOperation = (operationPromise: ng.IPromise<any>): void => {
			this.$scope.model.operationInProgress = true;
			this.$scope.model.errorMessage = "";

			operationPromise.finally(() => this.$scope.model.operationInProgress = false);
		}

		/** Part of WidgetManagerScope. */		
		private addWidget = (): void => {
			var widget: Widget = {
				$state: WidgetState.new,
				id: (Math.random() * 100).toFixed(0),
				name: "",
				amount: Math.floor(Math.random() * 1000),
				description: ""
			};
		
			this.editWidgetImpl(widget, this.widgetService.createWidget).then(() => {
				this.$scope.model.widgets.push(widget);
			});	
		}
		
		/** Part of WidgetManagerScope. */		
		private editWidget = (widget: Widget): void => {
			var selectedWidget = angular.copy(widget);
		
			this.editWidgetImpl(selectedWidget, this.widgetService.updateWidget).then(() => {
				angular.copy(selectedWidget, widget);
			});	
		}

		/** Part of WidgetManagerScope. */		
		private deleteWidget = (widget: Widget): void => {
			var widgetWasNew = (widget.$state && WidgetState.new == widget.$state);
			widget.$state = WidgetState.deleting;

			this.performOperation(
				this.widgetService.deleteWidget(widget)
					.then(() => {
						if (widgetWasNew) {
							//	Delete newly created widgets.
							var idx = this.$scope.model.widgets.indexOf(widget);
							if (idx > -1) {
								this.$scope.model.widgets.splice(idx, 1);
							}
						}
						else {
							//	Allow to undo when an existing widget was deleted.
							widget.$state = WidgetState.deleted;
						}
					})
					.catch(() => {
						widget.$state = (widgetWasNew) ? WidgetState.new : WidgetState.existing;
						this.$scope.model.errorMessage = "Cannot delete widget. Please try again later.";
					}));
		}

		/** Part of WidgetManagerScope. */		
		private undeleteWidget = (widget: Widget): void => {
			widget.$state = WidgetState.undeleting;

			this.performOperation(
				this.widgetService.undoWidgetDelete(widget)
					.then(() => {
						widget.$state = WidgetState.existing;
					})
					.catch(() => {
						widget.$state = WidgetState.deleted;
						this.$scope.model.errorMessage = "Cannot restore deleted widget. Please try again later.";
					}));
		}
		
		/** Invokes widget editor. */		
		private editWidgetImpl = (widget: Widget, callback: WidgetOperationCallback): ng.IPromise<any> => {
			return this.$modal.open({
				resolve: {
					model: (): WidgetEditorModel => {
						return {
							widget: widget,
							performWidgetOperation: callback
						};
					}
				},
				templateUrl: this.$scope.pathToTemplate("widgetEditor.html"),
				controller: "widgetEditorController"
			}).result;	
		}
	}

	//	Register with application module.	
	angular.module(appModuleName).controller("widgetManagerController", WidgetManagerController);

}

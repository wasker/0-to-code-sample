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
				amount: Math.random() * 1000,
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
			alert("delete");
			widget.$state = WidgetState.deleted;
		}

		/** Part of WidgetManagerScope. */		
		private undeleteWidget = (widget: Widget): void => {
			alert("undelete");
			widget.$state = WidgetState.existing;
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

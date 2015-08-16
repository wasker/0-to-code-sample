/// <reference path="../appTypes.d.ts" />

namespace WidgetRegistry {

	/** Widget manager controller. */	
	export class WidgetManagerController {
		/** Dependencies. */
		public static $inject = ["appConfig", "$scope", "widgetService"];

		constructor(
			private appConfig: AppConfig,
			private $scope: WidgetManagerScope,
			private widgetService: IWidgetService) {

			$scope.model = {
				widgets: [],
				operationInProgress: false
			};
			$scope.addWidget = this.addWidget;
			$scope.editWidget = this.editWidget;
			$scope.deleteWidget = this.deleteWidget;
			$scope.undeleteWidget = this.undeleteWidget;

			this.performOperation(this.widgetService.getWidgets()
				.then((widgets: WidgetList) => this.hello(widgets))
				.catch(() => this.$scope.model.errorMessage = "Cannot get list of widgets. Please try again later."));
		}
		
		private hello = (widgets: WidgetList) =>{
			this.$scope.model.widgets = widgets;
		}

		/** Wraps an operation with operationInProgress indicator. */		
		private performOperation = (operationPromise: ng.IPromise<any>): void => {
			this.$scope.model.operationInProgress = true;
			this.$scope.model.errorMessage = "";

			operationPromise.finally(() => this.$scope.model.operationInProgress = false);
		}

		/** Part of WidgetManagerScope. */		
		private addWidget = (): void => {
		}

		/** Part of WidgetManagerScope. */		
		private editWidget = (widget: Widget): void => {
		}

		/** Part of WidgetManagerScope. */		
		private deleteWidget = (widget: Widget): void => {
		}

		/** Part of WidgetManagerScope. */		
		private undeleteWidget = (widget: Widget): void => {
		}
	}

	//	Register with application module.	
	angular.module(appModuleName).controller("widgetManagerController", WidgetManagerController);

}

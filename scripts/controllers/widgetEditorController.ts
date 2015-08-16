/// <reference path="../appTypes.d.ts" />

namespace WidgetRegistry {

	/** Widget editor controller. */
	export class WidgetEditorController {
		/** Dependencies. */
		public static $inject = ["model", "appConfig", "$scope", "$modalInstance"];

		constructor(
			model: WidgetEditorModel,
			private appConfig: AppConfig,
			private $scope: WidgetEditorScope,
			private $modalInstance: ng.ui.bootstrap.IModalServiceInstance) {

			$scope.model = model;
			$scope.model.isValid = true;
			$scope.model.operationInProgress = false;
			$scope.ok = this.ok;
			$scope.cancel = () => $modalInstance.dismiss();
		}

		/** Part of WidgetEditorScope. */		
		private ok = (): void => {
			if (!this.isValid()) {
				this.$scope.model.isValid = false;
				return;
			}
			this.$scope.model.isValid = true;

			this.performOperation(
				this.$scope.model.performWidgetOperation(this.$scope.model.widget)
					.then(() => this.$modalInstance.close())
					.catch(() => this.$scope.model.errorMessage = "We cannot save your changes now. Please try again later."));
		}

		/** Part of WidgetEditorScope. */		
		private isValid = (): boolean => {
			return !!this.$scope.model.widget.name;
		}

		/** Wraps an operation with operationInProgress indicator. */		
		private performOperation = (operationPromise: ng.IPromise<any>): void => {
			this.$scope.model.operationInProgress = true;
			this.$scope.model.errorMessage = "";

			operationPromise.finally(() => this.$scope.model.operationInProgress = false);
		}
	}

	//	Register with application module.	
	angular.module(appModuleName).controller("widgetEditorController", WidgetEditorController);
}

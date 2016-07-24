namespace WidgetRegistry {

	/** Widget editor controller. */
	class WidgetEditorController implements IWidgetEditorController {
		/** Dependencies. */
		public static $inject = ["appConfig"];

		constructor(
			private appConfig: AppConfig) {

		}

		/** Part of ng.IComponentController. */		
		public $onInit = (): void => {
			this.model.isValid = true;
			this.model.operationInProgress = false;
		}

		/** Part of IWidgetEditorController. */
		public model: WidgetEditorModel;

		/** Part of IWidgetEditorController. */
		public ok = (): void => {
			if (!this.isValid()) {
				this.model.isValid = false;
				return;
			}
			this.model.isValid = true;

			this.performOperation(
				this.model.performWidgetOperation(this.model.widget)
					.then(this.model.deferred.resolve)
					.catch(() => this.model.errorMessage = "We cannot save your changes now. Please try again later."));
		}

		/** Part of IWidgetEditorController. */
		public cancel = () => this.model.deferred.reject();

		/** Part of IWidgetEditorController. */
		public isValid = (): boolean => !!this.model.widget.name;

		/** Wraps an operation with operationInProgress indicator. */		
		private performOperation = (operationPromise: ng.IPromise<any>): void => {
			this.model.operationInProgress = true;
			this.model.errorMessage = "";

			operationPromise.finally(() => this.model.operationInProgress = false);
		}
	}

	//	Register with application module.	
	angular.module(appModuleName).component("widgetEditor", {
		templateUrl: "/templates/widgetEditor.html",	// TODO
		bindings: {
			model: "="
		},
		controller: WidgetEditorController
	});
}

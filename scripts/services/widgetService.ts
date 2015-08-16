/// <reference path="../appTypes.d.ts" />

namespace WidgetRegistry {

	/** Backend service communications. */	
	export class WidgetService implements IWidgetService {
		//	Dependencies.
		public static $inject = ["appConfig", "$q"];

		constructor(
			private appConfig: AppConfig,
			private promise: ng.IQService) {
		}

		/** Part of IWidgetService. */		
		public getWidgets = (): ng.IPromise<WidgetList> => {
			var operation = this.promise.defer();
			
			operation.resolve([{
				id: "widget_1",
				name: "Some widget",
				amount: 100,
				description: "This is the best widget ever"
			}]);
			
			return operation.promise;
		}

		/** Part of IWidgetService. */		
		public createWidget = (widget: Widget): ng.IPromise<any> => {
			var operation = this.promise.defer();
			operation.resolve();
			
			return operation.promise;
		}

		/** Part of IWidgetService. */		
		public updateWidget = (widget: Widget): ng.IPromise<any> => {
			var operation = this.promise.defer();
			operation.resolve();
			
			return operation.promise;
		}

		/** Part of IWidgetService. */		
		public deleteWidget = (widget: Widget): ng.IPromise<any> => {
			var operation = this.promise.defer();
			operation.resolve();
			
			return operation.promise;
		}

		/** Part of IWidgetService. */		
		public undoWidgetDelete = (widget: Widget): ng.IPromise<any> => {
			var operation = this.promise.defer();
			operation.resolve();
			
			return operation.promise;
		}
	}

	//	Register with application module.	
	angular.module(appModuleName).service("widgetService", WidgetService);

}

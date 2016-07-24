namespace WidgetRegistry {

	/** Backend service communications. */	
	export class WidgetService implements IWidgetService {
		//	Dependencies.
		public static $inject = ["appConfig", "$q", "$http"];

		constructor(
			private appConfig: AppConfig,
			private $q: ng.IQService,
			private $http: ng.IHttpService) {
		}

		/** Part of IWidgetService. */
		public getWidgets = (): ng.IPromise<WidgetList> => {
			return this.httpPromiseAsPromise(this.$http.get(this.appConfig.apiEndpoint + "all"));
		}

		/** Part of IWidgetService. */
		public createWidget = (widget: Widget): ng.IPromise<any> => {
			return this.httpPromiseAsPromise(this.$http.put(this.appConfig.apiEndpoint, widget));
		}

		/** Part of IWidgetService. */
		public updateWidget = (widget: Widget): ng.IPromise<any> => {
			return this.httpPromiseAsPromise(this.$http.post(this.appConfig.apiEndpoint, widget));
		}

		/** Part of IWidgetService. */
		public deleteWidget = (widget: Widget): ng.IPromise<any> => {
			return this.httpPromiseAsPromise(this.$http.delete(this.appConfig.apiEndpoint, { params: widget }));
		}

		/** Part of IWidgetService. */
		public undoWidgetDelete = (widget: Widget): ng.IPromise<any> => {
			return this.httpPromiseAsPromise(this.$http.patch(this.appConfig.apiEndpoint, { params: widget }));
		}

		/** 
		 * Converts HTTP operation promise to a generic promise.
		 * It's not necessary to do. Instead IWidgetService should've used IHttpPromise<T> for return values.
		 * @param httpPromise HTTP operation promise to convert.
		 */        
		private httpPromiseAsPromise = <T>(httpPromise: ng.IHttpPromise<T>): ng.IPromise<T> => {
			var deferred = this.$q.defer();
			httpPromise
				.success(response => deferred.resolve(response))
				.error((data: any, status: number) => deferred.reject(status));

			return deferred.promise;
		}
	}
	
	//	Register with application module.	
	angular.module(appModuleName).service("widgetService", WidgetService);

}

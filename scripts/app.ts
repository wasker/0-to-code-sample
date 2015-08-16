/// <reference path="appTypes.d.ts" />
/// <reference path="../typings/angular-ui-router/angular-ui-router.d.ts" />

namespace WidgetRegistry {

	//	Configure application module name.	
	appModuleName = "widgetRegistryApp";

	//	Create application module.	
	var app = angular.module(appModuleName, ["widgetRegistryData", "ui.router", "ui.bootstrap"]);

	//	Configure application module.	
	app.config(["appConfig", "$stateProvider", "$urlRouterProvider", function (appConfig: AppConfig, $stateProvider: ng.ui.IStateProvider, $urlRouterProvider: ng.ui.IUrlRouterProvider) {
		$stateProvider
			.state("root", {
				url: "/",
				controller: "widgetManagerController",
				templateUrl: getPathToTemplate(appConfig, "index.html")
			});

		$urlRouterProvider.otherwise("/");
	}]);

	//	Initialize application module.	
	app.run(["appConfig", "$rootScope", function(appConfig: AppConfig, $rootScope: ng.IRootScopeService) {
		//	Expose global functions on root scope.
		(<ng.IScope>$rootScope).pathToTemplate = (fileName: string) => getPathToTemplate(appConfig, fileName);
	}]);

	/**
	 * Constructs full path to template.
	 * @param appConfig Application configuration. 
	 * @param fileName Template file name without path.
	 */	
	function getPathToTemplate(appConfig: AppConfig, fileName: string): string {
		return appConfig.templateRoot + fileName;
	}

}

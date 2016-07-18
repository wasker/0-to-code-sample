/// <reference path="../typings/angular-ui-router/angular-ui-router.d.ts" />

import { Component } from "@angular/core";

@Component({
	selector: "my-app",
	template: "<h1>My First Angular 2 App</h1>"
})
export class AppComponent { }

// //	Configure application module name.
// export var appModuleName = "widgetRegistryApp";

// //	Create application module.	
// var app = angular.module(appModuleName, ["widgetRegistryData", "ui.router", "ui.bootstrap"]);

// //	Configure application module.	
// app.config(["appConfig", "$stateProvider", "$urlRouterProvider", function (appConfig: WidgetRegistryTypes.AppConfig, $stateProvider: ng.ui.IStateProvider, $urlRouterProvider: ng.ui.IUrlRouterProvider) {
// 	$stateProvider
// 		.state("root", {
// 			url: "/",
// 			templateUrl: getPathToTemplate(appConfig, "index.html")
// 		});

// 	$urlRouterProvider.otherwise("/");
// }]);

// //	Initialize application module.	
// app.run(["appConfig", "$rootScope", function(appConfig: WidgetRegistryTypes.AppConfig, $rootScope: ng.IRootScopeService) {
// 	//	Expose global functions on root scope.
// 	(<ng.IScope>$rootScope).pathToTemplate = (fileName: string) => getPathToTemplate(appConfig, fileName);
// }]);

// /**
//  * Constructs full path to template.
//  * @param appConfig Application configuration. 
//  * @param fileName Template file name without path.
//  */	
// function getPathToTemplate(appConfig: WidgetRegistryTypes.AppConfig, fileName: string): string {
// 	return appConfig.templateRoot + fileName;
// }

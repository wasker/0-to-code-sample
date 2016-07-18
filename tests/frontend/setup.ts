/// <reference path="_references.d.ts" />

/** Mock application module information. */
interface WidgetRegistryAppMock {
	config: WidgetRegistry.AppConfig;
}

/** Mock controllers for application. */
interface WidgetRegistryControllerMock {
	/** Controller factory. */
	factory: ng.IComponentControllerService;

	/** Root scope. */	
	rootScope: ng.IRootScopeService;

	/** Modal service. */	
	modal: ng.ui.bootstrap.IModalService;

	/** Q service. */	
	promises: ng.IQService;	
}

/** Mock widgetService instance and utilities. */
interface WidgetServiceMock {
	/** $httpBackend service instance. */
	httpMock: ng.IHttpBackendService;

	/** Service instance. */	
	instance: WidgetRegistry.IWidgetService;
}

/** Starts mock application. */
function startApplication(): WidgetRegistryAppMock {
	var result = {
		config: {
			apiEndpoint: "/api/widgets/",
			templateRoot: "/templates/"
		}
	};

	var appData = angular.module("widgetRegistryData", []);
	appData.constant("appConfig", result.config);

	angular.mock.module("widgetRegistryApp");

	//	Fake successful downloads for templates.
	angular.mock.inject(($httpBackend: ng.IHttpBackendService) => {
		$httpBackend.whenGET(/templates\/.+/).respond(200);
	});
	
	return result;
}

/** Mocks controller. */
function mockWidgetRegistryController(): WidgetRegistryControllerMock {
	var result = <WidgetRegistryControllerMock>{};

	angular.mock.inject(($componentController: ng.IComponentControllerService, $rootScope: ng.IRootScopeService, $modal: ng.ui.bootstrap.IModalService, $q: ng.IQService) => {
		result.factory = $componentController;
		result.rootScope = $rootScope;
		result.modal = $modal;
		result.promises = $q;
	});

	return result;
}

/** Mocks widgetService. */
function mockWidgetService(): WidgetServiceMock {
	var result = <WidgetServiceMock>{};

	angular.mock.inject((widgetService: WidgetRegistry.IWidgetService, $httpBackend: ng.IHttpBackendService) => {
		result.httpMock = $httpBackend;
		result.instance = widgetService;
	});

	return result;
}

/** Creates fake widget instance. */	
function createFakeWidgetInstance(): WidgetRegistry.Widget {
	return {
		id: "123",
		name: "some widget",
		amount: 5
	};
}

/** Creates regular expression to match any API endpoint URL with query parameters. */
function getEndpointWithQueryStringRegexp(config: WidgetRegistry.AppConfig): RegExp {
	return new RegExp(config.apiEndpoint + "\?.*");
}

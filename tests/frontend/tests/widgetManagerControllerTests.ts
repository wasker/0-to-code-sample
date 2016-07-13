/// <reference path="../setup.ts" />

describe("widgetManagerController", function() {

	var controllerName = "widgetManagerController";

	var app = <WidgetRegistryAppMock>{};	
	var controller = <WidgetRegistryControllerMock>{};
	var service = <WidgetServiceMock>{};

	beforeEach(function() {
		app = startApplication();
		controller = mockWidgetRegistryController();
		service = mockWidgetService();
	});

	afterEach(function() {
		service.httpMock.verifyNoOutstandingExpectation();
		service.httpMock.verifyNoOutstandingRequest();
	});

	it("initializes scope", function() {
		var expectedData = setupGetWidgetsSuccess();
		var scope = <WidgetRegistry.WidgetManagerScope>controller.rootScope.$new();
		
		controller.factory(controllerName, {
			appConfig: app.config,
			$scope: scope,
			widgetService: service.instance,
			$modal: controller.modal
		});

		expect(scope.model).toBeDefined();
		expect(scope.model.errorMessage).toBeFalsy();
		expect(scope.addWidget).toBeDefined();
		expect(scope.editWidget).toBeDefined();
		expect(scope.deleteWidget).toBeDefined();
		expect(scope.undeleteWidget).toBeDefined();

		expect(scope.model.operationInProgress).toBe(true);
		service.httpMock.flush();

		expect(scope.model.widgets).toEqual(expectedData);
		expect(scope.model.operationInProgress).toBe(false);
	});

	it("shows error if get all widgets operation fails", function() {
		service.httpMock.expectGET(app.config.apiEndpoint + "all").respond(500);
		var scope = <WidgetRegistry.WidgetManagerScope>controller.rootScope.$new();
		
		controller.factory(controllerName, {
			appConfig: app.config,
			$scope: scope,
			widgetService: service.instance,
			$modal: controller.modal
		});

		expect(scope.model).toBeDefined();
		expect(scope.model.errorMessage).toBeFalsy();

		expect(scope.model.operationInProgress).toBe(true);
		service.httpMock.flush();

		expect(scope.model.widgets).toEqual([]);
		expect(scope.model.operationInProgress).toBe(false);
		expect(scope.model.errorMessage).toBeTruthy();
	});

	it("adds a new widget to list if operation completes successfully", function() {
		var data = setupGetWidgetsSuccess();
		var scope = createController(<WidgetRegistry.WidgetManagerScope>controller.rootScope.$new());

		var deferred = controller.promises.defer();		
		spyOn(controller.modal, "open").and.returnValue({ result: deferred.promise });

		scope.addWidget();
		deferred.resolve();

		deferred.promise.finally(() => {
			expect(scope.model.widgets.length).toBe(data.length + 1);
			expect(scope.model.errorMessage).toBeFalsy();
		});	
	});

	it("doesn't add a new widget to list if operation was canceled", function() {
		var data = setupGetWidgetsSuccess();
		var scope = createController(<WidgetRegistry.WidgetManagerScope>controller.rootScope.$new());

		var deferred = controller.promises.defer();		
		spyOn(controller.modal, "open").and.returnValue({ result: deferred.promise });

		scope.addWidget();
		deferred.reject();

		deferred.promise.finally(() => {
			expect(scope.model.widgets.length).toBe(data.length);
			expect(scope.model.errorMessage).toBeFalsy(); 
		});	
	});

	it("changes a widget on the list if operation completes successfully", function() {
		var data = setupGetWidgetsSuccess();
		var scope = createController(<WidgetRegistry.WidgetManagerScope>controller.rootScope.$new());

		var deferred = controller.promises.defer();		
		spyOn(controller.modal, "open").and.callFake((settings: angular.ui.bootstrap.IModalSettings) => {
			var widget = <WidgetRegistry.Widget>(<any>settings.resolve).model().widget;
			widget.name = "changed";
            
			return { result: deferred.promise };
		});

		var selectedWidget = scope.model.widgets[1];        
		scope.editWidget(selectedWidget);
		deferred.resolve();

		deferred.promise.finally(() => {
			expect(scope.model.widgets.length).toBe(data.length);
			expect(selectedWidget.name).toBe("changed");
			expect(scope.model.errorMessage).toBeFalsy();
		});	
	});

	it("doesn't change a widget on the list if operation was canceled", function() {
		var data = setupGetWidgetsSuccess();
		var scope = createController(<WidgetRegistry.WidgetManagerScope>controller.rootScope.$new());

		var deferred = controller.promises.defer();		
		spyOn(controller.modal, "open").and.callFake((settings: angular.ui.bootstrap.IModalSettings) => {
			var widget = <WidgetRegistry.Widget>(<any>settings.resolve).model().widget;
			widget.name = "changed";
            
			return { result: deferred.promise };
		});

		var selectedWidget = scope.model.widgets[1];
		var originalName = selectedWidget.name;

		scope.editWidget(selectedWidget);
		deferred.reject();

		deferred.promise.finally(() => {
			expect(scope.model.widgets.length).toBe(data.length);
			expect(selectedWidget.name).not.toBe("changed");
			expect(selectedWidget.name).toBe(originalName);
			expect(scope.model.errorMessage).toBeFalsy();
		});	
	});

	it("undeletes widget on the list if operation completes successfully", function() {
		var data = setupGetWidgetsSuccess();
		var scope = createController(<WidgetRegistry.WidgetManagerScope>controller.rootScope.$new());

		scope.model.errorMessage = "previous error message, should be cleared when operation starts";
        
		service.httpMock.expectPATCH(getEndpointWithQueryStringRegexp(app.config)).respond(200, "");

		var selectedWidget = scope.model.widgets[1];
		selectedWidget.$state = WidgetRegistry.WidgetState.deleted;

		scope.undeleteWidget(selectedWidget);

		//	Operation started, awaiting resolution.        
		expect(selectedWidget.$state).toBe(WidgetRegistry.WidgetState.undeleting);
		expect(scope.model.operationInProgress).toBe(true);
		expect(scope.model.errorMessage).toBeFalsy();

		//	Operation resolution.        
		service.httpMock.flush();
		expect(selectedWidget.$state).toBe(WidgetRegistry.WidgetState.existing);
		expect(scope.model.errorMessage).toBeFalsy();
	});

	it("keeps widget deleted if operation completes fails", function() {
		var data = setupGetWidgetsSuccess();
		var scope = createController(<WidgetRegistry.WidgetManagerScope>controller.rootScope.$new());

		service.httpMock.expectPATCH(getEndpointWithQueryStringRegexp(app.config)).respond(500, "");

		var selectedWidget = scope.model.widgets[1];
		selectedWidget.$state = WidgetRegistry.WidgetState.deleted;

		scope.undeleteWidget(selectedWidget);

		//	Operation started, awaiting resolution.        
		expect(selectedWidget.$state).toBe(WidgetRegistry.WidgetState.undeleting);
		expect(scope.model.operationInProgress).toBe(true);
		expect(scope.model.errorMessage).toBeFalsy();

		//	Operation resolution.        
		service.httpMock.flush();
		expect(selectedWidget.$state).toBe(WidgetRegistry.WidgetState.deleted);
		expect(scope.model.errorMessage).toBeTruthy();
	});

	it("removes newly added widget from the list if operation completes successfully", function() {
		var data = setupGetWidgetsSuccess();
		var scope = createController(<WidgetRegistry.WidgetManagerScope>controller.rootScope.$new());

		scope.model.errorMessage = "previous error message, should be cleared when operation starts";

		service.httpMock.expectDELETE(getEndpointWithQueryStringRegexp(app.config)).respond(200, "");

		var selectedWidget = scope.model.widgets[1];
		selectedWidget.$state = WidgetRegistry.WidgetState.new;

		scope.deleteWidget(selectedWidget);

		//	Operation started, awaiting resolution.        
		expect(selectedWidget.$state).toBe(WidgetRegistry.WidgetState.deleting);
		expect(scope.model.operationInProgress).toBe(true);
		expect(scope.model.errorMessage).toBeFalsy();

		//	Operation resolution.        
		service.httpMock.flush();
		expect(scope.model.widgets).not.toContain(selectedWidget);
		expect(scope.model.errorMessage).toBeFalsy();
	});

	it("marks existing widget as deleted if operation completes successfully", function() {
		var data = setupGetWidgetsSuccess();
		var scope = createController(<WidgetRegistry.WidgetManagerScope>controller.rootScope.$new());

		scope.model.errorMessage = "previous error message, should be cleared when operation starts";

		service.httpMock.expectDELETE(getEndpointWithQueryStringRegexp(app.config)).respond(200, "");

		var selectedWidget = scope.model.widgets[1];
		delete selectedWidget.$state;

		scope.deleteWidget(selectedWidget);

		//	Operation started, awaiting resolution.        
		expect(selectedWidget.$state).toBe(WidgetRegistry.WidgetState.deleting);
		expect(scope.model.operationInProgress).toBe(true);
		expect(scope.model.errorMessage).toBeFalsy();

		//	Operation resolution.        
		service.httpMock.flush();
		expect(selectedWidget.$state).toBe(WidgetRegistry.WidgetState.deleted);
		expect(scope.model.widgets).toContain(selectedWidget);
		expect(scope.model.errorMessage).toBeFalsy();
	});

	it("keeps widget as newly added on the list if operation fails", function() {
		var data = setupGetWidgetsSuccess();
		var scope = createController(<WidgetRegistry.WidgetManagerScope>controller.rootScope.$new());

		service.httpMock.expectDELETE(getEndpointWithQueryStringRegexp(app.config)).respond(500, "");

		var selectedWidget = scope.model.widgets[1];
		selectedWidget.$state = WidgetRegistry.WidgetState.new;

		scope.deleteWidget(selectedWidget);

		//	Operation started, awaiting resolution.        
		expect(selectedWidget.$state).toBe(WidgetRegistry.WidgetState.deleting);
		expect(scope.model.operationInProgress).toBe(true);
		expect(scope.model.errorMessage).toBeFalsy();

		//	Operation resolution.        
		service.httpMock.flush();
		expect(selectedWidget.$state).toBe(WidgetRegistry.WidgetState.new);
		expect(scope.model.widgets).toContain(selectedWidget);
		expect(scope.model.errorMessage).toBeTruthy();
	});

	it("keeps widget as existing on the list if operation fails", function() {
		var data = setupGetWidgetsSuccess();
		var scope = createController(<WidgetRegistry.WidgetManagerScope>controller.rootScope.$new());

		service.httpMock.expectDELETE(getEndpointWithQueryStringRegexp(app.config)).respond(500, "");

		var selectedWidget = scope.model.widgets[1];
		selectedWidget.$state = WidgetRegistry.WidgetState.existing;

		scope.deleteWidget(selectedWidget);

		//	Operation started, awaiting resolution.        
		expect(selectedWidget.$state).toBe(WidgetRegistry.WidgetState.deleting);
		expect(scope.model.operationInProgress).toBe(true);
		expect(scope.model.errorMessage).toBeFalsy();

		//	Operation resolution.        
		service.httpMock.flush();
		expect(selectedWidget.$state).toBe(WidgetRegistry.WidgetState.existing);
		expect(scope.model.widgets).toContain(selectedWidget);
		expect(scope.model.errorMessage).toBeTruthy();
	});

	it("keeps widget originally w/o state as existing on the list if operation fails", function() {
		var data = setupGetWidgetsSuccess();
		var scope = createController(<WidgetRegistry.WidgetManagerScope>controller.rootScope.$new());

		service.httpMock.expectDELETE(getEndpointWithQueryStringRegexp(app.config)).respond(500, "");

		var selectedWidget = scope.model.widgets[1];
		delete selectedWidget.$state;

		scope.deleteWidget(selectedWidget);

		//	Operation started, awaiting resolution.        
		expect(selectedWidget.$state).toBe(WidgetRegistry.WidgetState.deleting);
		expect(scope.model.operationInProgress).toBe(true);
		expect(scope.model.errorMessage).toBeFalsy();

		//	Operation resolution.        
		service.httpMock.flush();
		expect(selectedWidget.$state).toBe(WidgetRegistry.WidgetState.existing);
		expect(scope.model.widgets).toContain(selectedWidget);
		expect(scope.model.errorMessage).toBeTruthy();
	});

	/** 
	 * Creates controller and ensures initial get widgets operation completes according to expectations set from the outside.
	 * @param scope Scope instance to use for controller configuration.
	 * @returns Configured scope instance.
	 */	
	function createController(scope: WidgetRegistry.WidgetManagerScope): WidgetRegistry.WidgetManagerScope {
		controller.factory(controllerName, {
			appConfig: app.config,
			$scope: scope,
			widgetService: service.instance,
			$modal: controller.modal
		});
		service.httpMock.flush();

		return scope;		
	}

	/** Sets up successful getWidgets() operation with fake data. */
	function setupGetWidgetsSuccess(): WidgetRegistry.WidgetList {
		var data = [
			createFakeWidgetInstance(),
			createFakeWidgetInstance(),
			createFakeWidgetInstance()
		];

		service.httpMock.expectGET(app.config.apiEndpoint + "all").respond(200, data);
		
		return data;		
	}
	
});

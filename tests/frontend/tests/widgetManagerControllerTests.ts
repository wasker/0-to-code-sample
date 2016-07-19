/// <reference path="../setup.ts" />

describe("widgetManagerController", function() {

	let controllerName = "widgetManager";

	let app = <WidgetRegistryAppMock>{};	
	let controller = <WidgetRegistryControllerMock>{};
	let service = <WidgetServiceMock>{};

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
		let expectedData = setupGetWidgetsSuccess();
		let component = createWidgetManagerController();

		expect(component.model).toBeDefined();
		expect(component.model.errorMessage).toBeFalsy();
		expect(component.addWidget).toBeDefined();
		expect(component.editWidget).toBeDefined();
		expect(component.deleteWidget).toBeDefined();
		expect(component.undeleteWidget).toBeDefined();

		expect(component.model.operationInProgress).toBe(true);
		service.httpMock.flush();

		expect(component.model.widgets).toEqual(expectedData);
		expect(component.model.operationInProgress).toBe(false);
	});

	it("shows error if get all widgets operation fails", function() {
		service.httpMock.expectGET(app.config.apiEndpoint + "all").respond(500);
		let component = createWidgetManagerController();

		expect(component.model).toBeDefined();
		expect(component.model.errorMessage).toBeFalsy();

		expect(component.model.operationInProgress).toBe(true);
		service.httpMock.flush();

		expect(component.model.widgets).toEqual([]);
		expect(component.model.operationInProgress).toBe(false);
		expect(component.model.errorMessage).toBeTruthy();
	});

	// it("adds a new widget to list if operation completes successfully", function() {
	// 	let data = setupGetWidgetsSuccess();
	// 	let scope = createWidgetManagerController(<WidgetRegistry.WidgetManagerScope>controller.rootcomponent.$new());

	// 	let deferred = controller.promises.defer();		
	// 	spyOn(controller.modal, "open").and.returnValue({ result: deferred.promise });

	// 	component.addWidget();
	// 	deferred.resolve();

	// 	deferred.promise.finally(() => {
	// 		expect(component.model.widgets.length).toBe(data.length + 1);
	// 		expect(component.model.errorMessage).toBeFalsy();
	// 	});	
	// });

	// it("doesn't add a new widget to list if operation was canceled", function() {
	// 	let data = setupGetWidgetsSuccess();
	// 	let scope = createWidgetManagerController(<WidgetRegistry.WidgetManagerScope>controller.rootcomponent.$new());

	// 	let deferred = controller.promises.defer();		
	// 	spyOn(controller.modal, "open").and.returnValue({ result: deferred.promise });

	// 	component.addWidget();
	// 	deferred.reject();

	// 	deferred.promise.finally(() => {
	// 		expect(component.model.widgets.length).toBe(data.length);
	// 		expect(component.model.errorMessage).toBeFalsy(); 
	// 	});	
	// });

	// it("changes a widget on the list if operation completes successfully", function() {
	// 	let data = setupGetWidgetsSuccess();
	// 	let scope = createWidgetManagerController(<WidgetRegistry.WidgetManagerScope>controller.rootcomponent.$new());

	// 	let deferred = controller.promises.defer();		
	// 	spyOn(controller.modal, "open").and.callFake((settings: angular.ui.bootstrap.IModalSettings) => {
	// 		let widget = <WidgetRegistry.Widget>(<any>settings.resolve).model().widget;
	// 		widget.name = "changed";
            
	// 		return { result: deferred.promise };
	// 	});

	// 	let selectedWidget = component.model.widgets[1];        
	// 	component.editWidget(selectedWidget);
	// 	deferred.resolve();

	// 	deferred.promise.finally(() => {
	// 		expect(component.model.widgets.length).toBe(data.length);
	// 		expect(selectedWidget.name).toBe("changed");
	// 		expect(component.model.errorMessage).toBeFalsy();
	// 	});	
	// });

	// it("doesn't change a widget on the list if operation was canceled", function() {
	// 	let data = setupGetWidgetsSuccess();
	// 	let scope = createWidgetManagerController(<WidgetRegistry.WidgetManagerScope>controller.rootcomponent.$new());

	// 	let deferred = controller.promises.defer();		
	// 	spyOn(controller.modal, "open").and.callFake((settings: angular.ui.bootstrap.IModalSettings) => {
	// 		let widget = <WidgetRegistry.Widget>(<any>settings.resolve).model().widget;
	// 		widget.name = "changed";
            
	// 		return { result: deferred.promise };
	// 	});

	// 	let selectedWidget = component.model.widgets[1];
	// 	let originalName = selectedWidget.name;

	// 	component.editWidget(selectedWidget);
	// 	deferred.reject();

	// 	deferred.promise.finally(() => {
	// 		expect(component.model.widgets.length).toBe(data.length);
	// 		expect(selectedWidget.name).not.toBe("changed");
	// 		expect(selectedWidget.name).toBe(originalName);
	// 		expect(component.model.errorMessage).toBeFalsy();
	// 	});	
	// });

	it("undeletes widget on the list if operation completes successfully", function() {
		let data = setupGetWidgetsSuccess();
		let component = createWidgetManagerController();
		service.httpMock.flush();	//	Make sure GET all goes through.

		component.model.errorMessage = "previous error message, should be cleared when operation starts";

		let selectedWidget = component.model.widgets[1];
		selectedWidget.$state = WidgetRegistry.WidgetState.deleted;

		service.httpMock.expectPATCH(getEndpointWithQueryStringRegexp(app.config)).respond(200, "");
		component.undeleteWidget(selectedWidget);

		//	Operation started, awaiting resolution.        
		expect(selectedWidget.$state).toBe(WidgetRegistry.WidgetState.undeleting);
		expect(component.model.operationInProgress).toBe(true);
		expect(component.model.errorMessage).toBeFalsy();

		//	Operation resolution.        
		service.httpMock.flush();
		expect(selectedWidget.$state).toBe(WidgetRegistry.WidgetState.existing);
		expect(component.model.errorMessage).toBeFalsy();
	});

	it("keeps widget deleted if operation completes fails", function() {
		let data = setupGetWidgetsSuccess();
		let component = createWidgetManagerController();
		service.httpMock.flush();	//	Make sure GET all goes through.

		let selectedWidget = component.model.widgets[1];
		selectedWidget.$state = WidgetRegistry.WidgetState.deleted;

		service.httpMock.expectPATCH(getEndpointWithQueryStringRegexp(app.config)).respond(500, "");
		component.undeleteWidget(selectedWidget);

		//	Operation started, awaiting resolution.        
		expect(selectedWidget.$state).toBe(WidgetRegistry.WidgetState.undeleting);
		expect(component.model.operationInProgress).toBe(true);
		expect(component.model.errorMessage).toBeFalsy();

		//	Operation resolution.        
		service.httpMock.flush();
		expect(selectedWidget.$state).toBe(WidgetRegistry.WidgetState.deleted);
		expect(component.model.errorMessage).toBeTruthy();
	});

	it("removes newly added widget from the list if operation completes successfully", function() {
		let data = setupGetWidgetsSuccess();
		let component = createWidgetManagerController();
		service.httpMock.flush();	//	Make sure GET all goes through.

		component.model.errorMessage = "previous error message, should be cleared when operation starts";

		let selectedWidget = component.model.widgets[1];
		selectedWidget.$state = WidgetRegistry.WidgetState.new;

		service.httpMock.expectDELETE(getEndpointWithQueryStringRegexp(app.config)).respond(200, "");
		component.deleteWidget(selectedWidget);

		//	Operation started, awaiting resolution.        
		expect(selectedWidget.$state).toBe(WidgetRegistry.WidgetState.deleting);
		expect(component.model.operationInProgress).toBe(true);
		expect(component.model.errorMessage).toBeFalsy();

		//	Operation resolution.        
		service.httpMock.flush();
		expect(component.model.widgets).not.toContain(selectedWidget);
		expect(component.model.errorMessage).toBeFalsy();
	});

	it("marks existing widget as deleted if operation completes successfully", function() {
		let data = setupGetWidgetsSuccess();
		let component = createWidgetManagerController();
		service.httpMock.flush();	//	Make sure GET all goes through.

		component.model.errorMessage = "previous error message, should be cleared when operation starts";

		let selectedWidget = component.model.widgets[1];
		delete selectedWidget.$state;

		service.httpMock.expectDELETE(getEndpointWithQueryStringRegexp(app.config)).respond(200, "");
		component.deleteWidget(selectedWidget);

		//	Operation started, awaiting resolution.        
		expect(selectedWidget.$state).toBe(WidgetRegistry.WidgetState.deleting);
		expect(component.model.operationInProgress).toBe(true);
		expect(component.model.errorMessage).toBeFalsy();

		//	Operation resolution.        
		service.httpMock.flush();
		expect(selectedWidget.$state).toBe(WidgetRegistry.WidgetState.deleted);
		expect(component.model.widgets).toContain(selectedWidget);
		expect(component.model.errorMessage).toBeFalsy();
	});

	it("keeps widget as newly added on the list if operation fails", function() {
		let data = setupGetWidgetsSuccess();
		let component = createWidgetManagerController();
		service.httpMock.flush();	//	Make sure GET all goes through.

		let selectedWidget = component.model.widgets[1];
		selectedWidget.$state = WidgetRegistry.WidgetState.new;

		service.httpMock.expectDELETE(getEndpointWithQueryStringRegexp(app.config)).respond(500, "");
		component.deleteWidget(selectedWidget);

		//	Operation started, awaiting resolution.        
		expect(selectedWidget.$state).toBe(WidgetRegistry.WidgetState.deleting);
		expect(component.model.operationInProgress).toBe(true);
		expect(component.model.errorMessage).toBeFalsy();

		//	Operation resolution.        
		service.httpMock.flush();
		expect(selectedWidget.$state).toBe(WidgetRegistry.WidgetState.new);
		expect(component.model.widgets).toContain(selectedWidget);
		expect(component.model.errorMessage).toBeTruthy();
	});

	it("keeps widget as existing on the list if operation fails", function() {
		let data = setupGetWidgetsSuccess();
		let component = createWidgetManagerController();
		service.httpMock.flush();	//	Make sure GET all goes through.

		let selectedWidget = component.model.widgets[1];
		selectedWidget.$state = WidgetRegistry.WidgetState.existing;

		service.httpMock.expectDELETE(getEndpointWithQueryStringRegexp(app.config)).respond(500, "");
		component.deleteWidget(selectedWidget);

		//	Operation started, awaiting resolution.        
		expect(selectedWidget.$state).toBe(WidgetRegistry.WidgetState.deleting);
		expect(component.model.operationInProgress).toBe(true);
		expect(component.model.errorMessage).toBeFalsy();

		//	Operation resolution.        
		service.httpMock.flush();
		expect(selectedWidget.$state).toBe(WidgetRegistry.WidgetState.existing);
		expect(component.model.widgets).toContain(selectedWidget);
		expect(component.model.errorMessage).toBeTruthy();
	});

	it("keeps widget originally w/o state as existing on the list if operation fails", function() {
		let data = setupGetWidgetsSuccess();
		let component = createWidgetManagerController();
		service.httpMock.flush();	//	Make sure GET all goes through.

		let selectedWidget = component.model.widgets[1];
		delete selectedWidget.$state;

		service.httpMock.expectDELETE(getEndpointWithQueryStringRegexp(app.config)).respond(500, "");
		component.deleteWidget(selectedWidget);

		//	Operation started, awaiting resolution.        
		expect(selectedWidget.$state).toBe(WidgetRegistry.WidgetState.deleting);
		expect(component.model.operationInProgress).toBe(true);
		expect(component.model.errorMessage).toBeFalsy();

		//	Operation resolution.        
		service.httpMock.flush();
		expect(selectedWidget.$state).toBe(WidgetRegistry.WidgetState.existing);
		expect(component.model.widgets).toContain(selectedWidget);
		expect(component.model.errorMessage).toBeTruthy();
	});

	/** 
	 * Creates and initializes an instance of the WidgetManagerController component.
	 */
	function createWidgetManagerController(): WidgetRegistry.IWidgetManagerController {
		let dependencies = {
			widgetService: service.instance,
			appConfig: app.config,
			$q: controller.promises
		};	

		let component = <WidgetRegistry.IWidgetManagerController>controller.factory(controllerName, { $scope: controller.rootScope.$new(), locals: dependencies });
		component.$onInit();

		controller.rootScope.$digest();

		return component;
	}

	/** Sets up successful getWidgets() operation with fake data. */
	function setupGetWidgetsSuccess(): WidgetRegistry.WidgetList {
		let data = [
			createFakeWidgetInstance(),
			createFakeWidgetInstance(),
			createFakeWidgetInstance()
		];

		service.httpMock.expectGET(app.config.apiEndpoint + "all").respond(200, data);
		
		return data;		
	}
	
});

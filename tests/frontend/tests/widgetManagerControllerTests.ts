/// <reference path="../setup.ts" />

//	http://www.blog.wishtack.com/#!AngularJS-vs-Angular-2-Should-I-Stay-or-Should-I-Go/cuhk/573b59710cf233ef713771b2
//	https://github.com/angular/angular/issues/5462
//	https://github.com/angular/protractor/issues/2944

import { WidgetManagerController, WidgetEditor, WidgetTable } from "../../../scripts/a2/widgetManagerController";
import { dependencyStubComponent } from "../../../scripts/a2/dependencyStubComponent";	//	TODO: Should be located with tests (systemjs issue).

import { provide } from "@angular/core";
import { async, TestComponentBuilder, ComponentFixture, inject, addProviders } from "@angular/core/testing";

describe("widgetManagerController", function() {

	let app = <WidgetRegistryAppMock>{};	
	let controller = <WidgetRegistryControllerMock>{};
	let service = <WidgetServiceMock>{};
	let testComponentBuilder: TestComponentBuilder = null;

	beforeEach(async(inject([TestComponentBuilder], (tcb: TestComponentBuilder) => {
		app = startApplication();
		controller = mockWidgetRegistryController();
		service = mockWidgetService();

		testComponentBuilder = tcb;		
	})));

	afterEach(function() {
		service.httpMock.verifyNoOutstandingExpectation();
		service.httpMock.verifyNoOutstandingRequest();
	});

	it("initializes scope", function(done) {
		let expectedData = setupGetWidgetsSuccess();

		createWidgetManagerController()
			.then(component => {
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
			})
			.then(done, done);
	});

	it("shows error if get all widgets operation fails", function(done) {
		service.httpMock.expectGET(app.config.apiEndpoint + "all").respond(500);

		createWidgetManagerController()
			.then(component => {
				expect(component.model).toBeDefined();
				expect(component.model.errorMessage).toBeFalsy();

				expect(component.model.operationInProgress).toBe(true);
				service.httpMock.flush();

				expect(component.model.widgets).toEqual([]);
				expect(component.model.operationInProgress).toBe(false);
				expect(component.model.errorMessage).toBeTruthy();
			})		
			.then(done, done);
	});

	it("adds a new widget to list if operation completes successfully", function (done) {
		let deferred = controller.promises.defer();		
		controller.modal = new FakeModalHostFactory(deferred);
		
		let data = setupGetWidgetsSuccess();

		createWidgetManagerController()
			.then(component => {
				service.httpMock.flush();	//	Make sure GET all goes through.

				component.addWidget();
				deferred.resolve();

				controller.rootScope.$digest();
				expect(component.model.widgets.length).toBe(data.length + 1);
				expect(component.model.errorMessage).toBeFalsy();
			})		
			.then(done, done);
	});

	it("doesn't add a new widget to list if operation was canceled", function(done) {
		let deferred = controller.promises.defer();		
		controller.modal = new FakeModalHostFactory(deferred);
		
		let data = setupGetWidgetsSuccess();

		createWidgetManagerController()
			.then(component => {
				service.httpMock.flush();	//	Make sure GET all goes through.

				component.addWidget();
				deferred.reject();

				controller.rootScope.$digest();
				expect(component.model.widgets.length).toBe(data.length);
				expect(component.model.errorMessage).toBeFalsy();
			})		
			.then(done, done);
	});

	it("changes a widget on the list if operation completes successfully", function(done) {
		let deferred = controller.promises.defer();		
		controller.modal = new FakeModalHostFactory(deferred);
		
		let data = setupGetWidgetsSuccess();

		createWidgetManagerController()
			.then(component => {
				service.httpMock.flush();	//	Make sure GET all goes through.

				let selectedWidget = component.model.widgets[1];
				component.editWidget(selectedWidget);
				deferred.resolve();

				controller.rootScope.$digest();
				expect(component.model.widgets.length).toBe(data.length);
				expect(component.model.errorMessage).toBeFalsy();
			})		
			.then(done, done);
	});

	it("doesn't change a widget on the list if operation was canceled", function(done) {
		let deferred = controller.promises.defer();		
		controller.modal = new FakeModalHostFactory(deferred);
		
		let data = setupGetWidgetsSuccess();

		createWidgetManagerController()
			.then(component => {
				service.httpMock.flush();	//	Make sure GET all goes through.

				let selectedWidget = component.model.widgets[1];
				component.editWidget(selectedWidget);
				deferred.reject();

				controller.rootScope.$digest();
				expect(component.model.widgets.length).toBe(data.length);
				expect(component.model.errorMessage).toBeFalsy();
			})		
			.then(done, done);
	});

	it("undeletes widget on the list if operation completes successfully", function(done) {
		let data = setupGetWidgetsSuccess();

		createWidgetManagerController()
			.then(component => {
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
			})		
			.then(done, done);
	});

	it("keeps widget deleted if operation completes fails", function(done) {
		let data = setupGetWidgetsSuccess();

		createWidgetManagerController()
			.then(component => {
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
			})		
			.then(done, done);
	});

	it("removes newly added widget from the list if operation completes successfully", function(done) {
		let data = setupGetWidgetsSuccess();

		createWidgetManagerController()
			.then(component => {
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
			})		
			.then(done, done);
	});

	it("marks existing widget as deleted if operation completes successfully", function(done) {
		let data = setupGetWidgetsSuccess();

		createWidgetManagerController()
			.then(component => {
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
			})		
			.then(done, done);
	});

	it("keeps widget as newly added on the list if operation fails", function(done) {
		let data = setupGetWidgetsSuccess();

		createWidgetManagerController()
			.then(component => {
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
			})		
			.then(done, done);
	});

	it("keeps widget as existing on the list if operation fails", function(done) {
		let data = setupGetWidgetsSuccess();

		createWidgetManagerController()
			.then(component => {
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
			})		
			.then(done, done);
	});

	it("keeps widget originally w/o state as existing on the list if operation fails", function(done) {
		let data = setupGetWidgetsSuccess();

		createWidgetManagerController()
			.then(component => {
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
			})		
			.then(done, done);
	});

	/** 
	 * Creates and initializes an instance of the WidgetManagerController component.
	 */
	function createWidgetManagerController(): Promise<WidgetRegistry.IWidgetManagerController> {
		//	http://stackoverflow.com/questions/37614618/angular-2-0-0-rc-1-how-to-test-elements-on-the-view-or-content-e-g-viewchild?rq=1

		//	When testing mixed mode, the app is in a weird state, when injector used by the upgradeNg1Component() is not the same 
		//	as the one used by Angular Mocks. This makes $httpBackend.whenGET() setup not working.
		//	Workaround is to stub directives, that depend on external templates, with a test component that doesn't do anything.		

		return testComponentBuilder.overrideProviders(WidgetManagerController, [
			provide("widgetService", { useValue: service.instance }),
			provide("appConfig", { useValue: app.config }),
			provide("modalHostFactory", { useValue: controller.modal }),
			provide("$scope", { useValue: controller.rootScope.$new() }),
			provide("$q", { useValue: controller.promises })
		])
			.overrideDirective(WidgetManagerController, WidgetTable, dependencyStubComponent)
			.overrideDirective(WidgetManagerController, WidgetEditor, dependencyStubComponent)
			.createAsync(WidgetManagerController).then((fixture: ComponentFixture<WidgetManagerController>) => {
	
			fixture.detectChanges();
			return fixture.componentInstance;
		});
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

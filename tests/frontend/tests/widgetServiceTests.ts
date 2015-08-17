/// <reference path="../setup.ts" />

describe("widgetService tests", function() {

	var app = <WidgetRegistryAppMock>{};	
	var widgetService = <WidgetServiceMock>{};

	beforeEach(function() {
		app = startApplication();
		widgetService = mockWidgetService();
	});

	afterEach(function() {
		widgetService.httpMock.verifyNoOutstandingExpectation();
		widgetService.httpMock.verifyNoOutstandingRequest();
	});

	it("successfully gets list of widgets", function() {
		var widgets: WidgetRegistry.WidgetList = [
			{ id: "123", name: "widget 1", amount: 5, description: "this is widget 1" },
			{ id: "456", name: "widget 2", amount: 6, description: "this is widget 2" },
			{ id: "789", name: "widget 3", amount: 7, description: "this is widget 3" },
		];
		widgetService.httpMock
			.expectGET(app.config.apiEndpoint + "all")
			.respond(200, widgets);

		widgetService.instance.getWidgets()
			.then(data => {
				expect(data).toEqual(widgets);
			});

		widgetService.httpMock.flush();
	});

	it("propagates failure if get list of widgets fails", function() {
		widgetService.httpMock
			.expectGET(app.config.apiEndpoint + "all")
			.respond(500, []);

		widgetService.instance.getWidgets()
			.catch(status => {
				expect(status).toBe(500);
			});

		widgetService.httpMock.flush();
	});

	it("successfully creates new widget", function() {
		widgetService.httpMock
			.expectPUT(app.config.apiEndpoint)
			.respond(200);

		widgetService.instance.createWidget(createFakeWidgetInstance())
			.catch(status => {
				fail("not expected");
			});

		widgetService.httpMock.flush();
	});

	it("propagates failure if new widget creation fails", function() {
		widgetService.httpMock
			.expectPUT(app.config.apiEndpoint)
			.respond(500);

		widgetService.instance.createWidget(createFakeWidgetInstance())
			.catch(status => {
				expect(status).toBe(500);
			});

		widgetService.httpMock.flush();
	});

	it("successfully updates existing widget", function() {
		widgetService.httpMock
			.expectPOST(app.config.apiEndpoint)
			.respond(200);

		widgetService.instance.updateWidget(createFakeWidgetInstance())
			.catch(status => {
				fail("not expected");
			});

		widgetService.httpMock.flush();
	});

	it("propagates failure if widget update fails", function() {
		widgetService.httpMock
			.expectPOST(app.config.apiEndpoint)
			.respond(500);

		widgetService.instance.updateWidget(createFakeWidgetInstance())
			.catch(status => {
				expect(status).toBe(500);
			});

		widgetService.httpMock.flush();
	});

	it("successfully deletes existing widget", function() {
		widgetService.httpMock
			.expectDELETE(getEndpointWithQueryStringRegexp(app.config))
			.respond(200);

		widgetService.instance.deleteWidget(createFakeWidgetInstance())
			.catch(status => {
				fail("not expected");
			});

		widgetService.httpMock.flush();
	});

	it("propagates failure if widget delete fails", function() {
		widgetService.httpMock
			.expectDELETE(getEndpointWithQueryStringRegexp(app.config))
			.respond(500);

		widgetService.instance.deleteWidget(createFakeWidgetInstance())
			.catch(status => {
				expect(status).toBe(500);
			});

		widgetService.httpMock.flush();
	});

	it("successfully undeletes deleted widget", function() {
		widgetService.httpMock
			.expectPATCH(getEndpointWithQueryStringRegexp(app.config))
			.respond(200);

		widgetService.instance.undoWidgetDelete(createFakeWidgetInstance())
			.catch(status => {
				fail("not expected");
			});

		widgetService.httpMock.flush();
	});

	it("propagates failure if widget undelete fails", function() {
		widgetService.httpMock
			.expectPATCH(getEndpointWithQueryStringRegexp(app.config))
			.respond(500);

		widgetService.instance.undoWidgetDelete(createFakeWidgetInstance())
			.catch(status => {
				expect(status).toBe(500);
			});

		widgetService.httpMock.flush();
	});
	
});

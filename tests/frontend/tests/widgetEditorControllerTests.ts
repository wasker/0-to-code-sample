describe("widgetEditorController", function() {

	let controllerName = "widgetEditor";
	
	let app = <WidgetRegistryAppMock>{};	
	let controller = <WidgetRegistryControllerMock>{};

	beforeEach(function() {
		app = startApplication();
		controller = mockWidgetRegistryController();
	});

	it("initializes scope", function() {
		let widgetCallbackDeferred = controller.promises.defer();
		let editorDeferred = createWidgetEditorControllerDeferred();
		let model = createEditorModel(null, _ => widgetCallbackDeferred.promise, editorDeferred.deferred);

		let component = createWidgetEditorController(model);

		expect(component.model).toBeDefined();
		expect(component.model.widget).toBe(model.widget);
		expect(component.model.isValid).toBe(true);
		expect(component.model.operationInProgress).toBe(false);
		expect(component.model.errorMessage).toBeFalsy();
		expect(component.ok).toBeDefined();
		expect(component.cancel).toBeDefined();
		expect(editorDeferred.status).not.toBeDefined();
	});

	it("closes if model is valid and operation successful", function() {
		let widgetCallbackDeferred = controller.promises.defer();
		let editorDeferred = createWidgetEditorControllerDeferred();

		let model = createEditorModel(null, _ => widgetCallbackDeferred.promise, editorDeferred.deferred);
		model.errorMessage = "previous error message, should be cleared when operation starts";
        
		let component = createWidgetEditorController(model);

		component.ok();
		expect(model.operationInProgress).toBe(true);
		expect(model.errorMessage).toBeFalsy();

		//	Successful outcome.		
		widgetCallbackDeferred.resolve();
		controller.rootScope.$digest();

		expect(model.operationInProgress).toBe(false);
		expect(model.errorMessage).toBeFalsy();
		expect(editorDeferred.status).toBe("resolved");
	});

	it("shows error if model is valid, but operation is unsuccessful", function() {
		let widgetCallbackDeferred = controller.promises.defer();
		let editorDeferred = createWidgetEditorControllerDeferred();
		let model = createEditorModel(null, _ => widgetCallbackDeferred.promise, editorDeferred.deferred);

		let component = createWidgetEditorController(model);
		
		component.ok();
		expect(model.operationInProgress).toBe(true);

		//	Unsuccessful outcome.		
		widgetCallbackDeferred.reject();
		controller.rootScope.$digest();

		expect(component.model.errorMessage).toBeTruthy();
		expect(model.operationInProgress).toBe(false);
		expect(editorDeferred.status).not.toBeDefined();
	});

	it("doesn't perform operation if model is invalid", function() {
		let operationIsNotExpected = (_: WidgetRegistry.Widget): ng.IPromise<any> => {
			throw new Error("Operation is not expected.");
		};
		let editorDeferred = createWidgetEditorControllerDeferred();

		let model = createEditorModel(null, operationIsNotExpected, editorDeferred.deferred);
		model.widget.name = "";								//	Invalid data.

		let component = createWidgetEditorController(model);

		component.ok();
		expect(model.operationInProgress).toBe(false);

		controller.rootScope.$digest();

		expect(model.isValid).toBe(false);
		expect(model.operationInProgress).toBe(false);
		expect(editorDeferred.status).not.toBeDefined();
	});

	it("dismisses the modal if user clicks cancel", function() {
		let operationIsNotExpected = (_: WidgetRegistry.Widget): ng.IPromise<any> => {
			throw new Error("Operation is not expected.");
		};

		let editorDeferred = createWidgetEditorControllerDeferred();

		let model = createEditorModel(null, operationIsNotExpected, editorDeferred.deferred);
		let component = createWidgetEditorController(model);

		component.cancel();
		expect(model.operationInProgress).toBe(false);

		controller.rootScope.$digest();

		expect(model.operationInProgress).toBe(false);
		expect(editorDeferred.status).toBe("rejected");
	});

	/** 
	 * Creates and initializes an instance of the WidgetEditorController component.
	 * @param model Editor model.
	 */
	function createWidgetEditorController(model: WidgetRegistry.WidgetEditorModel): WidgetRegistry.IWidgetEditorController {
		let dependencies = {
			appConfig: app.config
		};	

		let component = <WidgetRegistry.IWidgetEditorController>controller.factory(controllerName, { $scope: controller.rootScope.$new(), dependencies }, { model });
		component.$onInit();

		return component;
	}

	/** 
	 * Creates editor model.
	 * @param widget If null, a random valid widget will be created, otherwise model's widget will be set to this argument's value.
	 * @param performWidgetOperation Operation that will be performed on widget when user clicks OK.
	 * @param deferred Deferred that will be resolved/rejected by the editor on OK/Cancel.
	 */	
	function createEditorModel(widget: WidgetRegistry.Widget, performWidgetOperation: WidgetRegistry.WidgetOperationCallback, deferred: ng.IDeferred<any>): WidgetRegistry.WidgetEditorModel {
		return {
			deferred,
			widget: widget || createFakeWidgetInstance(),
			performWidgetOperation
		};
	}

	/**
	 * Creates an instance of the WidgetEditorControllerDeferred structure.
	 */
	function createWidgetEditorControllerDeferred(): WidgetEditorControllerDeferred {
		let deferred = controller.promises.defer();

		let result: WidgetEditorControllerDeferred = {
			deferred
		};

		deferred.promise
			.then(() => result.status = "resolved")
			.catch(() => result.status = "rejected");
		
		return result;
	}
	
});

/** An internal structure for testing deferred outcomes. */
interface WidgetEditorControllerDeferred {
	/** Deferred instance. */
	deferred: ng.IDeferred<any>;

	/** Promist status. */	
	status?: string;
}

/// <reference path="../setup.ts" />

describe("widgetEditorController", function() {

	var controllerName = "widgetEditorController";
	
	var app = <WidgetRegistryAppMock>{};	
	var controller = <WidgetRegistryControllerMock>{};

	beforeEach(function() {
		app = startApplication();
		controller = mockWidgetRegistryController();
	});

	it("initializes scope", function() {
		var deferred = controller.promises.defer();
		var model = createEditorModel(null, _ => deferred.promise);
		var scope = <WidgetRegistry.WidgetEditorScope>controller.rootScope.$new();

		controller.factory(controllerName, {
			model: model,
			appConfig: app.config,
			$scope: scope,
			$modalInstance: openModal(model)
		});

		expect(scope.model).toBeDefined();
		expect(scope.model.widget).toBe(model.widget);
		expect(scope.model.isValid).toBe(true);
		expect(scope.model.operationInProgress).toBe(false);
		expect(scope.model.errorMessage).toBeFalsy();
		expect(scope.ok).toBeDefined();
		expect(scope.cancel).toBeDefined();
	});

	it("closes if model is valid and operation successful", function() {
		var deferred = controller.promises.defer();
		var model = createEditorModel(null, _ => deferred.promise);
		var scope = <WidgetRegistry.WidgetEditorScope>controller.rootScope.$new();

		model.errorMessage = "previous error message, should be cleared when operation starts";
        
		var modal = openModal(model);
		spyOn(modal, "close").and.stub();

		controller.factory(controllerName, {
			model: model,
			appConfig: app.config,
			$scope: scope,
			$modalInstance: modal
		});

		scope.ok();
		expect(model.operationInProgress).toBe(true);
		expect(model.errorMessage).toBeFalsy();

		//	Successful outcome.		
		deferred.resolve();
		scope.$digest();

		expect(model.operationInProgress).toBe(false);
		expect(model.errorMessage).toBeFalsy();
		expect(modal.close).toHaveBeenCalled();
	});

	it("shows error if model is valid, but operation is unsuccessful", function() {
		var deferred = controller.promises.defer();
		var model = createEditorModel(null, _ => deferred.promise);
		var scope = <WidgetRegistry.WidgetEditorScope>controller.rootScope.$new();

		var modal = openModal(model);
		spyOn(modal, "close").and.stub();

		controller.factory(controllerName, {
			model: model,
			appConfig: app.config,
			$scope: scope,
			$modalInstance: modal
		});

		scope.ok();
		expect(model.operationInProgress).toBe(true);

		//	Unsuccessful outcome.		
		deferred.reject();
		scope.$digest();

		expect(modal.close).not.toHaveBeenCalled();
		expect(scope.model.errorMessage).toBeTruthy();
		expect(model.operationInProgress).toBe(false);
	});

	it("doesn't perform operation if model is invalid", function() {
		var operationIsNotExpected = (_: WidgetRegistry.Widget): ng.IPromise<any> => {
			throw new Error("Operation is not expected.");
		};

		var model = createEditorModel(null, operationIsNotExpected);
		model.widget.name = "";								//	Invalid data.

		var scope = <WidgetRegistry.WidgetEditorScope>controller.rootScope.$new();

		controller.factory(controllerName, {
			model: model,
			appConfig: app.config,
			$scope: scope,
			$modalInstance: openModal(model)
		});

		scope.ok();
		expect(model.operationInProgress).toBe(false);

		scope.$digest();

		expect(model.isValid).toBe(false);
		expect(model.operationInProgress).toBe(false);
	});

	it("dismisses the modal if user clicks cancel", function() {
		var operationIsNotExpected = (_: WidgetRegistry.Widget): ng.IPromise<any> => {
			throw new Error("Operation is not expected.");
		};

		var model = createEditorModel(null, operationIsNotExpected);
		var scope = <WidgetRegistry.WidgetEditorScope>controller.rootScope.$new();

		var modal = openModal(model);
		spyOn(modal, "dismiss").and.stub();

		controller.factory(controllerName, {
			model: model,
			appConfig: app.config,
			$scope: scope,
			$modalInstance: modal
		});

		scope.cancel();
		expect(model.operationInProgress).toBe(false);

		scope.$digest();

		expect(modal.dismiss).toHaveBeenCalled();
		expect(model.operationInProgress).toBe(false);
	});

	/** 
	 * Creates editor model.
	 * @param widget If null, a random valid widget will be created, otherwise model's widget will be set to this argument's value.
	 * @param callback Operation that will be performed on widget when user clicks OK. 
	 */	
	function createEditorModel(widget: WidgetRegistry.Widget, callback: WidgetRegistry.WidgetOperationCallback): WidgetRegistry.WidgetEditorModel {
		return {
			widget: widget || createFakeWidgetInstance(),
			performWidgetOperation: callback
		};
	}

	/**
	 * Opens modal dialog.
	 * @param model A model that will be used for dialog.
	 */	
	function openModal(model: WidgetRegistry.WidgetEditorModel): ng.ui.bootstrap.IModalServiceInstance {
		return controller.modal.open({
			resolve: {
				model: model
			},
			templateUrl: app.config.templateRoot + "widgetEditor.html",
			controller: controllerName
		});
	}
	
});

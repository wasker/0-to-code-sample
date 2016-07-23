/// <reference path="../typings/tsd.d.ts" />
/// <reference path="widgetState.ts" />

declare namespace WidgetRegistry {
	/** Application module name. */
	var appModuleName: string;

	/** Application configuration. */	
	interface AppConfig {
		/** API endpoint. */
		apiEndpoint: string;

		/** Directory that contains templates. */		
		templateRoot: string;
	}

	/** Widget data. */	
	interface Widget {
		/** Widget ID. */
		id: string;
	
		/** Widget name. */		
		name: string;
	
		/** Some amount. */		
		amount: number;
	
		/** Widget description. */		
		description?: string;
	
		/** Private state of widget. */		
		$state?: WidgetState;
	}
	
	type WidgetList = Array<Widget>;

	/** Backend service operations. */	
	interface IWidgetService {
		/** Gets list of widgets. */
		getWidgets(): ng.IPromise<WidgetList>;
	
		/**
		* Creates new widget.
		* @param widget Widget to be created.
		*/		
		createWidget(widget: Widget): ng.IPromise<any>;
	
		/**
		* Updates an existing widget.
		* @param widget Widget to be updated.
		*/		
		updateWidget(widget: Widget): ng.IPromise<any>;
	
		/**
		* Deletes an existing widget.
		* @param widget Widget to be deleted.
		*/		
		deleteWidget(widget: Widget): ng.IPromise<any>;
	
		/**
		* Restores a widget that was deleted earlier.
		* @param widget Widget to be restored.
		*/		
		undoWidgetDelete(widget: Widget): ng.IPromise<any>;
	}

	type EventCallback = (e?: ng.IAngularEvent) => void;

	interface WidgetManagerModel {
		/** List of widgets. */
		widgets: WidgetList;

		/** Indicates whether the operation is in progress. */		
		operationInProgress: boolean;

		/** If operation results in an error, contains a message. */
		errorMessage?: string;			
	}

	/** Scope of the widget table component in the widget manager. */	
	interface WidgetTableScope {
		/** Model. */
		model: WidgetList,

		/** Additional table classes. */		
		tableClass?: string,
	
		/** Indicates whether the widget could be edited or deleted. */		
		canEditOrDelete(widget: Widget): boolean;
	
		/** Indicates whether the widget is being deleted. */		
		isDeleting(widget: Widget): boolean;
	
		/** Indicates whether the widget was deleted. */		
		isDeleted(widget: Widget): boolean;
	
		/** Indicates whether the widget is being restored after it was deleted earlier. */		
		isUndoingDelete(widget: Widget): boolean;
	}

	type WidgetOperationCallback = (widget: Widget) => ng.IPromise<any>;
	
	/** Widget editor model. */	
	interface WidgetEditorModel {
		/** Widget that is being edited. */
		widget: Widget;
	
		/** Callback to perform widget operation when user commits changes in the editor. */		
		performWidgetOperation: WidgetOperationCallback;

		/** Deferred to be used by the editor to resolve/reject on OK/Cancel. */		
		deferred: ng.IDeferred<any>;
		
		/** Indicates whether the data is valid. */		
		isValid?: boolean;
	
		/** Indicates whether the operation is in progress. */		
		operationInProgress?: boolean;
	
		/** If operation results in an error, contains a message. */
		errorMessage?: string;			
	}

	/** Widget editor controller operations. */	
	interface IWidgetEditorController extends ng.IComponentController {
		/** Widget editor model. */
		model: WidgetEditorModel;

		/** Occurs when user clicks OK button. */
		ok(): void;

		/** Occurs when user clicks Cancel button. */
		cancel(): void;

		/** Indicates whether the model is valid. */		
		isValid(): boolean;
	}

	/** Widget manager controller operations. */	
	interface IWidgetManagerController extends ng.IComponentController {
		/** Widget manager model. */
		model: WidgetManagerModel;

		/** Model for widget editor. */
		editWidgetModel: WidgetEditorModel;

		/** Initiates operation of adding a new widget. */
		addWidget(): void;

		/**
		 * Edits widget.
		 * @param widget Widget to be edited.
		 */		
		editWidget(widget: Widget): void;

		/**
		 * Deletes widget.
		 * @param widget Widget to be deleted.
		 */		
		deleteWidget(widget: Widget): void;

		/**
		 * Restores widget that was deleted.
		 * @param widget Widget to be restored.
		 */		
		undeleteWidget(widget: Widget): void;
	}

	/** Modal dialog host operations. */	
	interface IModalHost {
		/** Gets deferred associated with the host. Caller should resolve/reject the deferred's promise in order to close the dialog. */
		getDeferred(): ng.IDeferred<any>;

		/** 
		 * Shows the dialog.
		 * @returns Promise that will be resolved/rejected when dialog closes.
		 */
		show(): ng.IPromise<any>;
	}

	/** Creates a new instance of IModalHost implementation. */	
	interface IModalHostFactory {
		/**
		 * Creates a new instance of IModalHost implementation.
		 * @param selector JQuery selector for an element that will host the dialog.
		 * @param options Options for modal dialog.
		 */
		create(selector: string, options: ModalOptions): IModalHost;
	}
}

declare module angular {
	interface IScope {
		/**
		 * Constructs full path to template.
		 * @param fileName Template file name without path.
		 */
		pathToTemplate: (fileName: string) => string;
	}
}

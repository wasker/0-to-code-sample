/// <reference path="../typings/angularjs/angular.d.ts" />
/// <reference path="../typings/angular-ui-bootstrap/angular-ui-bootstrap.d.ts" />

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
	
	/** Scope of the widget manager. */	
	interface WidgetManagerScope extends ng.IScope {
		/** Widget manager model. */
		model: {
			/** List of widgets. */
			widgets: WidgetList;
	
			/** Indicates whether the operation is in progress. */		
			operationInProgress: boolean;
	
			/** If operation results in an error, contains a message. */
			errorMessage?: string;			
		}
	
		/** Initiates operation of adding a new widget. */		
		addWidget: EventCallback;		
	
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

	/** Scope of the widget line item in the widget manager. */	
	interface WidgetLineItemScope {
		/** Model. */
		model: Widget;
	
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
		
		/** Indicates whether the data is valid. */		
		isValid?: boolean;
	
		/** Indicates whether the operation is in progress. */		
		operationInProgress?: boolean;
	
		/** If operation results in an error, contains a message. */
		errorMessage?: string;			
	}
	
	/** Scope of the widget editor. */	
	interface WidgetEditorScope extends ng.IScope{
		/** Widget editor model. */
		model: WidgetEditorModel;
	
		/** Occurs when user clicks OK button. */		
		ok(): void;
	
		/** Occurs when user clicks Cancel button. */		
		cancel(): void;
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

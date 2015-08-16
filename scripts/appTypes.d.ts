/// <reference path="../typings/angularjs/angular.d.ts" />
/// <reference path="../typings/angular-ui-bootstrap/angular-ui-bootstrap.d.ts" />

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

	/** States of the widget. */	
	enum WidgetState {
		existing = 0,
		new = 1,
		deleting = 2,
		deleted = 3,
		undeleting = 4
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

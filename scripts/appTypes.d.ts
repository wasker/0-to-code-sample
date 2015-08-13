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

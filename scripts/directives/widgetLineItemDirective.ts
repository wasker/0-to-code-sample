/// <reference path="../appTypes.d.ts" />

namespace WidgetRegistry {

	/** Widget line item directive. */	
	export class WidgetLineItemDirective implements ng.IDirective {
		/** Directive factory. */
		public static Factory = (): ng.IDirectiveFactory => {
			var factory = (...args: any[]): WidgetLineItemDirective => {
				var instance = <WidgetLineItemDirective>{};
				WidgetLineItemDirective.apply(instance, args);
				return instance;
			}
			factory.$inject = ["appConfig"];
			
			return factory;
		}

		constructor(
			private appConfig: AppConfig) {

			this.templateUrl = appConfig.templateRoot + this.templateUrl;
		}

		/** Part of ng.IDirective. */		
		public scope = {
			model: "=widget",
			onEditWidget: "&",
			onDeleteWidget: "&",
			onUndeleteWidget: "&"
		};

		/** Part of ng.IDirective. */		
		public templateUrl = "widgetLineItem.html";

		/** Part of ng.IDirective. */		
		public restrict = "A";

		/** Part of ng.IDirective. */		
		public replace = true;

		/** Part of ng.IDirective. */		
		public link = (scope: WidgetLineItemScope, element: ng.IAugmentedJQuery, attrs: ng.IAttributes): void => {
			scope.canEditOrDelete = this.canEditOrDelete;
			scope.isDeleted = this.isDeleted;
			scope.isDeleting = this.isDeleting;
			scope.isUndoingDelete = this.isUndoingDelete;
		}
		
		/** Part of WidgetLineItemScope. */		
		private canEditOrDelete = (widget: Widget): boolean => {
			return !widget.$state || WidgetState.existing == widget.$state || WidgetState.new == widget.$state;
		}

		/** Part of WidgetLineItemScope. */		
		private isDeleting = (widget: Widget): boolean => {
			return !!widget.$state && WidgetState.deleting == widget.$state;
		}

		/** Part of WidgetLineItemScope. */		
		private isUndoingDelete = (widget: Widget): boolean => {
			return !!widget.$state && WidgetState.undeleting == widget.$state;
		}
		
		/** Part of WidgetLineItemScope. */		
		private isDeleted = (widget: Widget): boolean => {
			return !!widget.$state && WidgetState.deleted == widget.$state;
		}
	}

	//	Register with application module.	
	angular.module(appModuleName).directive("widgetLineItem", WidgetLineItemDirective.Factory());

}

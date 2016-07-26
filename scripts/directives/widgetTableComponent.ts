namespace WidgetRegistry {

	/** Widget line item component. */	
	class WidgetTableComponent implements WidgetTableScope {
		public static $inject = ["appConfig"];

		constructor(
			private appConfig: AppConfig) {

		}

		/** Part of WidgetTableScope. */		
		public model: WidgetList;

		/** Part of WidgetTableScope. */		
		public tableClass: string;
		
		/** Part of WidgetTableScope. */		
		public canEditOrDelete = (widget: Widget): boolean => {
			return !widget.$state || WidgetState.existing == widget.$state || WidgetState.new == widget.$state;
		}

		/** Part of WidgetTableScope. */		
		public isDeleting = (widget: Widget): boolean => {
			return !!widget.$state && WidgetState.deleting == widget.$state;
		}

		/** Part of WidgetTableScope. */		
		public isUndoingDelete = (widget: Widget): boolean => {
			return !!widget.$state && WidgetState.undeleting == widget.$state;
		}
		
		/** Part of WidgetTableScope. */		
		public isDeleted = (widget: Widget): boolean => {
			return !!widget.$state && WidgetState.deleted == widget.$state;
		}
	}

	//	Register with application module.	
	angular.module(appModuleName).component("widgetTable", {
		templateUrl: "/templates/widgetTable.html",		// TODO
		bindings: {
			model: "=",	//	Can't use "=widgets" anymore.
			tableClass: "@",
			onEditWidget: "&",
			onDeleteWidget: "&",
			onUndeleteWidget: "&"
		},
		controller: WidgetTableComponent
	});

}

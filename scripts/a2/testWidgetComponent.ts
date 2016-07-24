import { Component, Input, Inject } from "@angular/core";

@Component({
	selector: "test-widget",
	template: "<div>Hello world {{model.length}} - {{appConfig.apiEndpoint}}!</div>"
})
export class testWidgetComponent {
	static DowngradeDirectiveName = "testWidget";

	constructor(
		@Inject("appConfig") private appConfig: WidgetRegistry.AppConfig) {

	}

	@Input("widgets") 	
	public model: WidgetRegistry.WidgetList;
}

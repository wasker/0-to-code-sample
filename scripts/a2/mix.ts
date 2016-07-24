import { upgradeAdapter } from "./upgrade";
import { testWidgetComponent } from "./testWidgetComponent";

export function mixComponents(): void {
    angular.module(WidgetRegistry.appModuleName).directive(testWidgetComponent.DowngradeDirectiveName, <ng.IDirectiveFactory>upgradeAdapter.downgradeNg2Component(testWidgetComponent));

    upgradeAdapter.upgradeNg1Provider("appConfig");    
}

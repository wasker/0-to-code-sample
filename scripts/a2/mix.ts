import { upgradeAdapter } from "./upgrade";
import { testWidgetComponent } from "./testWidgetComponent";
import { WidgetManagerController } from "./widgetManagerController";

export function mixComponents(): void {
    angular.module(WidgetRegistry.appModuleName).directive(testWidgetComponent.DowngradeDirectiveName, <ng.IDirectiveFactory>upgradeAdapter.downgradeNg2Component(testWidgetComponent));
    angular.module(WidgetRegistry.appModuleName).directive(WidgetManagerController.DowngradeDirectiveName, <ng.IDirectiveFactory>upgradeAdapter.downgradeNg2Component(WidgetManagerController));

    upgradeAdapter.upgradeNg1Provider("$q");    

    upgradeAdapter.upgradeNg1Provider("appConfig");    
    upgradeAdapter.upgradeNg1Provider("widgetService");    
    upgradeAdapter.upgradeNg1Provider("modalHostFactory");    
}

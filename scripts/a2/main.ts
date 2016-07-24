import { upgradeAdapter } from "./upgrade";
import { mixComponents } from "./mix";

//  Must be before bootstrap.
mixComponents();

upgradeAdapter
    .bootstrap(document.getElementById("widgetRegistryApp"), ["widgetRegistryApp"], { strictDi: true });

import { upgradeAdapter } from "./upgrade";

upgradeAdapter.bootstrap(document.getElementById("widgetRegistryApp"), ["widgetRegistryApp"], {
    strictDi: true
});

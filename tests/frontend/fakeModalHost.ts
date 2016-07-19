/// <reference path="setup.ts" />

/** Fake modal dialog host. */	
class FakeModalHost implements WidgetRegistry.IModalHost {
    constructor(
        selector: string,
        private options: ModalOptions,
        private deferred: ng.IDeferred<any>) {

    }

    /** Part of IModalHost. */
    public getDeferred = (): ng.IDeferred<any> => {
        return this.deferred;
    }

    /** Part of IModalHost. */
    public show = (): ng.IPromise<any> => {
        return this.getDeferred().promise;
    }
}

/** FakeModalHost factory. */	
class FakeModalHostFactory implements WidgetRegistry.IModalHostFactory {
    constructor(
        private deferred: ng.IDeferred<any>) {

    }

    /** Part of IModalHostFactory. */
    public create = (selector: string, options: ModalOptions): WidgetRegistry.IModalHost => {
        return new FakeModalHost(selector, options, this.deferred);
    }
}

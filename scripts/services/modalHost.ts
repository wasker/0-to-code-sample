/// <reference path="../appTypes.d.ts" />

namespace WidgetRegistry {

	/** Modal dialog host. */	
    class ModalHost implements IModalHost {
        private modalHost: JQuery;
        private deferred: ng.IDeferred<any>;

        constructor(
            selector: string,
            private options: ModalOptions,
            $q: ng.IQService) {

            this.modalHost = angular.element(selector);
            this.deferred = $q.defer();
		}

		/** Part of IModalHost. */
        public getDeferred = (): ng.IDeferred<any> => {
            return this.deferred;
		}

		/** Part of IModalHost. */
        public show = (): ng.IPromise<any> => {
            let promise = this.getDeferred().promise;
            promise.finally(() => this.modalHost.modal("hide"));

            this.modalHost.modal(this.options).modal("show");
            
            return promise;
		}
	}

	/** ModalHost factory. */	
	class ModalHostFactory implements IModalHostFactory {
		constructor(
			private $q: ng.IQService) {

        }

		/** Part of IModalHostFactory. */
        public create = (selector: string, options: ModalOptions): IModalHost => {
            return new ModalHost(selector, options, this.$q);
		}
	}
	
	//	Register with application module.	
    angular.module(appModuleName).factory("modalHostFactory", ["$q", ($q: ng.IQService) => new ModalHostFactory($q)]);

}

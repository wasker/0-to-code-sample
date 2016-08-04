// Turn on full stack traces in errors to help debugging
// Error.stackTraceLimit = Infinity;
Error.stackTraceLimit = 0;


jasmine.DEFAULT_TIMEOUT_INTERVAL = 3000;

// Cancel Karma's synchronous start,
// we will call `__karma__.start()` later, once all the specs are loaded.
__karma__.loaded = function() {};

// Make sure Angular's testing modules are being loaded.
System.packageWithIndex = true;

// Prefix all module paths with a base path.
System.config({
  baseURL: "/base/wwwroot/"
});

System.import("/base/wwwroot/js/systemjs.config.js").then(function() {
  return Promise.all([
    System.import("@angular/core/testing"),
    System.import("@angular/platform-browser-dynamic/testing")
  ]).then(function(providers) {
    var testing = providers[0];
    var testingBrowser = providers[1];

    testing.setBaseTestProviders(testingBrowser.TEST_BROWSER_DYNAMIC_PLATFORM_PROVIDERS, testingBrowser.TEST_BROWSER_DYNAMIC_APPLICATION_PROVIDERS);
  })
})
.then(function() {
  return Promise.all(
    Object.keys(window.__karma__.files) // All files served by Karma.
    .filter(onlySpecFiles)
    .map(function(moduleName) {
      // loads all spec files via their global module names (e.g. 'base/public/app/hero.service.spec')
      return System.import(moduleName);
    }));
}).then(function() {
  __karma__.start();
}, function(error) {
  __karma__.error(error.stack || error);
});

function filePath2moduleName(filePath) {
  return filePath.
           replace(/^\//, '').              // remove / prefix
           replace(/\.\w+$/, '');           // remove suffix
}

function onlyAppFiles(filePath) {
  return /^\/base\/public\/app\/.*\.js$/.test(filePath)
}

function onlySpecFiles(path) {
  return /^\/base\/wwwroot\/tests\/tests\/.*\.js$/.test(path);
}

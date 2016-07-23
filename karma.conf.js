module.exports = function(config) {
  config.set({
    frameworks: ["jasmine"],
    browsers: ["PhantomJS"],
    phantomjsLauncher: {
      exitOnResourceError: true
    },

    files: [
      "./wwwroot/lib/angular/angular.min.js",
      "./wwwroot/lib/angular-bootstrap/ui-bootstrap-tpls.min.js",
      "./wwwroot/lib/angular-ui-router/release/angular-ui-router.min.js",
      "./wwwroot/lib/jquery/dist/jquery.min.js",
      "./node_modules/angular-mocks/angular-mocks.js",
      "./node_modules/jasmine-jquery/lib/jasmine-jquery.js",
      "./wwwroot/js/**/*.js",
      "./wwwroot/tests/setup.js",
      "./wwwroot/tests/fakeModalHost.js",
      "./wwwroot/tests/tests/**/*.js"
    ],
    exclude: [
      "./wwwroot/js/app.min.js",
      "./wwwroot/js/templates.js",
      "./wwwroot/js/systemjs.config.js",
      "./wwwroot/js/a2/**/*.*",
    ],

    reporters: ["progress", "coverage"],

    preprocessors: {
      "./wwwroot/js/**/*.js": ["coverage"]
    },

    coverageReporter: {
      type: "html",
      dir: "./wwwroot/tests/coverage/"
    }
  });
};

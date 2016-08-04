module.exports = function(config) {
  config.set({
    basePath: "",

    frameworks: ["jasmine"],
    browsers: ["PhantomJS"],
    phantomjsLauncher: {
      exitOnResourceError: true
    },

    files: [
      { pattern: "./wwwroot/**/*.js.map", included: false },

      "./wwwroot/lib/jquery/dist/jquery.min.js",

      "./wwwroot/lib/angular/angular.min.js",
      "./wwwroot/lib/angular-ui-router/release/angular-ui-router.min.js",
      "./wwwroot/lib/angular-bootstrap/ui-bootstrap-tpls.min.js",

      "./wwwroot/lib/zone.js/dist/zone.min.js",
      "./wwwroot/lib/reflect-metadata/reflect.min.js",
      "./wwwroot/lib/systemjs/dist/system.js",
      { pattern: "./wwwroot/lib/@angular/**/*.js", included: false },
      { pattern: "./wwwroot/lib/core-js/**/*.js", included: false },
      { pattern: "./wwwroot/lib/rxjs/**/*.js", included: false },

      { pattern: "./wwwroot/js/systemjs.config.js", included: false },

      "./node_modules/angular-mocks/angular-mocks.js",
      "./node_modules/jasmine-jquery/lib/jasmine-jquery.js",

      "./wwwroot/tests/karma.js",
      
      { pattern: "./wwwroot/js/a2/**/*.*", included: false },
      "./wwwroot/js/app.js",

      "./wwwroot/tests/setup.js",
      "./wwwroot/tests/fakeModalHost.js",
      { pattern: "./wwwroot/tests/tests/**/*.js", included: false }
    ],
    exclude: [
      "./wwwroot/js/app.min.js",
      "./wwwroot/js/templates.js",
    ],

    reporters: ["progress"],
    // reporters: ["progress", "coverage"],

    // preprocessors: {
    //   "./wwwroot/js/**/*.js": ["coverage"]
    // },

    // coverageReporter: {
    //   type: "html",
    //   dir: "./wwwroot/tests/coverage/"
    // }
  });
};

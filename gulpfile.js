/// <binding Clean='clean' />
'use strict';

/* global __dirname */

var gulp = require("gulp"),
  rimraf = require("rimraf"),
  concat = require("gulp-concat"),
  cssmin = require("gulp-cssmin"),
  uglify = require("gulp-uglify"),
  tsc = require("gulp-typescript"),
  sourcemaps = require("gulp-sourcemaps"),
  karma = require("karma").server,
  project = require("./project.json");

var paths = {
  webroot: "./" + project.webroot + "/",
  appScripts: "./scripts/",
  appTests: "./tests/frontend/",
  templates: "./scripts/templates/",
  typings: "./typings/"
};

paths.appOut = paths.webroot + "js/";
paths.appSources = paths.appScripts + "**/*.ts";
paths.testsOut = paths.webroot + "/tests/"
paths.testSources = paths.appTests + "**/*.ts";
paths.templatesOut = paths.webroot + "templates/";
paths.templateFiles = paths.templates + "**/*.html";
paths.js = paths.appOut + "**/*.js";
paths.minJs = paths.webroot + "js/**/*.min.js";
paths.css = paths.webroot + "css/**/*.css";
paths.minCss = paths.webroot + "css/**/*.min.css";
paths.concatJsDest = paths.webroot + "js/site.min.js";
paths.concatCssDest = paths.webroot + "css/site.min.css";

gulp.task("clean:js", function(cb) {
  rimraf(paths.concatJsDest, cb);
});

gulp.task("clean:css", function(cb) {
  rimraf(paths.concatCssDest, cb);
});

gulp.task("clean", ["clean:js", "clean:css"]);

gulp.task("min:js", function() {
  gulp.src([paths.js, "!" + paths.minJs], {
      base: "."
    })
    .pipe(concat(paths.concatJsDest))
    .pipe(uglify())
    .pipe(gulp.dest("."));
});

gulp.task("min:css", function() {
  gulp.src([paths.css, "!" + paths.minCss])
    .pipe(concat(paths.concatCssDest))
    .pipe(cssmin())
    .pipe(gulp.dest("."));
});

gulp.task("min", ["min:js", "min:css"]);

gulp.task("compile-app", function () {
  var tscResult = gulp.src([paths.appSources, paths.typings + "**/*.d.ts"])
                    .pipe(sourcemaps.init())
                    .pipe(tsc({
                      target: "ES5",
                      removeComments: true,
                      noImplicitAny: true,
                      noEmitOnError: true,
                      noExternalResolve: true,
                      out: "app.js"
                    }));  

  return tscResult.js
          .pipe(sourcemaps.write("maps/"))                  //  Relative to appOut.
          .pipe(gulp.dest(paths.appOut));
});

gulp.task("copy-templates", function () {
  gulp.src(paths.templateFiles)
    .pipe(gulp.dest(paths.templatesOut));
});

function runTests(doneCallback) {
  karma.start({
    configFile: __dirname + "/karma.conf.js",
    singleRun: true
  }, doneCallback);
}

//  gulp run-tests
gulp.task("run-tests", ["build-tests"], function (done) {
  runTests(done);
});

gulp.task("build-tests", function () {
  var tscResult = gulp.src([paths.testSources, paths.appScripts + "widgetState.ts", paths.appScripts + "**/*.d.ts", paths.typings + "**/*.d.ts"])
                    .pipe(sourcemaps.init())
                    .pipe(tsc({
                      target: "ES5",
                      removeComments: false,
                      noImplicitAny: true,
                      noEmitOnError: true,
                      noExternalResolve: true
                    }));  

  return tscResult.js
          .pipe(sourcemaps.write("maps/"))                  //  Relative to testsOut.
          .pipe(gulp.dest(paths.testsOut));
});

/// <binding Clean='clean' />
'use strict';

/* global __dirname */

var gulp = require("gulp"),
  concat = require("gulp-concat"),
  cssmin = require("gulp-cssmin"),
  uglify = require("gulp-uglify"),
  tsc = require("gulp-typescript"),
  sourcemaps = require("gulp-sourcemaps"),
  sass = require("gulp-sass"),
  karma = require("karma").server,
  minifyHtml = require("gulp-minify-html"),
  templateCache = require("gulp-angular-templatecache"),
  del = require("del"),
  start = require("gulp-start-process"),
  runSequence = require("run-sequence"),
  project = require("./project.json");

var paths = {
  webroot: "./" + project.webroot + "/",
  nodeModules: "./node_modules/",
  appScripts: "./scripts/",
  appTests: "./tests/frontend/",
  templates: "./scripts/templates/",
  typings: "./typings/",
  appStyles: "./styles/"
};

paths.appOut = paths.webroot + "js/";
paths.appSources = paths.appScripts + "**/*.ts";
paths.testsOut = paths.webroot + "/tests/"
paths.testSources = paths.appTests + "**/*.ts";
paths.templatesOut = paths.webroot + "templates/";
paths.templateFiles = paths.templates + "**/*.html";
paths.styleSources = paths.appStyles + "**/*.scss";
paths.stylesOut = project.webroot + "/css/";
paths.libOut = project.webroot + "/lib/";

//  gulp clean
gulp.task("clean", function (cb) {
  del([paths.appOut, paths.testsOut, paths.templatesOut, paths.stylesOut], cb);
});

//  gulp build
gulp.task("build", function (cb) {
  runSequence("clean", ["build-backend", "build-app"], ["run-tests", "run-tests-backend"], "min:js");
});

//  gulp run-tests
gulp.task("run-tests", ["build-tests"], function (done) {
  runTests(done);
});

//  gulp run-tests-backend
gulp.task("run-tests-backend", function (cb) {
  start("dnx test", cb);
});

//  gulp watch-app
gulp.task("watch-app", ["build-app"], function () {
  gulp.watch(paths.appSources, ["compile-app"]);
  gulp.watch(paths.styleSources, ["compile-styles"]);
  gulp.watch(paths.templateFiles, ["copy-templates"]);
});

//  gulp watch-tests
gulp.task("watch-tests", ["run-tests"], function (done) {
  gulp.watch(paths.appSources, ["compile-app-run-tests"]);
  gulp.watch(paths.testSources, ["run-tests"]);
});

gulp.task("compile-app-run-tests", ["compile-app"], function (done) {
  runTests(done);
});

gulp.task("build-app", ["copy-templates", "copy-libs", "compile-styles", "compile-app"], function () {
});

gulp.task("build-backend", function (cb) {
  start("dnu build", cb);
});

gulp.task("min:js", function() {
  gulp.src([paths.appOut + "templates.js", paths.appOut + "app.js"], {
      base: "."
    })
    .pipe(concat(paths.appOut + "app.min.js"))
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
                      module: "commonjs",
                      moduleResolution: "node",
                      sourceMap: true,
                      emitDecoratorMetadata: true,
                      experimentalDecorators: true,
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
    .pipe(minifyHtml())
    .pipe(templateCache("templates.js", {
      root: "/templates",
      module: "widgetRegistryData"                          //  Use data module, so app module would wait until templates are initialized.
    }))
    .pipe(gulp.dest(paths.appOut));
});

gulp.task("compile-styles", function () {
  gulp.src(paths.styleSources)
    .pipe(sourcemaps.init())
    .pipe(sass({
      includePaths: [],                                     //  Populate with paths to included files.
      outputStyle: "compressed"
    }))
    .pipe(sourcemaps.write("maps/"))                        //  Relative to stylesOut.
    .pipe(gulp.dest(paths.stylesOut));
});

gulp.task("copy-libs", function () {
  gulp.src(paths.nodeModules + "@angular/**/bundles/*.min.js").pipe(gulp.dest(paths.libOut + "@angular"));
  gulp.src(paths.nodeModules + "rxjs/**/bundles/*.min.js").pipe(gulp.dest(paths.libOut + "rxjs"));
  gulp.src(paths.nodeModules + "core-js/client/*.min.js").pipe(gulp.dest(paths.libOut + "core-js/client"));
  gulp.src(paths.nodeModules + "systemjs/dist/*.js").pipe(gulp.dest(paths.libOut + "systemjs/dist"));
  gulp.src(paths.nodeModules + "zone.js/dist/*.min.js").pipe(gulp.dest(paths.libOut + "zone.js/dist"));
  gulp.src([paths.nodeModules + "angular2-in-memory-web-api/index.js", paths.nodeModules + "angular2-in-memory-web-api/in-memory-backend.service.js", paths.nodeModules + "angular2-in-memory-web-api/http-status-codes.js"], {
      base: "."
    })
    .pipe(concat("index.min.js"))
    .pipe(uglify())
    .pipe(gulp.dest(paths.libOut + "angular2-in-memory-web-api"));
  gulp.src(paths.nodeModules + "reflect-metadata/Reflect.js")
    .pipe(concat("reflect.min.js"))
    .pipe(uglify())
    .pipe(gulp.dest(paths.libOut + "reflect-metadata"));
});

function runTests(doneCallback) {
  karma.start({
    configFile: __dirname + "/karma.conf.js",
    singleRun: true
  }, doneCallback);
}

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

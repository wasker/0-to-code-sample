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
paths.appSourcesA2 = paths.appScripts + "a2/**/*.ts";
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
  gulp.watch(paths.appSourcesA2, ["compile-angular2-upgrade"]);
  gulp.watch(paths.styleSources, ["compile-styles"]);
  gulp.watch(paths.templateFiles, ["copy-templates"]);
});

//  gulp watch-tests
gulp.task("watch-tests", ["run-tests"], function (done) {
  gulp.watch(paths.appSources, ["compile-app-run-tests"]);
  gulp.watch(paths.appSourcesA2, ["compile-app-run-tests"]);
  gulp.watch(paths.testSources, ["run-tests"]);
});

gulp.task("compile-app-run-tests", ["compile-app", "compile-angular2-upgrade"], function (done) {
  runTests(done);
});

gulp.task("build-app", ["copy-templates", "copy-libs", "compile-styles", "compile-app", "compile-angular2-upgrade"], function () {
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

gulp.task("compile-app", function () {
  var tscProject = tsc.createProject(paths.appScripts + "tsconfig.json", {
    out: "app.js"
  });
  var tscResult = tscProject.src()
      .pipe(sourcemaps.init())
      .pipe(tsc(tscProject));

  return tscResult.js
      .pipe(sourcemaps.write("maps/"))                  //  Relative to appOut.
      .pipe(gulp.dest(paths.appOut));
});

gulp.task("compile-angular2-upgrade", function () {
  //  NOTE: cannot build modules into 1 file.
  var tscProject = tsc.createProject(paths.appScripts + "a2/tsconfig.json");
  var tscResult = tscProject.src()
      .pipe(sourcemaps.init())
      .pipe(tsc(tscProject));

  return tscResult.js
      .pipe(sourcemaps.write("maps/"))                  //  Relative to appOut.
      .pipe(gulp.dest(paths.appOut + "a2/"));
});

gulp.task("copy-libs", function () {
  gulp.src(paths.appScripts + "systemjs.config.js").pipe(gulp.dest(paths.appOut));

  gulp.src(paths.nodeModules + "@angular/**/bundles/*.min.js").pipe(gulp.dest(paths.libOut + "@angular"));
  gulp.src(paths.nodeModules + "rxjs/**/*.js*").pipe(gulp.dest(paths.libOut + "rxjs"));
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

function runTests(doneCallback) {
  karma.start({
    configFile: __dirname + "/karma.conf.js",
    singleRun: true
  }, doneCallback);
}

gulp.task("build-tests", ["copy-test-libs"], function () {
  var tscProject = tsc.createProject(paths.appTests + "tsconfig.json");
  var tscResult = tscProject.src()
                    .pipe(sourcemaps.init())
                    .pipe(tsc(tscProject));

  return tscResult.js
          .pipe(sourcemaps.write("maps/"))                  //  Relative to testsOut.
          .pipe(gulp.dest(paths.testsOut));
});

gulp.task("copy-test-libs", function () {
  gulp.src(paths.appTests + "karma.js").pipe(gulp.dest(paths.testsOut));
  gulp.src(paths.nodeModules + "@angular/**/*.js").pipe(gulp.dest(paths.libOut + "@angular"));
});

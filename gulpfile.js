var del = require("del");
var gulp = require("gulp");
var istanbul = require("gulp-istanbul");
var mocha = require("gulp-mocha");
var tsb = require("gulp-tsb");
var tslint = require("gulp-tslint");

var buildDirectory = "_build";
var sourcePaths = {
    typescriptFiles: "src/**/*.ts",
    copyFiles: ["src/tasks/**/*.json", "src/tasks/**/*.md"]
};
var testPaths = {
    typescriptFiles: "tests/**/*.ts",
    compiledTestFiles: buildDirectory + "/tests/**/*Tests.js"
};
var codeCoverageDir = buildDirectory + "/codeCoverage";

var compilation = tsb.create({
    target: 'es5',
    module: 'commonjs',
    declaration: false,
    verbose: false
});

gulp.task("clean", function() {
    return del([buildDirectory]);
});

gulp.task("lint", ["clean"], function() {
    return gulp.src([sourcePaths.typescriptFiles, testPaths.typescriptFiles])
        .pipe(tslint())
        .pipe(tslint.report("verbose"));
});

gulp.task("compile", ["lint"], function () {
    return gulp.src([sourcePaths.typescriptFiles, testPaths.typescriptFiles], { base: "." })
        .pipe(compilation())
        .pipe(gulp.dest(buildDirectory))
        .pipe(istanbul({includeUntested: true}))
        .pipe(istanbul.hookRequire());
});

gulp.task("build", ["compile"], function() {
    return gulp.src(sourcePaths.copyFiles, { base: "." })
        .pipe(gulp.dest(buildDirectory));
});

gulp.task("test", ["build"], function() {
    return gulp.src(testPaths.compiledTestFiles, {read: false})
        .pipe(mocha())
        .pipe(istanbul.writeReports({dir: codeCoverageDir}));
});

gulp.task("default", ["test"]);
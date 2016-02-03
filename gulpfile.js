var del = require("del");
var gulp = require("gulp");
var tsb = require("gulp-tsb");
var tslint = require("gulp-tslint");

var buildDirectory = "_build";
var sourcePaths = {
    typescriptFiles: "src/**/*.ts",
    copyFiles: ["src/Tasks/**/*.json", "src/Tasks/**/*.md"]
};
var testPaths = {
    typescriptFiles: "tests/**/*.ts"
};

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
        .pipe(gulp.dest(buildDirectory));
});

gulp.task("build", ["compile"], function() {
    return gulp.src(sourcePaths.copyFiles, { base: "." })
        .pipe(gulp.dest(buildDirectory));
});

gulp.task("default", ["build"]);
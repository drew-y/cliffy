const gulp = require("gulp");
const typeScript = require("gulp-typescript");

const typeScriptProject = typeScript.createProject("tsconfig.json");

gulp.task("build", () =>
    typeScriptProject
        .src()
        .pipe(typeScriptProject())
        .pipe(gulp.dest("lib"))
);

gulp.task("build:test", () =>
    gulp
        .src(["test/src/**/*.ts"])
        .pipe(typeScript())
        .pipe(gulp.dest(`test/build`))
);

gulp.task("watching", ["build:test", "build"], () => {
    gulp.watch(["test/src/**/*.ts"], ["build:test"]);
    gulp.watch(["src/**/*.ts", "src/**/*.js"], ["build"]);
});

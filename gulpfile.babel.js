import gulp from "gulp";
import {deleteSync} from "del";
import minify from "gulp-csso";
import gulpSass from "gulp-sass";
import sass2 from "sass";
import autoprefixer from "gulp-autoprefixer";
import htmlmin from "gulp-htmlmin";
import replace from "gulp-replace";
import imagemin from "gulp-imagemin";
import ghPages from "gh-pages";

const sass = gulpSass(sass2);

const routes = {
  html: {src: "index.html", dest: "dest"},
  css: {
    watch: "src/scss/*",
    src: "src/scss/styles.scss",
    dest: "dest/css",
  },
  img: {
    watch: "src/img/*",
    src: "src/img/*",
    dest: "dest/img",
  },
};
const homepage = () => {
  gulp
    .src(routes.html.src)
    .pipe(replace("dest/css/", "css/"))
    .pipe(replace("src/img/", "img/"))
    .pipe(htmlmin({collapseWhitespace: true}))
    .pipe(gulp.dest(routes.html.dest));
};

const styles = () =>
  gulp
    .src(routes.css.src)
    .pipe(sass().on("error", sass.logError))
    .pipe(
      autoprefixer({
        flexbox: true,
        grid: "autoplace",
      })
    )
    .pipe(minify())
    .pipe(gulp.dest(routes.css.dest));

const img = () => {
  gulp.src(routes.img.src).pipe(imagemin()).pipe(gulp.dest(routes.img.dest));
};

const watch = () => {
  gulp.watch(routes.html.src, homepage);
  gulp.watch(routes.css.watch, styles);
  gulp.watch(routes.img.watch, img);
};
const ghDeploy = async () => {
  await ghPages.publish("dest", {branch: "gh-pages", message: "Auto Deploy"});
};
const clean = async () => await deleteSync(["dest/"]);

const prepare = gulp.series([clean]);

const assets = async () => {
  await homepage();
  await styles();
  await img();
};

const live = gulp.parallel([watch]);
export const build = gulp.series([prepare, assets]);
export const dev = gulp.series([build, live]);
export const deploy = gulp.series([ghDeploy]);

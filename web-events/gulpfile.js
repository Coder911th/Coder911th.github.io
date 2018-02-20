const
    gulp         = require('gulp'),
    browserSync  = require('browser-sync').create();

gulp.task('default', function() {

    browserSync.init({
        server: {
            baseDir: `.`
        },
        open: false,
        port: 80,
        notify: false
    });

    gulp.watch(`./css/*.css`, browserSync.reload);
    gulp.watch(`./*.html`, browserSync.reload);
    gulp.watch(`./js/*.js`, browserSync.reload);
});
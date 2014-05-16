var  gutil = require("gulp-util")
, bold = gutil.colors.bold
, red = gutil.colors.red
, log = gutil.log
;
/**
  * @param {Object} evt - event object from gulp.watch
  * @param {String} code - code value to be passed to process.exit
 */

module.exports = function exit (evt, code) {
  if (code == null) { code = 0 }
    
  if (evt.type === 'changed') {
    log(bold(red("::: Existing gulp task now :::")));
    return process.exit(code);
  }
};

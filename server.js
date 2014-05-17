var path = require('path') 
, gulp = require('gulp')
, express = require('express')
, conn = require('connect')
, gutil = require('gulp-util')
, livereload = require('gulp-livereload')
, tinylr = require('tiny-lr')
, Deferred = require('./Deferred')

, log = gutil.log
, bold = gutil.colors.bold
, magenta = gutil.colors.magenta
;

conn.livereload = require('connect-livereload')
conn.markdown = require('marked-middleware')

/**
  * @param {String} glob - glob pattern to watch. NOTE: doesn't support an array.
  * @returns {Function} - A gulp task
  * @description 
  * It creates a express/livereload servers and server the `./coverage/index.html`, and `./*.md` diles
 */
module.exports = function server (opts) {
  var app = express()
  , path = require('path')
  , lrUp = new Deferred()
  // , glob = ["./coverage/index.html"
  , GLOB
  , serverLR
  , PORT
  , PORT_LR
  , ROOT
  ;

  opts = opts || {}
  PORT = opts.port || 4001
  PORT_LR = opts.lrPort || PORT + 1
  ROOT = opts.root || process.cwd()
  GLOB = opts.glob || [
    path.join(ROOT, '*.md')
  , path.join(ROOT, 'coverage/**/*')
  , path.join(ROOT, 'jsdoc/**/*')
  ]

  serverLR = tinylr({
    liveCSS: false,
    liveJs: false,
    LiveImg: false
  });

  serverLR.listen(PORT_LR, function(err) {
    if (err) { return lrUp.reject(err) }
    lrUp.resolve();
  });

  app.use(conn.errorHandler({dumpExceptions: true, showStack: true}));
  app.use(conn.livereload({port: PORT_LR}));

  app.use(conn.markdown({directory: ROOT}))
  app.use('/coverage', express.static('./coverage'));
  app.use('/jsdoc', express.static('./jsdoc'));

  app.listen(PORT, function() {
    log(bold("express server running on port: " + magenta(PORT)));
  });

  return function(){
    var firstLoad = true;
    return gulp.watch(GLOB, function(evt) {
      lrUp.then(function() {
        gulp.src(evt.path).pipe(livereload(serverLR));
        if (firstLoad){
          // sleeping, to give time to tiny-lr to do its stuff
          shell('sleep 1 && touch ./coverage/index.html')
          firstLoad = false;
          return
        }
        log('LR: reloading....');
      });
    });
  };




};

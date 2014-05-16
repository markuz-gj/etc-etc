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

/**
  * @param {String} glob - glob pattern to watch. NOTE: doesn't support an array.
  * @returns {Function} - A gulp task
  * @description 
  * It creates a express/livereload servers and server the `./coverage/index.html`, and `./*.md` diles
 */
module.exports = function server (opts) {
  var app = express()
  , lrUp = new Deferred()
  , glob = "./coverage/index.html"
  , serverLR
  , PORT
  , PORT_LR
  ;

  opts = opts || {port: 4001}
  PORT = opts.port
  PORT_LR = PORT + 1
  
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
  app.use('/coverage', express["static"](path.resolve('./coverage')));

  app.listen(PORT, function() {
    log(bold("express server running on port: " + magenta(PORT)));
  });

  return function() {
    var firstLoad = true;
    gulp.watch(glob, function(evt) {
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

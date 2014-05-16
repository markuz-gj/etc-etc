var exec = require('child_process').exec 
, Deferred = require('./Deferred')
, thr = require('super-stream.through').obj
;
/** 
  * @param {String} cmd 
  * @returns {Promise}
  * @description - A little function to exec a command on a child-process
  */
module.exports = function shell (cmd) {
  var cache, defer, stream
  ;
  cache = {stdout:[], stderr: []};
  defer = new Deferred();

  stream = exec(cmd);
  stream.on("error", defer.reject);

  stream.stdout.pipe( thr(function(chunk, enc, next){
    cache.stdout.push(chunk); next();
  }));

  stream.stderr.pipe(thr(function(chunk, enc, next){
    cache.stdout.push(chunk); next();
  }));

  stream.on("close", function(code){
    str = cache.stdout.join('');
    str = str +'\n'+ cache.stderr.join('');
    defer.resolve(str)
  });

  return defer.promise;
};

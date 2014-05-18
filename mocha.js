var shell = require("./shell")
, rand = require('./rand')
;
// require('string.prototype.repeat')

/**
 * @param {String} filename - filename to run mocha against.
 * @returns {Function} - A gulp task
 */
;
module.exports = function mocha (filename){
  return function(){
    var cmd = './node_modules/.bin/mocha --compilers coffee:coffee-script/register ' +filename+ ' -R spec -t 1000;'
    ;
    shell(cmd)
      .then(console.log)
      .catch(function(err){throw err})
      .then(function(){
        console.log()
        console.log(rand(4))
      })
  }
};

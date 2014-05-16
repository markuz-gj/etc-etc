var shell = require("./shell")
;
/**
 * @param {String} filename - filename to run istanbul against.
 * @returns {Function} - A gulp task
 */
module.exports = function istanbul (filename){
  return function(){
    var cmd = 'rm -rf ./coverage && ./node_modules/.bin/istanbul cover -x spec --report html ./node_modules/.bin/_mocha --  --compilers coffee:coffee-script/register ' +filename+ ' -R spec -t 10000'
    ;

    shell(cmd)
      .then(function(str){
        var cache = []
        ;
        // making istanbul output prettier.
        cache.push(str.split('\n').slice(1, -13).join('\n'))
        cache.push('  Istanbul code coverage:')
        cache.push('==================================')
        cache.push(str.split('\n').slice(-7, -3).join('\n'))
        console.log(cache.join('\n'))
      })
      .catch(function(err){throw err})
  }
};

var writeFile = require('fs').writeFile

, gulp = require('gulp')
, jsdoc = require('gulp-jsdoc')

, shell = require('./shell')
, thr = require('super-stream.through').obj
;

/**
 * Using Regex, it fix jsdoc for `writeReadme` function. 
 * @private
 * @param  {String} line 
 * @return {String} - A string ready to be printed into the Readme.md
 */
function fixLine (line) {
  return line.replace(/^[ ]*\* (@description|@example|@readme|@desc)/, '')
    .replace(/^[ ]*\*/, '')
    .replace(/^[ ]/, '')
}

/**
  * @private
  * @returns {Transform}
  *
  * @description 
  *
  * A `Transform` Stream which extract all jsdoc @desc tags, concat 
  * them and write a `README.md`, but it just pass the vinyl unchanged
 */
function writeReadme() {
  /**
   * @param  {Object}   vfs  - vinyl filesystem
   * @param  {String}   enc  
   * @param  {Function} next 
   */
  return thr(function(vfs, enc, next) {
    if (vfs.path.match(/md$/)) return next(null, vfs)

    var cache = {}
    , str =  vfs.contents.toString()
    ;

    cache.out = []
    cache.buf = []
    cache.ready = false

    str.split('\n').map(function(line) {
      if (cache.ready && line.match(/\* @/)) cache.ready = false

      if (line.match(/\*\//)) {
        if (cache.buf.length) cache.out.push(cache.buf.join('\n'))
        cache.ready = false
        cache.buf = []
      }

      if (line.match(/\* (@desc|@readme|@example)/)) cache.ready = true

      if (cache.ready) return cache.buf.push(fixLine(line))

    })
    
    writeFile('./README.md', cache.out.join('\n'), function(err) {
      if (err) next(err)
      next(null, vfs)
    })
  })
}

/**
  * A `Transform` Stream which un-escape `##\#`  
  * @private
  * @returns {Transform} 
  * 
  * @description 
  * 
  * Coffeescript triple # comment style conflics with markdown triple #. 
  * So the markdown triple # are "escaped" and this stream un-escapes it. :) cool hack hum?.
 */
function fixMarkdown () {
  return thr(function(vfs, enc, next) {
    vfs.contents = new Buffer(vfs.contents.toString().replace(/\\#/g, '#').replace('\*#', '##'))
    next(null, vfs)
  })
}

/**
  * extract all block code language type metatdata. 
  * @private
  * @returns {Transform}
 */
function fixJsdoc () {
  return thr(function(vfs, enc, next) {
    vfs.contents = new Buffer(vfs.contents.toString().replace(/(```javascript|```)/g, ''));
    next(null, vfs)
  })
}

/**
 * @param {String|Array<String>} glob - glob pattern to match
 * @returns {Function} - A gulp task
 */
module.exports = function compileDoc (src) {
  var config, template
  ;
  config = {
    plugins: ['plugins/markdown']
  , markdown: {
      parser: 'gfm'
    , hardwrap: true
    , readme: './README.md'
    }
  }

  // template = {
  //   path: 'ink-docstrap'
  // , systemName: 'super-stream'
  // , copyright: "2014 (c) MIT"
  // , navType: "vertical"
  // , theme: "spacelab"
  // , linenums: true
  // , collapseSymbols: false
  // , inverseNav: false
  // }

  return function() {
      gulp.src(src)
        .pipe(fixMarkdown())
        .pipe(writeReadme())
        .pipe(fixJsdoc())
        .pipe(jsdoc.parser(config))
        .pipe(jsdoc.generator('jsdoc'))
        // .pipe(jsdoc.generator('jsdoc', template))      

  }
}







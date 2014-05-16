var Promise = require('es6-promise').Promise
;
/**
 * @constructor
 * @description - A simple deferred wrapper around es6-promise
 * @returns {Deferred} - A deferred promise
 */
function Deferred () {
  this.promise = new Promise(function(resolve, reject){
    /**
     * @private
     * @type {Function}
     */
    this.resolve_ = resolve;

    /**
     * @private
     * @type {Function}
     */
    this.reject_ = reject;
  }.bind(this));

  return this;
};

/**
 * An alias for the `resolve` callback funcion
 * @memberOf Deferred
 * @return {undefined}
 */
Deferred.prototype.resolve = function() {
  this.resolve_.apply(this.promise, arguments);
};

/**
 * An alias for the `reject` callback funcion
 * @memberOf Deferred
 * @return {undefined}
 */
Deferred.prototype.reject = function() {
  this.reject_.apply(this.promise, arguments);
};

/**
 * An alias for the `then` method
 * @memberOf Deferred
 * @return {?}
 */
Deferred.prototype.then = function() {
  return this.promise.then.apply(this.promise, arguments);
};

/**
 * An alias for the `catch` method
 * @memberOf Deferred
 * @return {?}
 */
Deferred.prototype.catch = function() {
  return this.promise.catch.apply(this.promise, arguments);
};

module.exports = Deferred;

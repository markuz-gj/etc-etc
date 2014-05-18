
module.exports = function rand (n) {
  n = n || 6
  return ~~(Math.random()*Math.pow(10,n))
}


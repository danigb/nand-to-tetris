var { xor, and } = require('./logic')

function halfAdder (a, b) {
  return { out: xor(a, b), carry: and(a, b) }
}

function fullAdder (a, b, carry) {
  var h = halfAdder(a, b)
  var c = halfAdder(h.out, carry)
  return { out: c.out, carry: halfAdder(h.carry, c.carry).out }
}

function adder () {

}

module.exports = {
  halfAdder, fullAdder, adder
}

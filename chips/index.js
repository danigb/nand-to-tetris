
function wire () {
  var value = 0
  var subs = []
  return {
    get: () => value,
    add: (sub) => subs.push(sub),
    set: (v) => {
      value = v
      subs.forEach(s => s())
    }
  }
}
var _one = wire()
_one.set(1)

function subscribe (fn, ...wires) {
  wires.forEach(w => w.add(fn))
  fn()
}

const nandOp = (a, b) => a && b ? 0 : 1

function nand (a, b, out) {
  subscribe(() => {
    out.set(nandOp(a.get(), b.get()))
  }, a, b)
}

function not (a, out) {
  nand(a, _one, out)
}

function and (a, b, out) {
  var inv = wire()
  nand(a, b, inv)
  not(inv, out)
}

function or (a, b, out) {
  var [na, nb] = [wire(), wire()]
  not(a, na)
  not(b, nb)
  nand(na, nb, out)
}

function repeat (num, fn) { for (var i = 0; i < num; i++) fn(i) }

function wire16 () {
  var wires = []
  for (var i = 0; i < 16; i++) wires.push(wire())
  return wires
}

function not16 (aw, outw) {
  repeat(16, (i) => not(aw[i], outw[i]))
}

function and16 (aw, bw, outw) {
  repeat(16, (i) => and(aw[i], bw[i], outw[i]))
}

module.exports = {
  wire, wire16, nand, not, and, or, not16, and16
}

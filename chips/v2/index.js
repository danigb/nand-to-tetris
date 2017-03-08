const isArray = Array.isArray

function each (len, fn, ...digits) {
  var result = new Array(len)
  for (var i = 0; i < len; i++) {
    result[i] = fn.apply(null, digits.map(d => d[i]))
  }
  return result
}

function run (graph) {
  var [op, a, b] = graph
  if (isArray(op)) return graph.map((g) => run(g)) // multi-bit
  if (isArray(a)) a = run(a)
  if (isArray(b)) b = run(b)
  if (op === 'nand') return a && b ? 0 : 1
  else throw Error('Unknow operation: ' + op)
}

// LOGIC
// =====
const nand = (a, b) => ['nand', a, b]
const not = (a) => nand(a, 1)
const and = (a, b) => not(nand(a, b))
const or = (a, b) => nand(not(a), not(b))
const xor = (a, b) => or(and(a, not(b)), and(not(a), b))
const mux = (a, b, sel) => nand(nand(a, nand(sel, sel)), nand(b, sel))

// multi-bit
const not16 = (aw) => each(16, not, aw)
const or16 = (aw, bw) => each(16, or, aw, bw)

// multi-way
const or8way = (w) => or(w[0], or(w[1], or(w[2], or(w[3], or(w[4], or(w[5]), or(w[6]), or(w[7]))))))

/* eslint-disable object-property-newline */
module.exports = {
  run,
  nand, not, and, or, xor, mux,
  not16, or16, or8way
}

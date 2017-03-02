
const nand = (a, b) => a && b ? 0 : 1
const op = (a, b) => ['nand', a, b]
const run = (fn) => fn(nand)
const build = (fn) => fn(op)

/**
 * Not The single-input Not gate, also known as “converter,” converts its input
 * from 0 to 1 and vice versa
*/
const not = (a) => (N) => N(a, 1)
const and = (a, b) => (N) => not(N(a, b))(N)
const or = (a, b) => (N) => N(not(a)(N), not(b)(N))
const xor = (a, b) => (N) => or(and(a, not(b)(N))(N), and(not(a)(N), b)(N))(N)

/**
 * “Multiplexor A multiplexor (figure 1.8) is a three-input gate that uses one
 * of the inputs, called “selection bit,” to select and output one of the other
 * two inputs, called “data bits.” Thus, a better name for this device might
 * have been selector.
 */
const mux = (a, b, sel) => (nand) => nand(nand(a, nand(sel, sel)), nand(b, sel))

// Multi-Bit Versions of Basic Gates
const multiBit = (num, fn) => (nand) => {
  var arr = []
  for (var i = 0; i < num; i++) arr[i] = fn(i)(nand)
  return arr
}
const not16 = (aw) => multiBit(16, (i) => not(aw[i]))
const and16 = (aw, bw) => multiBit(16, (i) => and(aw[i], bw[i]))
const or16 = (aw, bw) => multiBit(16, (i) => or(aw[i], bw[i]))
const mux16 = (aw, bw, sel) => multiBit(16, (i) => mux(aw[i], bw[i], sel))

// MULTI-WAY VERSIONS OF BASIC GATES

/**
 *
 * “Multi-Way Or An n-way Or gate outputs 1 when at least one of its n bit
 * inputs is 1, and 0 otherwise.
 */
const or8way = (aw) => (N) => or(aw[3], or(aw[2], or(aw[1], aw[0])(N))(N))(N)

module.exports = {
  nand, op, run, build,
  not, and, or, xor, mux,
  not16, and16, or16, mux16,
  or8way
}

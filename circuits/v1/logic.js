// BOOLEAN LOGIC
// =============

var MOP = { inputs: ['a'], outputs: ['out'] }
var BIOP = { inputs: ['a', 'b'], outputs: ['out'] }

/**
 * A Nand gate

 * The starting point of our computer architecture is the Nand gate, from which
 * all other gates and chips are built. This is a primitive.
 *
 * @function
 */
const nand = (a, b) => a && b ? 0 : 1
nand.chip = BIOP

// Basic logic gates
// ================

/**
 * Not: The single-input Not gate, also known as “converter” converts its input
 * from 0 to 1 and vice versa.
 */
const not = (a) => nand(a, 1)
not.chip = MOP

/**
 * And: The And function returns 1 when both its inputs are 1, and 0 otherwise.
 */
const and = (a, b) => not(nand(a, b))
and.chip = BIOP

/**
 * OR gate: returns 1 when at least one of its inputs is 1, and 0 otherwise.
 *
 * OR gate with inverted inputs is a NAND gate (de Morgan’s: `A’ + B’ = (A • B)’`)
 */
const or = (a, b) => nand(not(a), not(b))
or.chip = BIOP

/**
 * Xor: The Xor function, also known as “exclusive or” returns 1 when its two
 * inputs have opposing values, and 0 otherwise.
 */
function xor (a, b) {
  return nand(nand(a, nand(a, b)), nand(b, nand(a, b)))
}
xor.chip = BIOP

// an alternative implementation
xor.alt = (a, b) => or(and(a, not(b)), and(not(a), b))

/**
 * Multiplexor: A multiplexor is a three-input gate that uses one of the inputs,
 * called “selection bit,” to select and output one of the other two inputs, called “data bits.”
 *
 * The name multiplexor was adopted from communications systems, where similar
 * devices are used to serialize (multiplex) several input signals over a single output wire.
 */
function mux (a, b, sel) {
  return nand(nand(a, nand(sel, sel)), nand(b, sel))
}
mux.chip = { inputs: ['a', 'b', 'sel'], outputs: ['out'] }

/**
 * Demultiplexor:
 */
function dmux (input, sel) {
  var aa = nand(sel, sel)
  var bb = nand(input, aa)
  var cc = nand(input, sel)
  return { a: nand(bb, bb), b: nand(cc, cc) }
}
dmux.chip = { inputs: ['in', 'sel'], outputs: ['a', 'b'] }

// ### Multi-Bit Versions of Basic Gates
var MOP16 = { inputs: ['a/16'], outputs: ['out/16'] }
var BIOP16 = { inputs: ['a/16', 'b/16'], outputs: ['out/16'] }

function array (size, fn) {
  var w = new Array(size)
  for (var i = 0; i < size; i++) w[i] = fn[i]
  return w
}

function not16 (a) {
  return array(16, (i) => not(a[i]))
}
not16.chip = MOP16

function or16 (a, b) {
  return array(16, (i) => or(a[i], b[i]))
}
or16.chip = BIOP16

function and16 (a, b) {
  return array(16, (i) => and(a[i], b[i]))
}
and16.chip = BIOP16

function mux16 (a, b, sel) {
  return array(16, (i) => mux(a[i], b[i], sel))
}
mux16.chip = { inputs: ['a/16', 'b/16', 'sel'], outputs: ['out/16'] }

function dmux16 (input, sel) {
  // FIXME
}
dmux16.chip = { inputs: ['in/16', 'sel'], outputs: ['a/16', 'b/16'] }

/*
 * An n-bit multiplexor is exactly the same as the binary multiplexor described
 * in figure 1.8, except that the two inputs are each n-bit wide; the selector
 * is a single bit.
 */

// ### Multi-Way Versions of Basic Gates

function or8way (i) {
  return or(i[0], or(i[1], or(i[2], or(i[3], or(i[4], or(i[5]), or(i[6]), or(i[7]))))))
}
or8way.chip = { inputs: ['in/8'], outputs: ['out'] }

function mux4way16 (a, b, c, d, sel) {
  var aa = mux16(a, b, sel[0])
  var bb = mux16(c, d, sel[0])
  return mux16(aa, bb, sel[1])
}
mux4way16.chip = { inputs: ['a/16', 'b/16', 'c/16', 'd/16', 'sel/2'], outputs: ['out/16'] }

/* eslint-disable */
module.exports = {
  nand, not, and, or, xor, mux, dmux,
  not16, and16, or16, xor16, mux16, dmux16,
  or8way
}

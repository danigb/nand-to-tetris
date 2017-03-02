/* eslint-disable object-property-newline */
/* global describe it */
var assert = require('assert')
var {
  run,
  not, and, or, xor, mux, not16, or16, or8way
} = require('..')

// binary string
const bstr = (a) => a.split('').map(d => +d)

describe('Logic', () => {
  it('NOT', () => {
    assert.deepEqual(not('a'), ['nand', 'a', 1])
    assert.equal(run(not(0)), 1)
    assert.equal(run(not(1)), 0)
  })

  it('AND', () => {
    assert.deepEqual(and('a', 'b'), [ 'nand', [ 'nand', 'a', 'b' ], 1 ])
    assert.equal(run(and(1, 1)), 1)
    assert.equal(run(and(1, 0)), 0)
    assert.equal(run(and(0, 1)), 0)
    assert.equal(run(and(0, 0)), 0)
  })

  it('OR', () => {
    assert.deepEqual(or('a', 'b'), [ 'nand', [ 'nand', 'a', 1 ], [ 'nand', 'b', 1 ] ])
  })

  it('XOR', () => {
    assert.deepEqual(xor('a', 'b'), [ 'nand',
      [ 'nand', [ 'nand', [ 'nand', 'a', [ 'nand', 'b', 1 ] ], 1 ], 1 ],
      [ 'nand', [ 'nand', [ 'nand', [ 'nand', 'a', 1 ], 'b' ], 1 ], 1 ] ])
    assert.equal(run(xor(0, 0)), 0)
    assert.equal(run(xor(1, 0)), 1)
    assert.equal(run(xor(0, 1)), 1)
    assert.equal(run(xor(1, 1)), 0)
  })

  it('MUX', () => {
    assert.equal(run(mux(0, 0, 0)), 0)
    assert.equal(run(mux(0, 0, 1)), 0)
    assert.equal(run(mux(1, 0, 0)), 1)
    assert.equal(run(mux(1, 0, 1)), 0)
    assert.equal(run(mux(0, 1, 0)), 0)
    assert.equal(run(mux(0, 1, 1)), 1)
    assert.equal(run(mux(1, 1, 0)), 1)
    assert.equal(run(mux(1, 1, 1)), 1)
  })

  it('NOT16', () => {
    assert.deepEqual(run(
      not16(bstr('1101010101010101'))),
      bstr('0010101010101010'))
  })
  it('OR16', () => {
    assert.deepEqual(run(
      or16(bstr('1010101010101010'), bstr('1100100010001001'))),
      bstr('1110101010101011'))
  })

  it('OR8WAY', () => {
    assert.equal(run(or8way(bstr('0000000'))), 0)
    assert.equal(run(or8way(bstr('0010000'))), 1)
  })
})

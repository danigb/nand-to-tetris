/* global describe test expect */
var { not, and, or, xor, not16, and16, run, build } = require('./index.js')

const word = (str) => str.split('').map(d => +d)

describe('circuit', () => {
  test('not', () => {
    expect(build(not(0))).toEqual(['nand', 0, 1])
    expect(run(not(0))).toBe(1)
    expect(run(not(1))).toBe(0)
  })

  test('and', () => {
    expect(run(and(0, 0))).toBe(0)
    expect(run(and(1, 0))).toBe(0)
    expect(run(and(0, 1))).toBe(0)
    expect(run(and(1, 1))).toBe(1)
  })

  test('or', () => {
    expect(run(or(0, 0))).toBe(0)
    expect(run(or(1, 0))).toBe(1)
    expect(run(or(0, 1))).toBe(1)
    expect(run(or(1, 1))).toBe(1)
  })

  test('xor', () => {
    expect(run(xor(0, 0))).toBe(0)
    expect(run(xor(1, 0))).toBe(1)
    expect(run(xor(0, 1))).toBe(1)
    expect(run(xor(1, 1))).toBe(0)
  })

  test('not16', () => {
    var aw = word('1010101010101010')
    var rs = word('0101010101010101')
    expect(run(not16(aw))).toEqual(rs)
  })

  test('and16', () => {
    var aw = word('1111000011110000')
    var bw = word('1010101010101010')
    var rs = word('1010000010100000')
    expect(run(and16(aw, bw))).toEqual(rs)
  })
})

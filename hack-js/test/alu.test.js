/* global describe it expect */
var hack = require('..')

describe('ALU', () => {
  function set (x, y, control) {
    var arr = [x, y].concat(control.split('').map(d => d === '1'))
    return hack.alu.apply(null, arr).out
  }
  it('passes the ALU truth table', () => {
    // See figure 2.6
    expect(set(16, 32, '101010')).toEqual(0)
    expect(set(16, 32, '111111')).toEqual(1)
    expect(set(16, 32, '111010')).toEqual(-1)
    expect(set(16, 32, '001100')).toEqual(16)
    expect(set(16, 32, '110000')).toEqual(32)
    expect(set(16, 32, '001101')).toEqual(~16)
    expect(set(16, 32, '110001')).toEqual(~32)
  })
})

/* global describe it expect */
const { Symbols } = require('../src/symbols')

describe('symbol table', () => {
  it('has predefined symbols', () => {
    const table = new Symbols()
    expect(table.getAddress('SP')).toBe(0)
    expect(table.getAddress('LCL')).toBe(1)
    expect(table.getAddress('SCREEN')).toBe(16384)
  })
})

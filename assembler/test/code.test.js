/* global describe test expect */
const { Code } = require('../src/code')

describe('Assembler Code module', () => {
  test('Convert to binary string', () => {
    expect(Code.toBinary(123)).toBe('0000000001111011')
  })
  test('Encode A instruction', () => {
    expect(Code.encodeA(123)).toBe('0000000001111011')
  })

  test('Encode C instruction', () => {
    expect(Code.encodeC('A+D', 'AMD', 'JEQ')).toBe('1110000010111010')
  })

  test('Decode A instruction', () => {
    expect(Code.decodeA('0000000001111011')).toBe(123)
  })

  test('Decode C instruction', () => {
    expect(Code.decodeC('1110000010111010')).toEqual({
      comp: 'D+A', dest: 'AMD', jump: 'JEQ'
    })
  })
})

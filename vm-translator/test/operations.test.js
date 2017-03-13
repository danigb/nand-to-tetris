/* global describe test expect */
var OP = require('../src/operations')
var { Assembler } = require('../../assembler')
var { Hack } = require('../../hack')

describe('Translator operations', () => {
  test('push value', () => {
    var asm = new Assembler(OP.push(17))
    var hack = new Hack({ rom: asm.program(), ram: { 0: 32 } })
    hack.start()
    expect(hack.ram).toEqual({
      0: 33, // @SP
      32: 17 // value
    })
  })
  test('pop value into D', () => {
  })
})

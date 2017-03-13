/* global describe test expect */
var { Assembler } = require('../../assembler')
var { Hack } = require('../../hack')
var { Translator } = require('..')

function setup (source, ram) {
  const assembly = new Translator({ test: source }).translate()
  console.log(assembly)
  const program = new Assembler(assembly).program()
  return new Hack({ rom: program, ram })
}

describe('VM-Translator - Acceptance tests - Stack Arithmetic', () => {
  test('SimpleAdd', () => {
    var program = `
      push constant 7
      push constant 8
      add
    `
    var hack = setup(program, { 0: 256 })
    hack.start()
    expect(hack.ram).toEqual({ 0: 257, 256: 17 })
  })
})

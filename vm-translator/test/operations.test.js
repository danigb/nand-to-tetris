/* global describe test expect */
const OP = require('../src/operations')
const { Assembler } = require('../../assembler')
const { Hack } = require('../../hack')

const run = ({ op, ram }, debug) => {
  if (debug) {
    console.log('RUN ======== \n', op)
    console.log('BEFORE: ', ram)
  }
  const asm = new Assembler(op)
  const hack = new Hack({ rom: asm.program(), ram })
  hack.run()
  if (debug) {
    console.log('AFTER: ', hack.ram)
    console.log({ PC: hack.PC, A: hack.A, D: hack.D })
  }
  return hack
}

describe('Translator operations', () => {
  test('push value', () => {
    const hack = run({ op: OP.push(17), ram: { 0: 32 } })
    expect(hack.ram).toEqual({
      0: 33, // @SP
      32: 17 // value
    })
  })
  test('pop value into D', () => {
    const hack = run({ op: OP.popToD(), ram: { 0: 32, 31: 100 } })
    expect(hack.D).toBe(100)
    expect(hack.ram).toEqual({
      0: 31,
      31: 100
    })
  })

  test('add', () => {
    const hack = run({ op: OP.add(), ram: { 0: 32, 31: 100, 30: 50 } })
    // one element less in the stack
    expect(hack.ram[0]).toBe(31)
    expect(hack.ram[30]).toBe(150)
  })

  test('sub', () => {
    const hack = run({ op: OP.sub(), ram: { 0: 32, 31: 100, 30: 50 } })
    // one element less in the stack
    expect(hack.ram[0]).toBe(31)
    expect(hack.ram[30]).toBe(50)
  })

  test('eq value', () => {
    const hackTrue = run({
      op: OP.eq('TRUE', 'END'),
      ram: { 0: 32, 31: 100, 30: 100 }
    })
    // on element less in the stack
    expect(hackTrue.ram[0]).toBe(31)
    // last element of the stack is true (-1)
    expect(hackTrue.ram[30]).toBe(-1)

    const hackFalse = run({
      op: OP.eq('TRUE', 'END'),
      ram: { 0: 32, 31: 100, 30: 101 }
    }, true)
    // on element less in the stack
    expect(hackFalse.ram[0]).toBe(31)
    // last element of the stack is false (0)
    expect(hackFalse.ram[30]).toBe(0)
  })
})

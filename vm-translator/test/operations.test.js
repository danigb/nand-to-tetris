/* global describe test expect */
const OP = require('../src/operations')
const { Assembler } = require('../../assembler')
const { Hack } = require('../../hack')

const run = (op, x, y, debug) => {
  const ram = { 0: 32, 31: x, 30: y }
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
    const hack = run(OP.push(17))
    expect(hack.ram).toEqual({
      0: 33, // @SP
      32: 17 // value
    })
  })
  test('pop value into D', () => {
    const hack = run(OP.popToD(), 100)
    expect(hack.D).toBe(100)
    expect(hack.ram).toEqual({
      0: 31,
      31: 100
    })
  })

  test('add', () => {
    const hack = run(OP.add(), 100, 50)
    expect(hack.lastStackItem()).toBe(150)
  })

  test('sub', () => {
    const hack = run(OP.sub(), 100, 50)
    expect(hack.lastStackItem()).toBe(50)
  })

  const TRUE = -1
  const FALSE = 0
  test('eq value', () => {
    const hackTrue = run(OP.eq('TRUE', 'END'), 100, 100)
    expect(hackTrue.lastStackItem()).toBe(TRUE)
    const hackFalse = run(OP.eq('TRUE', 'END'), 100, 101)
    expect(hackFalse.lastStackItem()).toBe(FALSE)
  })
  test('gt', () => {
    const hackT = run(OP.gt('TRUE', 'END'), 100, 50)
    expect(hackT.lastStackItem()).toBe(TRUE)
    const hackF = run(OP.gt('TRUE', 'END'), 50, 100)
    expect(hackF.lastStackItem()).toBe(FALSE)
  })
})

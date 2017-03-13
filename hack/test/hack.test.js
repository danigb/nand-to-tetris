/* global describe test expect */
const { Hack, ALU } = require('..')
const { Code } = require('../../assembler/src/code')

describe('Hack', () => {
  test('execute C', () => {
    // AMD=A+D
    var hack = new Hack({ A: 2, D: 8, rom: ['1110000010111000'] }).tick()
    expect(hack.A).toBe(10)
    expect(hack.D).toBe(10)
    expect(hack.read(2)).toBe(10)
  })
  test('set D', () => {
    const rom = [Code.encodeA(100), Code.encodeC('A', 'D')]
    var hack = new Hack({ rom })
    expect(hack.registers()).toEqual({ A: 0, D: 0, PC: 0 })
    hack.tick()
    expect(hack.registers()).toEqual({ A: 100, D: 0, PC: 1 })
    hack.tick()
    expect(hack.registers()).toEqual({ A: 100, D: 100, PC: 2 })
  })
})

describe('ALU', () => {
  test('set', () => {
    var alu = new ALU()
    expect(alu.set(5, 10, 0, 0, 1, 1, 0, 0, 0)).toBe(5)
    expect(alu.set(5, 10, 1, 1, 0, 0, 0, 0, 0)).toBe(10)
  })
})

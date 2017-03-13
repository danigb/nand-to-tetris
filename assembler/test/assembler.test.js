/* global describe test expect */
const { Assembler } = require('../src/assembler')

const split = (text) => text.split('\n').map(line => line.replace(/\s+/, '')).filter(x => x)

describe('Assembler', () => {
  test('local variables starts', () => {
    const asm = new Assembler(`@local`)
    expect(asm.program()).toEqual([
      '0000000000010000'
    ])
  })
  test('numeric symbols', () => {
    const asm = new Assembler(`
      @2
      D=A
      @0
      D=D+A
    `)
    expect(asm.program()).toEqual([
      '0000000000000010',
      '1110110000010000',
      '0000000000000000',
      '1110000010010000'
    ])
  })

  test('assemble Max.asm', () => {
    const asm = new Assembler(`
       @R0
       D=M              // D = first number
       @R1
       D=D-M            // D = first number - second number
       @OUTPUT_FIRST
       D;JGT            // if D>0 (first is greater) goto output_first
       @R1
       D=M              // D = second number
       @OUTPUT_D
       0;JMP            // goto output_d
    (OUTPUT_FIRST)
       @R0
       D=M              // D = first number
    (OUTPUT_D)
       @R2
       M=D              // M[2] = D (greatest number)
    (INFINITE_LOOP)
       @INFINITE_LOOP
       0;JMP            // infinite loop
      `)
    expect(asm.program()).toEqual(split(`
      0000000000000000
      1111110000010000
      0000000000000001
      1111010011010000
      0000000000001010
      1110001100000001
      0000000000000001
      1111110000010000
      0000000000001100
      1110101010000111
      0000000000000000
      1111110000010000
      0000000000000010
      1110001100001000
      0000000000001110
      1110101010000111
      `))
  })
})

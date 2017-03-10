/* global describe test expect */
const Assembler = require('..')

describe('Assembler', () => {
  test('assemble Add.asm', () => {
    var asm = new Assembler()
    var { compiled, instructions } = asm.assemble(ADD.ASM)
    expect(instructions).toEqual(ADD.HACK)
    expect(compiled.map(i => i[1])).toEqual(['@2', 'D=A', '@3', 'D=D+A', '@0', 'M=D'])
    expect(compiled.map(i => i[2])).toEqual([2, 3, 4, 5, 6, 7])
  })

  test('assemble Max.asm', () => {
    var asm = new Assembler()
    var { compiled, instructions } = asm.assemble(MAX.ASM)
    expect(instructions).toEqual(MAX.HACK)
    expect(compiled.map(i => i[2])).toEqual([2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 13, 14, 16, 17, 19, 20])
  })
})

const ADD = {
  ASM: `
// Computes R0 = 2 + 3  (R0 refers to RAM[0])

@2
D=A
@3
D=D+A
@0
M=D
`,
  HACK: `0000000000000010
1110110000010000
0000000000000011
1110000010010000
0000000000000000
1110001100001000`.split('\n')
}

const MAX = {
  ASM: `
// Computes R2 = max(R0, R1)  (R0,R1,R2 refer to RAM[0],RAM[1],RAM[2])

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
     `,
  HACK: `0000000000000000
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
1110101010000111`.split('\n')
}

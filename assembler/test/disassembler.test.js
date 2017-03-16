/* global describe test expect */
const { Disassembler } = require('../src/disassembler')

const ROM = `0000000000000000
1111110010001000
1111110000100000
1111110000010000
0000000000000000
1111110010100000
1111010011001000
0000000000001110
1111110000000010
0000000000000000
1111110010100000
1110101010001000
0000000000010001
1110101010000111
0000000000000000
1111110010100000
1110111010001000`.split('\n')

describe('Disassembler', () => {
  test('Dissasemble a program without symbols', () => {
    var program = Disassembler.disassembly(ROM, { SP: 0, TRUE: 14, END: 17 })
    expect(program.join('\n')).toEqual(
`@SP
M=M-1
A=M
D=M
@SP
A=M-1
M=D-M
@TRUE
M;JEQ
@SP
A=M-1
M=0
@END
0;JMP
@SP
A=M-1
M=-1`)
  })
})

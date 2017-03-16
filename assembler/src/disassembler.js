const { Code, revMap } = require('./code')

class Disassembler {
  static disassembly (rom, symbols) {
    const table = symbols ? revMap(symbols) : {}
    return rom
      .map(i => typeof i === 'string' ? i : Code.toBinary(i))
      .map(instr => instr[0] === '0'
        // it's an A instruction code
        ? toA(Code.decodeA(instr), table)
        // it is a C instruction code
        : toC(Code.decodeC(instr))
      )
  }
}

function toA (address, symbols) {
  address = symbols[address] || address
  return '@' + address
}

function toC ({ comp, dest, jump }) {
  if (dest.length) dest = dest + '='
  if (jump.length) jump = ';' + jump
  return dest + comp + jump
}

module.exports = { Disassembler }

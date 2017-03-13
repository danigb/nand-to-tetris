const { Parser } = require('./parser')
const { Code } = require('./code')
const { Symbols } = require('./symbols')

// Test if a string contains a positive integer
const isNumber = symbol => /^\d+$/.test(symbol)

class Assembler {
  constructor (source, startLocalMemory = 16) {
    this.source = source
    this.startLocalMemory = startLocalMemory
  }

  symbols () {
    if (!this.table) {
      const table = this.table = new Symbols()
      const parser = new Parser(this.source)
      let address = 0
      while (parser.next()) {
        if (parser.type === 'L') table.setAddress(parser.symbol, address)
        else address++
      }
    }
    return this.table
  }

  // “Before an assembly program can be executed on a computer, it must be translated into the computer’s binary machine language. The translation task is done by a program called the assembler. The assembler takes as input a stream of assembly commands and generates as output a stream of equivalent binary program. The resulting code can be loaded as is into the computer’s memory and executed by the hardware.”
  // “A binary code file is composed of text lines. Each line is a sequence of 16 “0” and “1” ASCII characters, coding a single 16-bit machine language instruction”
  program () {
    if (!this._program) {
      const program = this._program = []
      const symbols = this.symbols()
      const parser = new Parser(this.source)
      let nextAvailable = this.startLocalMemory
      while (parser.next()) {
        switch (parser.type) {
          case 'A':
            const sym = parser.symbol
            const address = isNumber(sym) ? +sym
              : symbols.contains(sym) ? symbols.getAddress(sym)
              : symbols.setAddress(sym, nextAvailable++)
            program.push(Code.encodeA(address))
            break
          case 'C':
            program.push(Code.encodeC(parser.comp, parser.dest, parser.jump))
            break
        }
      }
    }
    return this._program
  }
}

module.exports = { Assembler }

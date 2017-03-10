const Parser = require('./parser')
const Code = require('./code')
const SymbolTable = require('./symbol-table')

const PADDING = '0000000000000000'
const pad = (num) => PADDING.slice(0, -num.length) + num
const isNumber = symbol => /^\d+$/.test(symbol)

class Assembler {
  symbols (source) {
    var symbols = new SymbolTable()
    var address = 0
    var parser = new Parser(source)
    while (parser.hasMoreCommands()) {
      const { type, symbol } = parser.next()
      if (type === 'L') symbols.addEntry(symbol, address)
      else address++
    }
    return symbols
  }
  assemble (source) {
    const generator = new CodeGenerator(this.symbols(source))
    const parser = new Parser(source)
    const compiled = []
    while (parser.hasMoreCommands()) {
      var inst = generator.instruction(parser.next())
      if (inst) compiled.push([inst, parser.line, parser.lineNumber])
    }
    const instructions = compiled.map(i => i[0])
    return { compiled, instructions }
  }
}

class CodeGenerator {
  constructor (symbols) {
    this.symbols = symbols
    // The sourceMap is an array of arrays [compiled, source]
    this.sourceMap = []
    this.nextAvailableAddress = 16
  }
  instruction (next) {
    switch (next.type) {
      case 'A':
        return isNumber(next.symbol)
          // if its a number, covert to binary
          ? this.instA(next.symbol)
          // if not, retrieve the address from the symbols table
          : this.instA(this.getAddress(next.symbol))

      case 'C':
        return this.instC(next.comp, next.dest, next.jump)
    }
  }
  getAddress (symbol) {
    if (!this.symbols.contains(symbol)) {
      // it's a local variable. Assign a new address
      this.symbols.addEntry(symbol, this.nextAvailableAddress)
      this.nextAvailableAddress++
    }
    return this.symbols.getAddress(symbol)
  }
  instA (address, line, lineNumber) {
    return pad(parseInt(address, 10).toString(2))
  }
  instC (comp, dest, jump, line, lineNumber) {
    return '111' + Code.comp(comp) + Code.dest(dest) + Code.jump(jump)
  }
}

module.exports = Assembler

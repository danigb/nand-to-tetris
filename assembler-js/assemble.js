const Parser = require('./parser')
const Code = require('./code')
const SymbolTable = require('./symbol-table')

function isNumber (symbol) {
  return /^\d+$/.test(symbol)
}

const PADDING = '0000000000000000'
function toBinaryString (number, parser) {
  const result = parseInt(number, 10).toString(2)
  return PADDING.slice(0, -result.length) + result
}

function parseLabels (source, table) {
  var address = 0
  var parser = new Parser(source)
  while (parser.hasMoreCommands()) {
    const { type, symbol } = parser.next()
    if (type === 'L') table.addEntry(symbol, address)
    else address++
  }
}

function generateCode (source, table) {
  var parser = new Parser(source)
  var output = ''
  var nextAvailableAddress = 16

  while (parser.hasMoreCommands()) {
    const { type, symbol, comp, dest, jump } = parser.next()
    let address

    switch (type) {
      case 'A':
        if (isNumber(symbol)) address = symbol
        else {
          if (!table.contains(symbol)) {
            table.addEntry(symbol, nextAvailableAddress)
            nextAvailableAddress++
          }
          address = table.getAddress(symbol)
        }
        output += toBinaryString(address) + '\n'
        break
      case 'C':
        output += '111' + Code.comp(comp) + Code.dest(dest) + Code.jump(jump) + '\n'
        break
    }
  }
  return output
}

function assemble (source) {
  const table = new SymbolTable()
  parseLabels(source, table)
  return generateCode(source, table)
}

module.exports = { assemble }

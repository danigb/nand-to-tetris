
class Symbols {
  constructor (table) {
    this.table = table || Object.assign({}, PREDEFINED)
  }
  contains (symbol) {
    return this.getAddress(symbol) !== undefined
  }
  getAddress (symbol) {
    return this.table[symbol]
  }
  setAddress (symbol, address) {
    this.table[symbol] = address
    return address
  }
}

// “Predefined symbols: A special subset of RAM addresses can be referred to by any assembly program using the following predefined symbols:”
var PREDEFINED = {
  // Stack Pointer: points to the stack top
  'SP': 0,
  // Base address of the **local** segment
  'LCL': 1,
  // Base address of the **arguments** segment
  'ARG': 2,
  // Base address of the **this** segment
  'THIS': 3,
  // Base address of the **that** segment
  'THAT': 4,
  // “Virtual registers: To simplify assembly programming, the symbols R0 to R15 are predefined to refer to RAM addresses 0 to 15, respectively.”
  'R0': 0,
  'R1': 1,
  'R2': 2,
  'R3': 3,
  'R4': 4,
  'R5': 5,
  'R6': 6,
  'R7': 7,
  'R8': 8,
  'R9': 9,
  'R10': 10,
  'R11': 11,
  'R12': 12,
  'R13': 13,
  'R14': 14,
  'R15': 15,
  // Points to the start of the screen mapped memory
  'SCREEN': 0x4000,
  // Points to the keboard mapped memory
  'KBD': 0x6000
}

module.exports = { Symbols }

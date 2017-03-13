
// # The Parser Module
// “Parser: Handles the parsing of a single .vm file, and encapsulates access to the input code. It reads VM commands, parses them, and provides convenient access to their components. In addition, it removes all white space and comments.”

const COMMANDS = {
// Arithmetic commands: perform arithmetic and logical operations on the stack.
  'add:': 'arithmetic',
  'sub:': 'arithmetic',
  'neg:': 'arithmetic',
  'eq:': 'arithmetic',
  'gt:': 'arithmetic',
  'lt:': 'arithmetic',
  'and:': 'arithmetic',
  'or:': 'arithmetic',
  'not': 'arithmetic',
// Memory access commands: transfer data between the stack and virtual memory segments.
  'pop': 'pop',
  'push': 'push',
// Program flow commands: conditional and unconditional branching operations.
  'label': 'label',
  'goto': 'goto',
  'if': 'if',
  'function': 'function',
  'return': 'return',
  'call': 'call'
}

class Parser {
  constructor (input) {
    this.lines = input.split('\n').map(line => line.trim()).filter(line => line)
  }

  next () {
    this.current = this.lines.shift().split(/\s+/)
    this.type = COMMANDS[this.current[0]]
    if (!this.type) throw Error('Unknown command: "' + this.current.join(' ') + '"')
    this.arg1 = this.current[1]
    this.arg2 = this.current[2]
  }
}

module.exports = { Parser }

// # CodeWriter
const OP = require('./operations')

const isComparator = (cmd) => cmd === 'eq' || cmd === 'gt' || cmd === 'lt'

// “Translates VM commands into Hack assembly code.”
class CodeWriter {
  constructor (output = []) {
    this.nextLabelId = 0
    this.output = output
    this.fileName = null
  }

  setFileName (fileName) {
    this.fileName = fileName
  }

  nextLabel (label) {
    if (!label) label = ''
    return `${this.fileName}.${label}.${this.nextLabelId++}`
  }

  writeArithmetic (command) {
    const operation = OP[command]
    const code = isComparator(command)
      ? operation(this.nextLabel('TRUE'), this.nextLabel('END'))
      : operation()
    this.output.push(code)
  }

  writePushPop (command, segment, index) {
    if (command === 'push') {
      if (segment === 'constant') this.output.push(OP.push(index))
    } else if (command === 'pop') {

    } else {
      throw Error('Unknown pop/push command: ' + command)
    }
  }

  close () {
    return this.output.join('\n')
  }
}

module.exports = { CodeWriter }

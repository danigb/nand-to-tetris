// # CodeWriter
const { push } = require('./operations')

// “Translates VM commands into Hack assembly code.”

class CodeWriter {
  constructor (output = []) {
    this.output = output
    this.fileName = null
  }

  setFileName (fileName) {
    this.fileName = fileName
  }

  writeArithmetic (command) {
    if (command === 'add') this.output.s
  }

  writePushPop (command, segment, index) {
    if (command === 'push') {
      if (segment === 'constant') push(index)
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

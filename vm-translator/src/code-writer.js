// # CodeWriter
const OP = require('./operations')

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
    const operation = OP[command]
    console.log(command, operation)
    this.output.push(operation())
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

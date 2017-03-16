// # Translator
const { CodeWriter } = require('./code-writer')
const { Parser } = require('./vm-parser.js')

// “The main program should construct a Parser to parse the VM input file and a CodeWriter to generate code into the corresponding output file. It should then march through the VM commands in the input file and generate assembly code for each one of them.”
class Translator {
  constructor (files) {
    this.files = files
    this.output = null
  }
  translate () {
    if (this.output) return this.output
    const writer = new CodeWriter()

    // traverse all files
    Object.keys(this.files).forEach((filename) => {
      writer.setFileName(filename)
      const parser = new Parser(this.files[filename])
      while (parser.next()) {
        switch (parser.commandType()) {
          case 'arithmetic':
            writer.writeArithmetic(parser.arg1())
            break
          case 'pop':
          case 'push':
            writer.writePushPop(parser.commandType(), parser.arg1(), parser.arg2())
            break
        }
      }
    })
    this.output = writer.close()
    return this.output
  }
}

module.exports = { Translator }

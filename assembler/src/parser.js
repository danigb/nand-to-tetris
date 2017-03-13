// “Text beginning with two slashes (//) and ending at the end of the line is considered a comment and is ignored.”
function lines (input = '') {
  return input.split('\n')
  .map(line => line.replace(/\s*\/\/.*/, '').trim())
  .filter((x) => x)
}

class Parser {
  constructor (input) {
    this.toProcess = lines(input)
  }

  /**
   * The main function of the parser is to break each assembly command into its
   * underlying components (fields and symbols)
   *
   * Encapsulates access to the input code. Reads an assembly language command,
   * parses it, and provides convenient access to the command’s components (fields
   * and symbols). In addition, removes all white space and comments.
   *
   * This is the suggested (object oriented) API
   */
  next () {
    if (this.toProcess.length === 0) return null
    const line = this.toProcess.shift()
    const len = line.length
    if (line[0] === '@') {
      this.type = 'A'
      this.symbol = line.substring(1)
    } else if (line[0] === '(' && line[len - 1] === ')') {
      this.type = 'L'
      this.symbol = line.substring(1, len - 1)
    } else {
      this.type = 'C'
      let eq = line.indexOf('=')
      this.dest = eq === -1 ? '' : line.substring(0, eq)
      let semi = line.indexOf(';')
      if (semi === -1) {
        this.comp = line.substring(eq + 1, len)
        this.jump = ''
      } else {
        this.comp = line.substring(eq + 1, semi)
        this.jump = line.substring(semi + 1, len)
      }
    }
    return this
  }
}

module.exports = { Parser }

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
class Parser {
  constructor (input) {
    this.toProcess = input.split('\n')
    .map(line => line.replace(/\s*\/\/.*/, '').trim())
    .filter((x) => x)
    this.lineNumber = 1
  }
  hasMoreCommands () {
    return this.toProcess.length > 0
  }
  next () {
    this.line = this.toProcess.shift()
    this.lineNumber++
    this.instruction = parse(this.line)
    return this.instruction
  }
}

function parse (input) {
  const instruction = parseA(input) || parseL(input) || parseC(input)
  if (!instruction) {
    throw Error('Invalid instuction: "' + input + '"')
  }
  return instruction
}

function parseA (input) {
  const match = /^@([a-zA-Z0-9$._:]+)$/.exec(input)
  if (match) return { type: 'A', symbol: match[1] }
}

function parseL (input) {
  const match = /^\((.+)\)$/.exec(input)
  if (match) return { type: 'L', symbol: match[1] }
}

function parseC (input) {
  var match = /^([AMD]+=)?([-+01ADM!&|]+)(;J[GELNM][TQEP])?$/.exec(input)
  return match ? {
    type: 'C',
    dest: (match[1] || '').slice(0, -1),
    comp: match[2],
    jump: (match[3] || '').slice(1)
  } : undefined
}

module.exports = Parser

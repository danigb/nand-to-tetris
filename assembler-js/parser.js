
function _parseA (inst) {
  const match = /^@([a-zA-Z0-9]+)$/.exec(inst)
  if (match) return { type: 'A', symbol: match[1] }
}

function _parseL (inst) {
  const match = /^\((.+)\)$/.exec(inst)
  if (match) return { type: 'L', symbol: match[1] }
}

function _parseC (inst) {
  var match = /^([AMD]+=)?([-+01ADM!&|]+)(;J[GELNM][TQEP])?$/.exec(inst)
  return match ? {
    type: 'C',
    dest: (match[1] || '').slice(0, -1),
    comp: match[2],
    jump: (match[3] || '').slice(1)
  } : undefined
}

function parse (inst) {
  const parsed = _parseA(inst) || _parseL(inst) || _parseC(inst)
  if (!parsed) throw Error('Invalid instuction: ' + inst)
  return parsed
}

function splitLines (input) {
  return input.split('\n')
  .map(line => line.trim())
  .filter((x) => x && !x.startsWith('//'))
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
class Parser {
  constructor (input) { this.lines = splitLines(input) }
  hasMoreCommands () { return this.lines.length > 0 }
  advance () { this.current = parse(this.lines.shift()); return this }
  commandType () { return this.current.type }
  symbol () { return this.current.symbol }
  dest () { return this.current.dest }
  comp () { return this.current.comp }
  jump () { return this.current.jump }
}

module.exports = { splitLines, parse, Parser }

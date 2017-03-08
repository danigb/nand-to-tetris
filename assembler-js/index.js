var { splitLines, parse } = require('./parser')
var code = require('./code')

const NONE = '0000000000000000'

function toBinary (number) {
  var result = parseInt(number, 10).toString(2)
  return NONE.slice(0, -result.length) + result
}

function toCode (inst) {
  if (inst.type === 'A') return toBinary(inst.symbol)
  else if (inst.type === 'C') return '111' + code.comp(inst.comp) + code.dest(inst.dest) + code.jump(inst.jump)
}

function assemble (source) {
  return splitLines(source).map(parse).map(toCode).join('\n') + '\n'
}

if (require.main === module) {
  try {
  } catch (e) {
    console.error(e.toString())
  }
} else {
  module.exports = { assemble }
}

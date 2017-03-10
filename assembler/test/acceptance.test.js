/* global test expect */
const { readFileSync } = require('fs')
const { join } = require('path')
const Assembler = require('..')

var SHORT = ['Add', 'Max', 'MaxL', 'Pong', 'PongL']
var LONG = ['Pong', 'PongL']

const loadData = (fileName) => {
  var input = readFileSync(join(__dirname, 'acceptance', fileName + '.asm')).toString()
  var output = readFileSync(join(__dirname, 'acceptance', fileName + '.hack')).toString()
  output = output.split('\n').slice(0, -1)
  return { input, output }
}

test('Acceptance tests', () => {
  var asm = new Assembler()
  SHORT.forEach(fileName => {
    var { input, output } = loadData(fileName)
    var { instructions } = asm.assemble(input)
    expect(instructions).toEqual(output)
  })
  LONG.forEach(fileName => {
    var { input, output } = loadData(fileName)
    var { instructions } = asm.assemble(input)
    instructions.forEach((line, num) => {
      expect(line).toBe(output[num])
    })
  })
})

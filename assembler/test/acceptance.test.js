/* global describe test expect */
const { readFileSync } = require('fs')
const { join } = require('path')
const { Assembler } = require('../src/assembler')

var SHORT = ['Add', 'Max', 'MaxL']
var LONG = ['Pong', 'PongL', 'Rect', 'RectL']

const loadData = (fileName) => {
  var input = readFileSync(join(__dirname, 'acceptance', fileName + '.asm')).toString()
  var output = readFileSync(join(__dirname, 'acceptance', fileName + '.hack')).toString()
  output = output.split('\n').slice(0, -1)
  return { input, output }
}

describe('Acceptance tests', () => {
  test('Short programs', () => {
    SHORT.forEach(fileName => {
      var { input, output } = loadData(fileName)
      expect(new Assembler(input).program()).toEqual(output)
    })
  })
  test('Long programs', () => {
    LONG.forEach(fileName => {
      var { input, output } = loadData(fileName)
      var asm = new Assembler(input)
      asm.program().forEach((line, num) => {
        expect(line).toBe(output[num])
      })
    })
  })
})

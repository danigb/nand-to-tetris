/* global test expect */
const { readFileSync } = require('fs')
const { join } = require('path')
const { assemble } = require('../assemble')

var FILENAMES = ['Add', 'Max', 'MaxL', 'Pong', 'PongL', 'Rect', 'RectL']

test('Acceptance tests', () => {
  FILENAMES.forEach(fileName => {
    var input = readFileSync(join(__dirname, 'acceptance', fileName + '.asm')).toString()
    var output = readFileSync(join(__dirname, 'acceptance', fileName + '.hack')).toString()
    var expected = output.split('\n')
    var compiled = assemble(input).split('\n')
    compiled.forEach((line, num) => {
      expect(line).toBe(expected[num])
    })
  })
})

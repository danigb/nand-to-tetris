/* global test expect */
const { readFileSync } = require('fs')
const { join } = require('path')
const { assemble } = require('..')

var FILENAMES = ['Add', 'MaxL', 'PongL', 'RectL']

test('Acceptance tests', () => {
  FILENAMES.forEach(fileName => {
    var input = readFileSync(join(__dirname, 'acceptance', fileName + '.asm')).toString()
    var output = readFileSync(join(__dirname, 'acceptance', fileName + '.hack')).toString()
    expect(assemble(input)).toBe(output)
  })
})

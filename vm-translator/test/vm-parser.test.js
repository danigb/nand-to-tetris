/* global describe test expect */
var { Parser } = require('../src/vm-parser')

describe('VM Translator parser', () => {
  test('Skip commend and empty lines', () => {
    const parser = new Parser(`
      // this is a comment

      push constant 10

      // more comments
      `)
    expect(parser.next()).toBe(true)
    expect(parser.next()).toBe(false)
  })
})

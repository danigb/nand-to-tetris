/* global describe it expect */
var { Parser } = require('../parser')

describe('Parser', () => {
  it('check if has more commands', () => {
    var parser = new Parser('@i')
    expect(parser.hasMoreCommands()).toBe(true)
    parser.advance()
    expect(parser.hasMoreCommands()).toBe(false)
  })
  it('empty lines are ignored', () => {
    var parser = new Parser('\n\n')
    expect(parser.hasMoreCommands()).toBe(false)
  })
  it('ignores comments', () => {
    var parser = new Parser('// comment 1\n// comment 2\n')
    expect(parser.hasMoreCommands()).toBe(false)
  })

  describe('parses A commands', () => {
    it('get symbol of literal A commands', () => {
      var parser = new Parser('@symbol').advance()
      expect(parser.commandType()).toBe('A')
      expect(parser.symbol()).toBe('symbol')
    })
  })
  describe('parses L commands', () => {
    it('parses labels', () => {
      var parser = new Parser('(LABEL)').advance()
      expect(parser.commandType()).toBe('L')
      expect(parser.symbol()).toBe('LABEL')
    })
  })
  describe('parses C commands', () => {
    it('Parses a comp C command', () => {
      var parser = new Parser('D+A').advance()
      expect(parser.commandType()).toBe('C')
      expect(parser.dest()).toBe('')
      expect(parser.comp()).toBe('D+A')
      expect(parser.jump()).toBe('')
    })
    it('Parses a dest=comp C command', () => {
      var parser = new Parser('AMD=D&A').advance()
      expect(parser.commandType()).toBe('C')
      expect(parser.dest()).toBe('AMD')
      expect(parser.comp()).toBe('D&A')
      expect(parser.jump()).toBe('')
    })
    it('Parses a dest=comp;jump C command', () => {
      var parser = new Parser('MD=D|A;JGT').advance()
      expect(parser.commandType()).toBe('C')
      expect(parser.dest()).toBe('MD')
      expect(parser.comp()).toBe('D|A')
      expect(parser.jump()).toBe('JGT')
    })
  })
})

/* global describe it expect */
var Parser = require('../src/parser')

describe('Parser', () => {
  it('check if has more commands', () => {
    var parser = new Parser('@i')
    expect(parser.hasMoreCommands()).toBe(true)
    parser.next()
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
  it('ignores comments after instructions', () => {
    var parser = new Parser('D=M    // D = first number')
    var inst = parser.next()
    expect(inst.type).toBe('C')
  })
  it('throws error when invalid instruction', () => {
    var parser = new Parser('invalid')
    expect(() => parser.next()).toThrow('Invalid')
  })

  describe('parses A commands', () => {
    it('get symbol of literal A commands', () => {
      var parser = new Parser('@symbol:_$')
      var inst = parser.next()
      expect(inst).toEqual({ type: 'A', symbol: 'symbol:_$' })
    })
  })
  describe('parses L commands', () => {
    it('parses labels', () => {
      var parser = new Parser('(LABEL)')
      var inst = parser.next()
      expect(inst).toEqual({ type: 'L', symbol: 'LABEL' })
    })
  })
  describe('parses C commands', () => {
    it('Parses a comp C command', () => {
      var parser = new Parser('D+A')
      var inst = parser.next()
      expect(inst).toEqual({ type: 'C', dest: '', comp: 'D+A', jump: '' })
    })
    it('Parses a dest=comp C command', () => {
      var parser = new Parser('AMD=D&A')
      var inst = parser.next()
      expect(inst).toEqual({ type: 'C', dest: 'AMD', comp: 'D&A', jump: '' })
    })
    it('Parses a dest=comp;jump C command', () => {
      var parser = new Parser('MD=D|A;JGT')
      var inst = parser.next()
      expect(inst).toEqual({ type: 'C', dest: 'MD', comp: 'D|A', jump: 'JGT' })
    })
  })
})

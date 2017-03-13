/* global describe it expect */
const { Parser } = require('../src/parser')

describe('Parser', () => {
  it('return null if no more lines to process', () => {
    const parser = new Parser('@i')
    expect(parser.next()).not.toBe(null)
    expect(parser.next()).toBe(null)
  })
  it('empty lines are ignored', () => {
    const parser = new Parser('\n\n')
    expect(parser.next()).toBe(null)
  })
  it('ignores comments', () => {
    const parser = new Parser('// comment 1\n// comment 2\n')
    expect(parser.next()).toBe(null)
  })
  it('ignores comments after instructions', () => {
    const parser = new Parser('D=M    // D = first number')
    expect(parser.next().type).toBe('C')
  })

  describe('parses A commands', () => {
    it('get symbol of literal A commands', () => {
      const parser = new Parser('@symbol:_$').next()
      expect(parser.type).toBe('A')
      expect(parser.symbol).toBe('symbol:_$')
    })
  })
  describe('parses L commands', () => {
    it('parses labels', () => {
      const parser = new Parser('(LABEL)').next()
      expect(parser.type).toBe('L')
      expect(parser.symbol).toBe('LABEL')
    })
  })
  describe('parses C commands', () => {
    it('Parses a comp C command', () => {
      const parser = new Parser('D+A').next()
      expect(parser.type).toBe('C')
      expect(parser.comp).toBe('D+A')
      expect(parser.dest).toBe('')
      expect(parser.jump).toBe('')
    })
    it('Parses D=A command', () => {
      const parser = new Parser('D=A').next()
      expect(parser.type).toBe('C')
      expect(parser.dest).toBe('D')
      expect(parser.comp).toBe('A')
    })
    it('Parses a dest=comp C command', () => {
      const parser = new Parser('AMD=D&A').next()
      expect(parser.type).toBe('C')
      expect(parser.comp).toBe('D&A')
      expect(parser.dest).toBe('AMD')
      expect(parser.jump).toBe('')
    })
    it('Parses a dest=comp;jump C command', () => {
      const parser = new Parser('MD=D|A;JGT').next()
      expect(parser.type).toBe('C')
      expect(parser.comp).toBe('D|A')
      expect(parser.dest).toBe('MD')
      expect(parser.jump).toBe('JGT')
    })
  })
})

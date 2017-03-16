/* global describe test expect */
var { Assembler } = require('../../assembler')
var { Hack } = require('../../hack')
var { Translator } = require('..')
const { readFileSync } = require('fs')
const { join } = require('path')

function readSource (name) {
  const path = join(__dirname, 'acceptance/', name, name + '.vm')
  return readFileSync(path).toString()
}

function run (source, ram) {
  const assembly = new Translator({ test: source }).translate()
  const program = new Assembler(assembly).program()
  const hack = new Hack({ rom: program, ram })
  return hack.run()
}

function checkRam (hack, ram) {
  Object.keys(ram).forEach((address) => {
    expect(hack.ram[address]).toBe(ram[address])
  })
}

const ADDRESS = /^\s+RAM\[(\d+)]/
function readOutput (name) {
  const path = join(__dirname, 'acceptance/', name, name + '.cmp')
  const [addresses, values] = readFileSync(path).toString().split('\n')
    .map(line => line.split('|').filter(l => l))

  return addresses.reduce((ram, address, i) => {
    address = ADDRESS.exec(address)[1]
    ram[address] = +values[i]
    return ram
  }, {})
}

const TESTS = [
  // “Stage I: Stack Arithmetic”
  'SimpleAdd', 'StackTest'
]

describe('VM-Translator - Acceptance tests', () => {
  TESTS.forEach((name) => {
    test(name, () => {
      try {
        var program = readSource(name)
        var expectedRam = readOutput(name)
        var hack = run(program, { 0: 256 })
        checkRam(hack, expectedRam)
      } catch (e) {
        console.log(name + ' ============\n', program)
        throw e
      }
    })
  })
})

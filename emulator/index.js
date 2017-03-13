import { h, app } from 'hyperapp'
const { Assembler } = require('../assembler')
import { Hack } from '../hack'
var classNames = require('classnames')

const PAD = '0000000000000000'
const pad = (num) => PAD.slice(0, 16 - num.length) + num
const toBinary = (i) => pad(i.toString(2))

const EXAMPLE = `
// This file is part of www.nand2tetris.org
// and the book 'The Elements of Computing Systems'
// by Nisan and Schocken, MIT Press.
// File name: projects/06/add/Add.asm

// Computes R0 = 2 + 3  (R0 refers to RAM[0])

@2
D=A
@3
D=D+A
@0
M=D
`

const log = (name, value, extra) => { console.log(name, value, extra || ''); return value }

const emptyRAM = (size) => {
  var ram = {}
  for (var i = 0; i < size; i++) ram[i] = 0
  return ram
}

const compile = (source, ram) => {
  const asm = new Assembler(source)
  const program = asm.program()
  const symbols = asm.symbols()
  const hack = new Hack({ rom: program, ram: ram })
  return { source, program, ram, symbols, hack }
}

const init = (source) => compile(source, emptyRAM(32))

const actions = {
  compile: (model) => compile(model.source, model.ram),
  source: (model, source) => ({ source }),
  tick: (model) => model.hack.tick(),
  updateCPU: (model, [reg, value]) => {
    model.hack[reg] = value
    return model
  },
  updateRAM: (model, { address, value }) => {
    model.hack.write(address, value)
    return model
  }
}

const Register = ({ name, value, update }) => (
  <div>
    {name}:
    <input type='number' value={value} onchange={(e) => update([name, +e.target.value])} />
  </div>
)
const CPU = ({ hack, tick, update }) => (
  <div>
    <h2>CPU</h2>
    <Register name='PC' value={hack.PC} update={update} />
    <Register name='A' value={hack.A} update={update} />
    <Register name='D' value={hack.D} update={update} />
    <a href='#!' onclick={(e) => tick()}>Tick!</a>
  </div>
)
const Memory = ({ address, value, update }) => (
  <div>
    {address}:
    {toBinary(value)}
    <input type='number' value={value} onchange={(e) =>
      update({ address, value: +e.target.value })} />
  </div>
)
const RAM = ({ hack, update }) => (
  <div class='RAM'>
    <h2>RAM</h2>
    {hack.dump().map(({ address, value }) =>
      (<Memory address={address} value={value} update={update} />)
    )}
  </div>
)

const ROM = ({ hack, program, symbols }) => (
  <div class='ROM'>
    <h2>ROM</h2>
    {program.map((instr, pos) => (
      <div class={classNames({ current: hack.PC === pos, inst: true })}>
        {pos}:&nbsp;
        {instr}
      </div>
    ))}
  </div>
)
const Computer = ({ program, hack, actions }) => (
  <div>
    <CPU hack={hack} tick={actions.tick} update={actions.updateCPU} />
    <ROM hack={hack} program={program} />
    <RAM hack={hack} update={actions.updateRAM} />
  </div>
)

const view = (model, actions) => (
  <div id='app'>
    <h1>CPU Emulator</h1>
    <h2>Code</h2>
    <textarea onchange={(e) => actions.source(e.target.value)}>{model.source}</textarea>
    <a href='#!' onclick={(e) => actions.compile()}>Compile</a>
    <Computer program={model.program} hack={model.hack} actions={actions} />
  </div>
)

app({
  model: init(EXAMPLE), view, actions
})

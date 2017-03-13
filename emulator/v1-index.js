import { h, app } from 'hyperapp'
const Assembler = require('../assembler')
import { Computer } from '../hack'
var classNames = require('classnames')


const EXAMPLE = `// This file is part of www.nand2tetris.org
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

const compile = (source) => {
  const asm = new Assembler()
  const { compiled, instructions } = log('compiled', asm.assemble(source))
  const hack = new Computer(instructions, 32)
  return { source, instructions, compiled, hack }
}

const init = (source) => compile(source)

const actions = {
  compile: (state) => compile(state.source),
  source: (state, source) => ({ source }),
  tick: (state) => { state.hack.cpu.tick(); return state }
}

const viewROM = PC => (inst, pos) => (
  <div class={classNames({ current: PC === pos, inst: true })}>{pos}: {inst[0]} {inst[1]}</div>
)
const viewRAM = ([address, value]) => <div>{address}: {value}</div>
const viewDebug = (compiled, cpu, actions) => (
  <div>
    <h2>CPU</h2>
    <div>PC: {cpu.PC}</div>
    <div>A: {cpu.A}</div>
    <div>D: {cpu.D}</div>
    <a href='#!' onclick={(e) => actions.tick()}>Tick!</a>
    <h2>ROM</h2>
    <div class='ROM'>{compiled.map(viewROM(cpu.PC))}</div>
    <h2>RAM</h2>
    <div class='RAM'>{cpu.ram.dump().map(viewRAM)}</div>
  </div>
)

const view = (model, actions) => (
  <div id='app'>
    <h1>CPU Emulator</h1>
    <h2>Code</h2>
    <textarea onchange={(e) => actions.source(e.target.value)}>{model.source}</textarea>
    <a href='#!' onclick={(e) => actions.compile()}>Compile</a>
    { viewDebug(model.compiled, model.hack.cpu, actions) }
  </div>
)


const subscriptions = [
  (state, actions) => window.fetch('Add.asm')
    .then(res => res.getText())
    .then(res => console.log('Load!', res))
]

const MAX = `
// This file is part of www.nand2tetris.org
// and the book "The Elements of Computing Systems"
// by Nisan and Schocken, MIT Press.
// File name: projects/06/max/Max.asm

// Computes R2 = max(R0, R1)  (R0,R1,R2 refer to RAM[0],RAM[1],RAM[2])

   @R0
   D=M              // D = first number
   @R1
   D=D-M            // D = first number - second number
   @OUTPUT_FIRST
   D;JGT            // if D>0 (first is greater) goto output_first
   @R1
   D=M              // D = second number
   @OUTPUT_D
   0;JMP            // goto output_d
(OUTPUT_FIRST)
   @R0
   D=M              // D = first number
(OUTPUT_D)
   @R2
   M=D              // M[2] = D (greatest number)
(INFINITE_LOOP)
   @INFINITE_LOOP
   0;JMP            // infinite loop
`

app({
  model: init(MAX), view, actions
})

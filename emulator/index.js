import { h, app } from 'hyperapp'
const { assemble } = require('../assembler/src/assemble')

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

const actions = {
  compile: (state) => ({ compiled: assemble(state.source) })
}

const init = () => ({
  source: EXAMPLE
})

const viewCompilation = (compiled) => (
  <div>
    <h3>Compiled</h3>
    <pre>{compiled}</pre>
  </div>)

const view = (model, actions) => (
  <div id='app'>
    <h1>CPU Emulator</h1>
    <h2>Code</h2>
    <textarea onchange={(e) => actions.source(e.target.value)}>{model.source}</textarea>
    <a href='#!' onclick={(e) => actions.compile()}>Compile</a>
    { viewCompilation(model.compiled) }
  </div>
)
app({
  model: init(), view, actions
})

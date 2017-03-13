import { h, app } from 'hyperapp'
const Assembler = require('../assembler')
import { Computer } from '../hack'
var classNames = require('classnames')

const PAD = '0000000000000000'
const pad = (num) => PAD.slice(0, 16 - num.length) + num
const toBinary = (i) => pad(i.toString(2))

const emptyProgram = (size) => {
  const lines = []
  for (var i = 0; i < size; i++) lines.push('')
  return lines
}

const init = () => {
  const program = emptyProgram(32)
  const computer = new Computer([], 32)
  return { program, computer }
}
const model = init()

const Input = ({ label, value, update, convert = toBinary }) => (
  <div className='BinaryInput'>
    <label>{label}</label>
    <span>{convert(value)}</span>
    <input type='text' value={value} onchange={(e) => update(+e.target.value)} />
    <a href='#!' onclick={(e) => update(value - 1)}>-</a>
    <a href='#!' onclick={(e) => update(value + 1)}>+</a>
  </div>
)

const CPU = ({ cpu, update }) => (
  <div class='CPU'>
    <div class='register'>
      <Input label='PC' value={cpu.PC} update={(value) => update(['PC', value])} />
      <Input label='A' value={cpu.A} update={(value) => update(['A', value])} />
      <Input label='D' value={cpu.D} update={(value) => update(['D', value])} />
    </div>
  </div>
)

const actions = {
  updateCPU: (model, [ key, value ]) => {
    if (value >= 0) model.computer.cpu[key] = value
    return model
  }
}

const view = (model, actions) => (
  <div>
    <CPU cpu={model.computer.cpu} update={actions.updateCPU} />
  </div>
)

app({ model, view, actions })

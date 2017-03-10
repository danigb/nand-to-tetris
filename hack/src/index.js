const { ALU, CPU } = require('./cpu')
const { ROM, RAM, Memory } = require('./memory')

// “Computer: The topmost Computer chip can be composed from the chips mentioned earlier, using figure 5.10 as a blueprint.”
class Computer {
  constructor (program = [], initRam = 0) {
    this.alu = new ALU()
    this.rom = new ROM(program)
    this.ram = new RAM(initRam)
    this.memory = new Memory(this.ram, this.screen, this.keyboard)
    this.cpu = new CPU(this.alu, this.rom, this.memory)
  }
}

module.exports = { Computer }

// ## Memory

// “Memory: Composed from three chips: RAM16K, Screen, and Keyboard. The Screen and the Keyboard are available as built-in chips and there is no need to build them. Although the RAM16K chip was built in the project in chapter 3, we recommend using its built-in version, as it provides a debugging-friendly GUI.”

// “The Hack programmer is aware of two distinct address spaces: an instruction memory and a data memory. Both memories are 16-bit wide and have a 15-bit address space, meaning that the maximum addressable size of each memory is 32K 16-bit words.”
class RAM {
  constructor (init) {
    this.heap = {}
    for (var i = 0; i < init; i++) this.heap[i] = 0
  }
  read (address) {
    return this.heap[address] || 0
  }
  write (address, value) {
    this.heap[address] = value
  }
  dump () {
    return Object.keys(this.heap).map(k => [k, this.heap[k]])
  }
}

class ROM {
  constructor (program) {
    console.log('PROGRAM', program)
    this.instructions = program.map(bits => parseInt(bits, 2))
  }

  read (address) {
    var inst = this.instructions[address]
    if (inst === undefined) {
      throw new Error('Out of bounds ROM access: ' + address)
    }
    return inst
  }
}

const RAM_MASK = 1 << 14
const SCREEN_MASK = 1 << 13

class Memory {
  constructor (ram, screen, keyboard) {
    this.ram = ram
    this.screen = screen
    this.keyboard = keyboard
  }

  read (address) {
    if (~address & RAM_MASK) {
      return this.ram.read(address)
    } else if (~address & SCREEN_MASK) {
      // Equivalent to addr - RAM_SIZE
      return this.screen.read(address & (RAM_MASK - 1))
    } else {
      return this.keyboard.read(address & (SCREEN_MASK - 1))
    }
  }

  write (address, value) {
    if (~address & RAM_MASK) {
      return this.ram.write(address, value)
    } else if (~address & SCREEN_MASK) {
      return this.screen.write(address & (RAM_MASK - 1), value)
    } else {
      return this.keyboard.write(address & (SCREEN_MASK - 1), value)
    }
  }
}

module.exports = { ROM, RAM, Memory }

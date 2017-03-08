
// ## ALU
//
// “The Hack ALU computes a fixed set of functions out = fi(x, y) where x and y
// are the chip’s two 16-bit inputs, out is the chip’s 16-bit output, and fi is
// an arithmetic or logical function selected from a fixed repertoire of
// eighteen possible functions. We instruct the ALU which function to compute by
// setting six input bits, called control bits, to selected binary values.”
//
// **Specification**
//
// - Inputs
//   - `x[16]`, `y[16]`: two 16-bit data inputs
//   - `zx`: zero the x input
//   - `nx`: negate the x input
//   - `zy`: zero the y input
//   - `ny`: negate the y input
//   - `f`: function code (0 = AND, 1 = ADD)
//   - `no`: negate the output
// - Ouputs
//   - `out[16]`: 16-bit output
//   - `zr`: true if out = 0
//   - `ng`: true if out < 0
class ALU {
  constructor () {
    this.out = 0
    this.zr = 0
    this.ng = 0
  }

  set (x, y, zx, nx, zy, ny, f, no) {
    if (zx) x = 0
    if (nx) x = ~x
    if (zy) y = 0
    if (ny) y = ~y
    this.out = f ? x + y : x & y
    if (no) this.out = ~this.out
    this.zr = this.out === 0
    this.ng = this.out < 0
    return this
  }
}

// ## Memory

// “The Hack programmer is aware of two distinct address spaces: an instruction memory and a data memory. Both memories are 16-bit wide and have a 15-bit address space, meaning that the maximum addressable size of each memory is 32K 16-bit words.”
class RAM {
  constructor () {
    this.heap = {}
  }
  read (address) {
    return this.heap[address] || 0
  }
  write (address, value) {
    this.heap[address] = value
  }
}

class ROM {
  constructor (instructions) {

  }
  read (address) {

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

// ## CPU

// “There are two types of instructions, A and C. The 16nth bit value determines which one is”
const I_MASK = 1 << 15

// “The Hack programmer is aware of two 16-bit registers called D and A. These registers can be manipulated explicitly by arithmetic and logical instructions like A=D-1 or D=!A (where “!” means a 16-bit Not operation). While D is used solely to store data values, A doubles as both a data register and an address register.”
class CPU {
  constructor (alu, rom, memory) {
    this.alu = alu
    this.rom = rom
    this.memory = memory
    this.PC = 0
    this.A = 0
    this.D = 0
  }

  tick () {
    const inst = this.rom.read(this.PC)
    const isTypeA = inst & I_MASK
    this.PC = isTypeA ? this.executeA(inst) : this.executeC(inst)
  }

  // “The A-instruction is used for three different purposes. First, it provides the only way to enter a constant into the computer under program control. Second, it sets the stage for a subsequent C-instruction designed to manipulate a certain data memory location, by first setting A to the address of that location. Third, it sets the stage for a subsequent C-instruction that specifies a jump, by first loading the address of the jump destination to the A register. These uses are demonstrated in figure 4.2.
  executeA (inst) {
    this.A = inst
    return this.PC + 1
  }

  // “The C-instruction is the programming workhorse of the Hack platform—the instruction that gets almost everything done. The instruction code is a specification that answers three questions: (a) what to compute, (b) where to store the computed value, and (c) what to do next?”
  executeC (inst) {
    // **The Computation Specification**
    // “The Hack ALU is designed to compute a fixed set of functions on the D, A, and M registers (where M stands for Memory[A]). The computed function is specified by the a-bit and the six c-bits comprising the instruction’s comp field. This 7-bit pattern can potentially code 128 different functions, of which only the 28 listed in figure 4.3 are documented in the language specification.”
    /* perform computation */
    var x = this.D
    var y = inst & A_MASK ? this.memory.read(this.A) : this.A
    this.alu.set(x, y, inst & C1_MASK, inst & C2_MASK, inst & C3_MASK, inst & C4_MASK, inst & C5_MASK, inst & C6_MASK)

    // **The Destination Specification**
    // “The value computed by the comp part of the C-instruction can be stored in several destinations, as specified by the instruction’s 3-bit dest part”
    /* store output */
    if (inst & D3_MASK) this.memory.write(this.A, this.alu.out)
    if (inst & D2_MASK) this.D = this.alu.out
    if (inst & D1_MASK) this.A = this.alu.out

    // **The Jump Specification**
    // “The jump field of the C-instruction tells the computer what to do next. There are two possibilities: The computer should either fetch and execute the next instruction in the program, which is the default, or it should fetch and execute an instruction located elsewhere in the program. In the latter case, we assume that the A register has been previously set to the address to which we have to jump.”
    // “Whether or not a jump should actually materialize depends on the three j-bits of the jump field and on the ALU output value”
    /* calculate the next PC */
    var shouldJump = inst & J1_MASK && this.alu.ng ||
      inst & J2_MASK && this.alu.zr ||
      inst & J3_MASK && (!this.alu.zr && !this.alu.ng)
    return shouldJump ? this.cpu.A : this.cpu.PC + 1
  }
}
// “The leftmost bit is the C-instruction code, which is 1. The next two bits are not used. The remaining bits form three fields that correspond to the three parts of the instruction’s symbolic representation. ”
const A_MASK = 1 << 12 // 0 = A, 1 = memory[A]
const C1_MASK = 1 << 11 // alu's zx
const C2_MASK = 1 << 10 // alu's nx
const C3_MASK = 1 << 9 // alu's zy
const C4_MASK = 1 << 8 // alu's ny
const C5_MASK = 1 << 7 // alu's f
const C6_MASK = 1 << 6 // alu's no
// C instruction destination bits
var D1_MASK = 1 << 5
var D2_MASK = 1 << 4
var D3_MASK = 1 << 3
// C instruction jump bits
var J1_MASK = 1 << 2
var J2_MASK = 1 << 1
var J3_MASK = 1 << 0

module.exports = { ALU, RAM, ROM, Memory, CPU }

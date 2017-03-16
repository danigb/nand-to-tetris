
// “There are two types of instructions, A and C. The 16nth bit value determines which one is”
const I_MASK = 1 << 15

// “The Hack programmer is aware of two 16-bit registers called D and A. These registers can be manipulated explicitly by arithmetic and logical instructions like A=D-1 or D=!A (where “!” means a 16-bit Not operation). While D is used solely to store data values, A doubles as both a data register and an address register.”
class Hack {
  constructor (state) {
    this.PC = state.PC || 0
    this.D = state.D || 0
    this.A = state.A || 0
    this.rom = (state.rom || []).map(bits => typeof bits === 'number' ? bits : parseInt(bits, 2))
    this.ram = state.ram || {}
    this.alu = new ALU()
  }

  tick () {
    const inst = this.rom[this.PC]
    if (inst === undefined) throw Error('PC Overflow')
    const isTypeA = !(inst & I_MASK)
    this.PC = isTypeA ? execA(this, inst) : execC(this, inst)
    return this
  }

  run () {
    while (this.rom[this.PC] !== undefined) this.tick()
    return this
  }

  read (address) {
    return this.ram[address]
  }

  write (address, value) {
    this.ram[address] = value
    return this
  }

  dump () {
    return Object.keys(this.ram).map((address) => ({ address, value: this.ram[address] }))
  }

  registers () {
    return { PC: this.PC, A: this.A, D: this.D }
  }

  lastStackItem () {
    return this.ram[this.ram[0] - 1]
  }
}

// “The A-instruction is used for three different purposes. First, it provides the only way to enter a constant into the computer under program control. Second, it sets the stage for a subsequent C-instruction designed to manipulate a certain data memory location, by first setting A to the address of that location. Third, it sets the stage for a subsequent C-instruction that specifies a jump, by first loading the address of the jump destination to the A register. These uses are demonstrated in figure 4.2.
function execA (hack, inst) {
  hack.A = inst
  return hack.PC + 1
}

// “The C-instruction is the programming workhorse of the Hack platform—the instruction that gets almost everything done. The instruction code is a specification that answers three questions: (a) what to compute, (b) where to store the computed value, and (c) what to do next?”
function execC (hack, inst) {
  // **The Computation Specification**
  // “The Hack ALU is designed to compute a fixed set of functions on the D, A, and M registers (where M stands for Memory[A]). The computed function is specified by the a-bit and the six c-bits comprising the instruction’s comp field. This 7-bit pattern can potentially code 128 different functions, of which only the 28 listed in figure 4.3 are documented in the language specification.”
  /* perform computation */

  const out = hack.alu.set(
    hack.D, // x: 16-bit data input
    inst & A_MASK ? hack.read(hack.A) : hack.A, // y: 16-bit data input
    inst & C1_MASK, // `zx`: zero the x input
    inst & C2_MASK, // `nx`: negate the x input
    inst & C3_MASK, // `zy`: zero the y input
    inst & C4_MASK, // `ny`: negate the y input
    inst & C5_MASK, // `f`: function code (0 = AND, 1 = ADD)
    inst & C6_MASK // `no`: negate the output
  )

  // **The Destination Specification**
  // “The value computed by the comp part of the C-instruction can be stored in several destinations, as specified by the instruction’s 3-bit dest part”
  /* store output */
  if (inst & D3_MASK) hack.write(hack.A, out)
  if (inst & D2_MASK) hack.D = out
  if (inst & D1_MASK) hack.A = out

  // **The Jump Specification**
  // “The jump field of the C-instruction tells the computer what to do next. There are two possibilities: The computer should either fetch and execute the next instruction in the program, which is the default, or it should fetch and execute an instruction located elsewhere in the program. In the latter case, we assume that the A register has been previously set to the address to which we have to jump.”
  // “Whether or not a jump should actually materialize depends on the three j-bits of the jump field and on the ALU output value”
  /* calculate the next PC */
  const shouldJump = inst & J1_MASK && hack.alu.ng ||
    inst & J2_MASK && hack.alu.zr ||
    inst & J3_MASK && (!hack.alu.zr && !hack.alu.ng)

  return shouldJump ? hack.A : hack.PC + 1
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
const D1_MASK = 1 << 5
const D2_MASK = 1 << 4
const D3_MASK = 1 << 3
// C instruction jump bits
const J1_MASK = 1 << 2
const J2_MASK = 1 << 1
const J3_MASK = 1 << 0

// ## ALU
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
//

// “The Hack ALU computes a fixed set of functions out = fi(x, y) where x and y
// are the chip’s two 16-bit inputs, out is the chip’s 16-bit output, and fi is
// an arithmetic or logical function selected from a fixed repertoire of
// eighteen possible functions. We instruct the ALU which function to compute by
// setting six input bits, called control bits, to selected binary values.”
class ALU {
  constructor () {
    this.set(0, 0, 0, 0, 0, 0, 0, 0)
  }

  set (x, y, zx, nx, zy, ny, f, no) {
    this.x = x
    this.y = y
    this.zx = zx
    this.nx = nx
    this.zy = zy
    this.ny = ny
    this.f = f
    this.no = no
    if (this.zx) this.x = 0
    if (this.nx) this.x = ~this.x
    if (this.zy) this.y = 0
    if (this.ny) this.y = ~this.y
    this.out = this.f ? this.x + this.y : this.x & this.y
    if (this.no) this.out = ~this.out
    this.zr = this.out === 0
    this.ng = this.out < 0
    return this.out
  }
}

module.exports = { Hack, ALU }

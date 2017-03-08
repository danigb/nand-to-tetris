# Hack

This is a port of the Hack computer to javascript as described in the excellent book []()

## 0. Overview

“The Hack computer is a von Neumann platform. It is a 16-bit machine, consisting of a CPU, two separate memory modules serving as instruction memory and data memory, and two memory-mapped I/O devices: a screen and a keyboard.”

## 1. The Arithmetic Logic Unit (ALU)

“The Hack ALU computes a fixed set of functions out = fi(x, y) where x and y are the chip’s two 16-bit inputs, out is the chip’s 16-bit output, and fi is an arithmetic or logical function selected from a fixed repertoire of eighteen possible functions. We instruct the ALU which function to compute by setting six input bits, called control bits, to selected binary values.”

#### Specification

- Inputs
  - `x[16]`, `y[16]`: two 16-bit data inputs
  - `zx`: zero the x input
  - `nx`: negate the x input
  - `zy`: zero the y input
  - `ny`: negate the y input
  - `f`: function code (0 = AND, 1 = ADD)
  - `no`: negate the output
- Ouputs
  - `out[16]`: 16-bit output
  - `zr`: true if out = 0
  - `ng`: true if out < 0


```js
function alu (x, y, zx, nx, zy, ny, f, no) {
  if (zx) x = 0
  if (nx) x = ~x
  if (zy) y = 0
  if (ny) y = ~y
  var out = f ? x + y : x & y
  if (no) out = ~out
  var zr = out === 0
  var ng = out < 0
  return { out, zr, ng }
}
```

## 2. Memory

“The term memory refers loosely to the collection of hardware devices that store data and instructions in a computer. From the programmer’s standpoint, all memories have the same structure: A continuous array of cells of some fixed width, also called words or locations, each having a unique address. Hence, an individual word (representing either a data item or an instruction) is specified by supplying its address.”

#### Memory Address Spaces

“The Hack programmer is aware of two distinct address spaces: an instruction memory and a data memory. Both memories are 16-bit wide and have a 15-bit address space, meaning that the maximum addressable size of each memory is 32K 16-bit words.”


```js
// Create a RAM (data memory)
function RAM () {
  var ram = {}
  return {
    read: function (address) { return ram[address] || 0 },
    write: function (address, value) { ram[address] = value }
  }
}
```

#### Input/Output Handling

“The Hack platform can be connected to two peripheral devices: a screen and a keyboard. Both devices interact with the computer platform through memory maps. ”


```js
var RAM_MASK = 1 << 14
var SCREEN_MASK = 1 << 13
function Memory (ram, screen, keyboard) {
  return {
    read: function (address) {
      if (~address & RAM_MASK) return ram.read(address)
      else if (~address & SCREEN_MASK) return screen.read(address & (RAM_MASK - 1))
      else return keyboard.read(address & (SCREEN_MASK - 1))
    },
    write: function (address, value) {
      if (~address & RAM_MASK) return ram.write(address, value)
      else if (~address & SCREEN_MASK) return screen.write(address & (RAM_MASK - 1), value)
      else return keyboard.write(address & (SCREEN_MASK - 1), value)
    }
  }
}
```

### 3.2 Registers

“The Hack programmer is aware of two 16-bit registers called D and A. These registers can be manipulated explicitly by arithmetic and logical instructions like A=D-1 or D=!A (where “!” means a 16-bit Not operation). While D is used solely to store data values, A doubles as both a data register and an address register.”

```js
function CPU (rom, ram) {
  var PC = 0 // program counter
  var A = 0 // A register
  var D = 0 // D register
  return { rom, ram, PC, A, D }
}
```



### Instructions

There are two types of instructions, A and C. The 16nth bit value determines which one is:

```js
var INST_TYPE_MASK = 1 << 15
function isTypeC (instruction) {
  return instruction & INST_TYPE_MASK
}
```

The `execute` function will delegate depending of the instruction type:

```js
function execute(cpu, instruction) {
  if (isTypeC(instruction)) executeC(cpu, instruction)
  else executeA(cpu, instruction)
}
```

### 3.3 The A-Instruction

“The A-instruction is used to set the A register to a 15-bit value”

“The A-instruction is used for three different purposes. First, it provides the only way to enter a constant into the computer under program control. Second, it sets the stage for a subsequent C-instruction designed to manipulate a certain data memory location, by first setting A to the address of that location. Third, it sets the stage for a subsequent C-instruction that specifies a jump, by first loading the address of the jump destination to the A register. These uses are demonstrated in figure 4.2.

```js
function executeA (cpu, instruction) {
  cpu.A = instruction
  cpu.PC++
}
```

### 3.4 The C Instruction

“The C-instruction is the programming workhorse of the Hack platform—the instruction that gets almost everything done. The instruction code is a specification that answers three questions: (a) what to compute, (b) where to store the computed value, and (c) what to do next?”

“The leftmost bit is the C-instruction code, which is 1. The next two bits are not used. The remaining bits form three fields that correspond to the three parts of the instruction’s symbolic representation. ”


**The Computation Specification**

“The Hack ALU is designed to compute a fixed set of functions on the D, A, and M registers (where M stands for Memory[A]). The computed function is specified by the a-bit and the six c-bits comprising the instruction’s comp field. This 7-bit pattern can potentially code 128 different functions, of which only the 28 listed in figure 4.3 are documented in the language specification.”

```js
// C instruction computation bits
var A_MASK = 1 << 12 // 0 = A, 1 = memory[A]
var C1_MASK = 1 << 11 // alu's zx
var C2_MASK = 1 << 10 // alu's nx
var C3_MASK = 1 << 9 // alu's zy
var C4_MASK = 1 << 8 // alu's ny
var C5_MASK = 1 << 7 // alu's f
var C6_MASK = 1 << 6 // alu's no

// compute a C instruction
function compute (cpu, inst) {
  var x = cpu.D
  var y = inst & A_MASK ? cpu.memory.read(cpu.A) : cpu.A
  return alu(x, y, inst & C1_MASK, inst & C2_MASK, inst & C3_MASK, inst & C4_MASK, inst & C5_MASK, inst & C6_MASK)
}
```


**The Destination Specification**

“The value computed by the comp part of the C-instruction can be stored in several destinations, as specified by the instruction’s 3-bit dest part”

```js
// C instruction destination bits
var D1_MASK = 1 << 5
var D2_MASK = 1 << 4
var D3_MASK = 1 << 3

// store the result of the C instruction computation
function store (cpu, alu, inst) {
  if (inst & D3_MASK) cpu.memory.write(cpu.A, alu.out)
  if (inst & D2_MASK) cpu.D = alu.out
  if (inst & D1_MASK) cpu.A = alu.out
}
```

**The Jump Specification**

“The jump field of the C-instruction tells the computer what to do next. There are two possibilities: The computer should either fetch and execute the next instruction in the program, which is the default, or it should fetch and execute an instruction located elsewhere in the program. In the latter case, we assume that the A register has been previously set to the address to which we have to jump.”

“Whether or not a jump should actually materialize depends on the three j-bits of the jump field and on the ALU output value”

```js
// C instruction jump bits
var J1_MASK = 1 << 2
var J2_MASK = 1 << 1
var J3_MASK = 1 << 0

// update PC based on the jump specification
function jump (cpu, alu, inst) {
  var shouldJump = inst & J1_MASK && alu.ng ||
    inst & J2_MASK && alu.zr ||
    inst & J3_MASK && (!alu.zr && !alu.ng)
  cpu.PC = shouldJump ? cpu.A : cpu.PC + 1
}
```

```js
// execute C instruction
function executeC (cpu, inst) {
  var alu = compute(cpu, inst)
  store(cpu, alu, inst)
  jump(cpu, alu, inst)
}
```

#### Screen

“The Hack computer includes a black-and-white screen organized as 256 rows of 512 pixels per row. The screen’s contents are represented by an 8K memory map that starts at RAM address 16384”

```js
var WIDTH = 512
var HEIGHT = 256
```

## App

```js
var PX_SIZE = 1
if (typeof window !== 'undefined') {
  var canvas = document.createElement('canvas')
  canvas.width = WIDTH * PX_SIZE
  canvas.height = HEIGHT * PX_SIZE
  document.body.appendChild(canvas)
  console.log('ea', canvas)
}
```

```js
module.exports = {
  alu, RAM, CPU, Memory
}
```

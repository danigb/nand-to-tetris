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
// Create a RAM (data memory)
function RAM () {
  var ram = {}
  return {
    read: function (address) { return ram[address] || 0 },
    write: function (address, value) { ram[address] = value }
  }
}
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
function CPU (rom, ram) {
  var PC = 0 // program counter
  var A = 0 // A register
  var D = 0 // D register
  return { rom, ram, PC, A, D }
}
var INST_TYPE_MASK = 1 << 15
function isTypeC (instruction) {
  return instruction & INST_TYPE_MASK
}
function execute(cpu, instruction) {
  if (isTypeC(instruction)) executeC(cpu, instruction)
  else executeA(cpu, instruction)
}
function executeA (cpu, instruction) {
  cpu.A = instruction
  cpu.PC++
}
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
// execute C instruction
function executeC (cpu, inst) {
  var alu = compute(cpu, inst)
  store(cpu, alu, inst)
  jump(cpu, alu, inst)
}
module.exports = {
  alu, RAM, CPU, Memory
}


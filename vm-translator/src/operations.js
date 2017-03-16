// Given a list of asm commands, join them with new lines
const asm = (...args) => args.join('\n')

// push a value into the stack
const push = (value) => asm(
  '@' + value, // A = value
  'D=A',
  '@SP', // A = address of the stack pointer
  'A=M', // A = address of the next element of the stack
  'M=D', // next element = D (value)
  'D=A+1', // D = address of the next element of the stack
  '@SP', // A = address of the stack pointer
  'M=D' // increment the stack pointer
)

// pop the last value of the stack into D
const popToD = () => asm(
  '@SP', // A = SP (next stack space)
  'M=M-1', // SP-- (SP = last stack item address)
  'A=M', // A = M[SP] (A = last stack item address)
  'D=M' // D = M[SP] (D = last stack item)
)

// Replace the last stack value (previously loaded to M)
const replaceLast = (operation) => asm(
  '@SP', // A = address of the stack pointer
  'A=M-1', // A = address of last element of the stack
  // M = last element of the stack
  // do the operation and store in M (the last element)
  'M=' + operation
)

// Pop two values (into D and M) and push the operation
const popDMandPush = (operation) => asm(
  popToD(),
  replaceLast(operation)
)

// Integer addition
const add = () => popDMandPush('M+D')
// Integer subtraction
const sub = () => popDMandPush('D-M')
// Arithmetic negation
const neg = () => replaceLast('-M')

// Bitwise and
const and = () => popDMandPush('M&D')
// Bitwise or
const or = () => popDMandPush('M|D')
// Bitwise not
const not = () => replaceLast('!M')

// Define a code section with the given label
const label = (LABEL) => `(${LABEL})`

// Jump to a given label
const jumpTo = (LABEL) => asm(
  `@${LABEL}`, // load the LABEL address
  '0;JMP' // jump
)

// “The VM represents true and false as -1 (minus one, 0xFFFF) and 0 (zero, 0x0000), respectively.”
const compare = (op, TRUE, END) => asm(
  sub(), // substract the last two numbers
  'D=M', // save the result into D
  `@${TRUE}`, // load the TRUE address
  `D;${op}`, // perform the conditional jump operation
  replaceLast('0'), // write false (0) at the last element of the stack
  jumpTo(END),
  label(TRUE), // start the TRUE section
  replaceLast('-1'), // write true at the last element of the stack
  label(END)
)

// Equality
const eq = (TRUE, END) => compare('JEQ', TRUE, END)
// Greater than
const gt = (TRUE, END) => compare('JGT', TRUE, END)
// Lest than
const lt = (TRUE, END) => compare('JLT', TRUE, END)

/* eslint-disable object-property-newline */
module.exports = {
  push, popToD,
  add, sub, neg, and, or, not,
  eq, gt, lt
}

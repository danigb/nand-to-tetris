const push = (value) => [
  '@' + value, // A = value
  'D=A',
  '@SP', // A = address of the stack pointer
  'A=M', // A = address of the next element of the stack
  'M=D', // next element = D (value)
  'D=A+1', // D = address of the next element of the stack
  '@SP', // A = address of the stack pointer
  'M=D' // increment the stack pointer
].join('\n')

// D = last stack value, SP--
const popToD = () => [
  '@SP', // A = SP (next stack space)
  'M=M-1', // SP-- (last stack item)
  'D=M' // D = M[SP]
].join('\n')

// A = address of the last element of the stack
// M = the last element of the stack
const peek = () => [
  '@SP', // A = address of the stack pointer
  'A=M-1' // A = address of last element of the stack
  // M = last element of the stack
].join('\n')

// Integer addition
const add = () => [
  popToD(),
  peek(),
  'M=M+D' // last element = last element + D
].join()

// Arithmetic negation
const neg = () => [
  peek(),
  'M=-M' // negate the last element
].join('\n')

// Bitwise not
const not = () => [
  peek(),
  'M=!M'
].join('\n')

module.exports = { push, add, not, neg }

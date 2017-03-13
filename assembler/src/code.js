// Pad a string with zeros
const PADDING = '0000000000000000'
const pad = (str) => PADDING.slice(0, -str.length) + str

class Code {
  static toBinary (num) {
    return pad(parseInt(num, 10).toString(2))
  }

  // Encode an A instruction into a binary number
  static encodeA (address) {
    return Code.toBinary(address)
  }
  // Encode a C instruction into a binary number
  static encodeC (comp, dest = '', jump = '') {
    return '111' +
      valid(comp, encodeComp, 'Invalid C comp: ') +
      valid(dest, encodeDest, 'Invalid C dest: ') +
      valid(jump, encodeJump, 'Invalid C jump: ')
  }

  static decodeC (binary) {
    return {
      comp: valid(binary.slice(3, 10), decodeComp, 'Invalid C comp: '),
      dest: valid(binary.slice(10, 13), decodeDest, 'Invalid C dest: '),
      jump: valid(binary.slice(13, 16), decodeJump, 'Invalid C jump: ')
    }
  }
}

function valid (src, decode, err) {
  const value = decode(src)
  if (value === undefined) throw Error(err + src)
  return value
}

function encodeDest (dest) { return DEST[dest] }
function encodeComp (comp) { return COMP[comp] }
function encodeJump (jump) { return JUMP[jump] }

function decodeDest (dest) { return REV_DEST[dest] }
function decodeComp (comp) { return REV_COMP[comp] }
function decodeJump (jump) { return REV_JUMP[jump] }

/**
 * Translates Hack assembly language mnemonics into binary codes.
 */
const DEST = {
  '': '000',
  'M': '001',
  'D': '010',
  'MD': '011',
  'A': '100',
  'AM': '101',
  'AD': '110',
  'AMD': '111'
}
const REV_DEST = reverse(DEST)

const COMP = {
  '0': '0101010',
  '1': '0111111',
  '-1': '0111010',
  'D': '0001100',
  'A': '0110000',
  '!D': '0001101',
  '!A': '0110001',
  '-D': '0001111',
  '-A': '0110011',
  'D+1': '0011111',
  'A+1': '0110111',
  'D-1': '0001110',
  'A-1': '0110010',
  'A+D': '0000010',
  'D+A': '0000010',
  'D-A': '0010011',
  'A-D': '0000111',
  'D&A': '0000000',
  'A&D': '0000000',
  'D|A': '0010101',
  'A|D': '0010101',
  'M': '1110000',
  '!M': '1110001',
  '-M': '1110011',
  'M+1': '1110111',
  'M-1': '1110010',
  'D+M': '1000010',
  'M+D': '1000010',
  'D-M': '1010011',
  'M-D': '1000111',
  'D&M': '1000000',
  'D|M': '1010101',
  'M&D': '1000000',
  'M|D': '1010101'
}
const REV_COMP = reverse(COMP)

const JUMP = {
  '': '000',
  'JGT': '001',
  'JEQ': '010',
  'JGE': '011',
  'JLT': '100',
  'JNE': '101',
  'JLE': '110',
  'JMP': '111'
}
const REV_JUMP = reverse(JUMP)

// It reverses a hash map (convert values tu keys and keys to values)
function reverse (map) {
  return Object.keys(map).reduce((rev, key) => {
    rev[map[key]] = key
    return rev
  }, {})
}

module.exports = { Code }

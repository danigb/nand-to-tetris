/* global test expect */
var { wire, wire16, nand, and, not, or, not16, and16 } = require('./index')

function set16 (word, val) {
  var arr = Array.isArray(val) ? val : val.split('')
  arr.forEach((v, i) => word[i].set(v))
}
function get16 (word) {
  return word.map(w => w.get())
}

test('nand', () => {
  var [a, b, out] = [wire(), wire(), wire()]
  nand(a, b, out)
  expect(out.get()).toBe(1)
  a.set(1)
  expect(out.get()).toBe(1)
  b.set(1)
  expect(out.get()).toBe(0)
})

test('and', () => {
  var [a, b, out] = [wire(), wire(), wire()]
  and(a, b, out)
  a.set(1)
  expect(out.get()).toBe(0)
  b.set(1)
  expect(out.get()).toBe(1)
  a.set(0)
  expect(out.get()).toBe(0)
})

test('not', () => {
  var [a, out] = [wire(), wire()]
  not(a, out)
  expect(out.get()).toBe(1)
  a.set(1)
  expect(out.get()).toBe(0)
})

test('or', () => {
  var [a, b, out] = [wire(), wire(), wire()]
  or(a, b, out)
  expect(out.get()).toBe(0)
})

test('not16', () => {
  var [aw, outw] = [wire16(), wire16()]
  not16(aw, outw)
  expect(get16(outw)).toEqual([1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1])
})

test('and16', () => {
  var [aw, bw, outw] = [wire16(), wire16(), wire16()]
  and16(aw, bw, outw)
  set16(aw, '1111000011110000')
  set16(bw, '1010101010101010')
  console.log('joder', get16(aw).join(), get16(bw).join(), get16(outw).join())
  expect(get16(outw)).toEqual([1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0])
})

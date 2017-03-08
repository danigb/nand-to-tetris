var test = require('tst')
var assert = require('assert')
var { halfAdder, fullAdder } = require('..')

test('Boolean arithmetic', () => {
  test('halfAdder digits', () => {
    assert.deepEqual(halfAdder(0, 0), { out: 0, carry: 0 })
    assert.deepEqual(halfAdder(1, 0), { out: 1, carry: 0 })
    assert.deepEqual(halfAdder(0, 1), { out: 1, carry: 0 })
    assert.deepEqual(halfAdder(1, 1), { out: 0, carry: 1 })
  })
  test('fullAdder digits', () => {
    assert.deepEqual(fullAdder(0, 0, 0), { out: 0, carry: 0 })
    assert.deepEqual(fullAdder(1, 0, 0), { out: 1, carry: 0 })
    assert.deepEqual(fullAdder(0, 1, 0), { out: 1, carry: 0 })
    assert.deepEqual(fullAdder(1, 1, 0), { out: 0, carry: 1 })
    assert.deepEqual(fullAdder(0, 0, 1), { out: 1, carry: 0 })
    assert.deepEqual(fullAdder(1, 0, 1), { out: 0, carry: 1 })
    assert.deepEqual(fullAdder(0, 1, 1), { out: 0, carry: 1 })
    assert.deepEqual(fullAdder(1, 1, 1), { out: 1, carry: 1 })
  })
})

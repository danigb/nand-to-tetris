var test = require('tst')
var assert = require('assert')
var hal = require('..')

test('Boolean logic', () => {
  test('Basic logic gates', function () {
    test('nand', function () {
      assert.equal(hal.nand(1, 1), 0)
      assert.equal(hal.nand(1, 0), 1)
      assert.equal(hal.nand(0, 1), 1)
      assert.equal(hal.nand(0, 0), 1)
    })

    test('not', function () {
      assert.equal(hal.not(0), 1)
      assert.equal(hal.not(1), 0)
    })

    test('and', function () {
      assert.equal(hal.and(1, 1), 1)
      assert.equal(hal.and(1, 0), 0)
      assert.equal(hal.and(0, 1), 0)
      assert.equal(hal.and(0, 0), 0)
    })

    test('or', function () {
      assert.equal(hal.or(0, 0), 0)
      assert.equal(hal.or(1, 0), 1)
      assert.equal(hal.or(0, 1), 1)
      assert.equal(hal.or(1, 1), 1)
    })

    test('xor', function () {
      assert.equal(hal.xor(0, 0), 0)
      assert.equal(hal.xor(1, 0), 1)
      assert.equal(hal.xor(0, 1), 1)
      assert.equal(hal.xor(1, 1), 0)
    })

    test('mux', function () {
      assert.equal(hal.mux(0, 0, 0), 0)
      assert.equal(hal.mux(0, 0, 1), 0)
      assert.equal(hal.mux(1, 0, 0), 1)
      assert.equal(hal.mux(1, 0, 1), 0)
      assert.equal(hal.mux(0, 1, 0), 0)
      assert.equal(hal.mux(0, 1, 1), 1)
      assert.equal(hal.mux(1, 1, 0), 1)
      assert.equal(hal.mux(1, 1, 1), 1)
    })
  })

  test('Multi bit versions', function () {
    test('not16')
    test('and16')
    test('or16')
    test('mux16')
  })

  test('Multi way versions', function () {
    test('or8way')
    test('mux4way16k')
  })
})

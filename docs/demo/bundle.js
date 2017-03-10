(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

/**
 * Translates Hack assembly language mnemonics into binary codes.
 */
var DEST = {
  '': '000',
  'M': '001',
  'D': '010',
  'MD': '011',
  'A': '100',
  'AM': '101',
  'AD': '110',
  'AMD': '111'
};
var COMP = {
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
};

var JUMP = {
  '': '000',
  'JGT': '001',
  'JEQ': '010',
  'JGE': '011',
  'JLT': '100',
  'JNE': '101',
  'JLE': '110',
  'JMP': '111'
};

var Code = {
  dest: function dest(value) {
    return DEST[value];
  },
  comp: function comp(value) {
    return COMP[value];
  },
  jump: function jump(value) {
    return JUMP[value];
  }
};
module.exports = Code;

},{}],2:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Parser = require('./parser');
var Code = require('./code');
var SymbolTable = require('./symbol-table');

var PADDING = '0000000000000000';
var pad = function pad(num) {
  return PADDING.slice(0, -num.length) + num;
};
var isNumber = function isNumber(symbol) {
  return (/^\d+$/.test(symbol)
  );
};

var Assembler = function () {
  function Assembler() {
    _classCallCheck(this, Assembler);
  }

  _createClass(Assembler, [{
    key: 'symbols',
    value: function symbols(source) {
      var symbols = new SymbolTable();
      var address = 0;
      var parser = new Parser(source);
      while (parser.hasMoreCommands()) {
        var _parser$next = parser.next(),
            type = _parser$next.type,
            symbol = _parser$next.symbol;

        if (type === 'L') symbols.addEntry(symbol, address);else address++;
      }
      return symbols;
    }
  }, {
    key: 'assemble',
    value: function assemble(source) {
      var generator = new CodeGenerator(this.symbols(source));
      var parser = new Parser(source);
      var compiled = [];
      while (parser.hasMoreCommands()) {
        var inst = generator.instruction(parser.next());
        if (inst) compiled.push([inst, parser.line, parser.lineNumber]);
      }
      var instructions = compiled.map(function (i) {
        return i[0];
      });
      return { compiled: compiled, instructions: instructions };
    }
  }]);

  return Assembler;
}();

var CodeGenerator = function () {
  function CodeGenerator(symbols) {
    _classCallCheck(this, CodeGenerator);

    this.symbols = symbols;
    // The sourceMap is an array of arrays [compiled, source]
    this.sourceMap = [];
    this.nextAvailableAddress = 16;
  }

  _createClass(CodeGenerator, [{
    key: 'instruction',
    value: function instruction(next) {
      switch (next.type) {
        case 'A':
          return isNumber(next.symbol)
          // if its a number, covert to binary
          ? this.instA(next.symbol)
          // if not, retrieve the address from the symbols table
          : this.instA(this.getAddress(next.symbol));

        case 'C':
          return this.instC(next.comp, next.dest, next.jump);
      }
    }
  }, {
    key: 'getAddress',
    value: function getAddress(symbol) {
      if (!this.symbols.contains(symbol)) {
        // it's a local variable. Assign a new address
        this.symbols.addEntry(symbol, this.nextAvailableAddress);
        this.nextAvailableAddress++;
      }
      return this.symbols.getAddress(symbol);
    }
  }, {
    key: 'instA',
    value: function instA(address, line, lineNumber) {
      return pad(parseInt(address, 10).toString(2));
    }
  }, {
    key: 'instC',
    value: function instC(comp, dest, jump, line, lineNumber) {
      return '111' + Code.comp(comp) + Code.dest(dest) + Code.jump(jump);
    }
  }]);

  return CodeGenerator;
}();

module.exports = Assembler;

},{"./code":1,"./parser":3,"./symbol-table":4}],3:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * The main function of the parser is to break each assembly command into its
 * underlying components (fields and symbols)
 *
 * Encapsulates access to the input code. Reads an assembly language command,
 * parses it, and provides convenient access to the command’s components (fields
 * and symbols). In addition, removes all white space and comments.
 *
 * This is the suggested (object oriented) API
 */
var Parser = function () {
  function Parser(input) {
    _classCallCheck(this, Parser);

    this.toProcess = input.split('\n').map(function (line) {
      return line.replace(/\s*\/\/.*/, '').trim();
    }).filter(function (x) {
      return x;
    });
    this.lineNumber = 1;
  }

  _createClass(Parser, [{
    key: 'hasMoreCommands',
    value: function hasMoreCommands() {
      return this.toProcess.length > 0;
    }
  }, {
    key: 'next',
    value: function next() {
      this.line = this.toProcess.shift();
      this.lineNumber++;
      this.instruction = parse(this.line);
      return this.instruction;
    }
  }]);

  return Parser;
}();

function parse(input) {
  var instruction = parseA(input) || parseL(input) || parseC(input);
  if (!instruction) {
    throw Error('Invalid instuction: "' + input + '"');
  }
  return instruction;
}

function parseA(input) {
  var match = /^@([a-zA-Z0-9$._:]+)$/.exec(input);
  if (match) return { type: 'A', symbol: match[1] };
}

function parseL(input) {
  var match = /^\((.+)\)$/.exec(input);
  if (match) return { type: 'L', symbol: match[1] };
}

function parseC(input) {
  var match = /^([AMD]+=)?([-+01ADM!&|]+)(;J[GELNM][TQEP])?$/.exec(input);
  return match ? {
    type: 'C',
    dest: (match[1] || '').slice(0, -1),
    comp: match[2],
    jump: (match[3] || '').slice(1)
  } : undefined;
}

module.exports = Parser;

},{}],4:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var SymbolTable = function () {
  function SymbolTable() {
    _classCallCheck(this, SymbolTable);

    this.table = Object.assign({}, PREDEFINED);
  }

  _createClass(SymbolTable, [{
    key: 'addEntry',
    value: function addEntry(symbol, address) {
      this.table[symbol] = address;
      return this;
    }
  }, {
    key: 'contains',
    value: function contains(symbol) {
      return this.getAddress(symbol) !== undefined;
    }
  }, {
    key: 'getAddress',
    value: function getAddress(symbol) {
      return this.table[symbol];
    }
  }]);

  return SymbolTable;
}();

var PREDEFINED = {
  'SP': 0,
  'LCL': 1,
  'ARG': 2,
  'THIS': 3,
  'THAT': 4,

  'R0': 0,
  'R1': 1,
  'R2': 2,
  'R3': 3,
  'R4': 4,
  'R5': 5,
  'R6': 6,
  'R7': 7,
  'R8': 8,
  'R9': 9,
  'R10': 10,
  'R11': 11,
  'R12': 12,
  'R13': 13,
  'R14': 14,
  'R15': 15,

  'SCREEN': 0x4000,
  'KBD': 0x6000
};

module.exports = SymbolTable;

},{}],5:[function(require,module,exports){
'use strict';

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _hyperapp = require('hyperapp');

var _hack = require('../hack');

var Assembler = require('../assembler');

var classNames = require('classnames');

var EXAMPLE = '// This file is part of www.nand2tetris.org\n// and the book \'The Elements of Computing Systems\'\n// by Nisan and Schocken, MIT Press.\n// File name: projects/06/add/Add.asm\n\n// Computes R0 = 2 + 3  (R0 refers to RAM[0])\n\n@2\nD=A\n@3\nD=D+A\n@0\nM=D\n';

var log = function log(name, value, extra) {
  console.log(name, value, extra || '');return value;
};

var _compile = function _compile(source) {
  var asm = new Assembler();

  var _log = log('compiled', asm.assemble(source)),
      compiled = _log.compiled,
      instructions = _log.instructions;

  var hack = new _hack.Hack(instructions, 8);
  return { source: source, instructions: instructions, compiled: compiled, hack: hack };
};

var init = function init(source) {
  return _compile(source);
};

var actions = {
  compile: function compile(state) {
    return _compile(state.source);
  },
  source: function source(state, _source) {
    _source;
  },
  tick: function tick(state) {
    state.hack.cpu.tick();return state;
  }
};

var viewROM = function viewROM(PC) {
  return function (inst, pos) {
    return (0, _hyperapp.h)(
      'div',
      { 'class': classNames({ current: PC === pos, inst: true }) },
      pos,
      ': ',
      inst[0],
      ' ',
      inst[1]
    );
  };
};
var viewRAM = function viewRAM(_ref) {
  var _ref2 = _slicedToArray(_ref, 2),
      address = _ref2[0],
      value = _ref2[1];

  return (0, _hyperapp.h)(
    'div',
    null,
    address,
    ': ',
    value
  );
};
var viewDebug = function viewDebug(compiled, cpu, actions) {
  return (0, _hyperapp.h)(
    'div',
    null,
    (0, _hyperapp.h)(
      'h2',
      null,
      'CPU'
    ),
    (0, _hyperapp.h)(
      'div',
      null,
      'PC: ',
      cpu.PC
    ),
    (0, _hyperapp.h)(
      'div',
      null,
      'A: ',
      cpu.A
    ),
    (0, _hyperapp.h)(
      'div',
      null,
      'D: ',
      cpu.D
    ),
    (0, _hyperapp.h)(
      'a',
      { href: '#!', onclick: function onclick(e) {
          return actions.tick();
        } },
      'Tick!'
    ),
    (0, _hyperapp.h)(
      'h2',
      null,
      'ROM'
    ),
    (0, _hyperapp.h)(
      'div',
      { 'class': 'ROM' },
      compiled.map(viewROM(cpu.PC))
    ),
    (0, _hyperapp.h)(
      'h2',
      null,
      'RAM'
    ),
    (0, _hyperapp.h)(
      'div',
      { 'class': 'RAM' },
      cpu.ram.dump().map(viewRAM)
    )
  );
};

var view = function view(model, actions) {
  return (0, _hyperapp.h)(
    'div',
    { id: 'app' },
    (0, _hyperapp.h)(
      'h1',
      null,
      'CPU Emulator'
    ),
    (0, _hyperapp.h)(
      'h2',
      null,
      'Code'
    ),
    (0, _hyperapp.h)(
      'textarea',
      { onchange: function onchange(e) {
          return actions.source(e.target.value);
        } },
      model.source
    ),
    (0, _hyperapp.h)(
      'a',
      { href: '#!', onclick: function onclick(e) {
          return actions.compile();
        } },
      'Compile'
    ),
    viewDebug(model.compiled, model.hack.cpu, actions)
  );
};

var subscriptions = [function (state, actions) {
  return window.fetch('Add.asm').then(function (res) {
    return res.getText();
  }).then(function (res) {
    return console.log('Load!', res);
  });
}];

var MAX = '\n// This file is part of www.nand2tetris.org\n// and the book "The Elements of Computing Systems"\n// by Nisan and Schocken, MIT Press.\n// File name: projects/06/max/Max.asm\n\n// Computes R2 = max(R0, R1)  (R0,R1,R2 refer to RAM[0],RAM[1],RAM[2])\n\n   @R0\n   D=M              // D = first number\n   @R1\n   D=D-M            // D = first number - second number\n   @OUTPUT_FIRST\n   D;JGT            // if D>0 (first is greater) goto output_first\n   @R1\n   D=M              // D = second number\n   @OUTPUT_D\n   0;JMP            // goto output_d\n(OUTPUT_FIRST)\n   @R0\n   D=M              // D = first number\n(OUTPUT_D)\n   @R2\n   M=D              // M[2] = D (greatest number)\n(INFINITE_LOOP)\n   @INFINITE_LOOP\n   0;JMP            // infinite loop\n';

(0, _hyperapp.app)({
  model: init(MAX), view: view, actions: actions
});

},{"../assembler":2,"../hack":7,"classnames":9,"hyperapp":10}],6:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

// ## CPU

// “There are two types of instructions, A and C. The 16nth bit value determines which one is”
var I_MASK = 1 << 15;

// “The Hack programmer is aware of two 16-bit registers called D and A. These registers can be manipulated explicitly by arithmetic and logical instructions like A=D-1 or D=!A (where “!” means a 16-bit Not operation). While D is used solely to store data values, A doubles as both a data register and an address register.”

var CPU = function () {
  function CPU(alu, rom, memory) {
    _classCallCheck(this, CPU);

    this.alu = alu;
    this.rom = rom;
    this.memory = memory;
    this.ram = memory.ram;
    this.PC = 0;
    this.A = 0;
    this.D = 0;
  }

  _createClass(CPU, [{
    key: 'tick',
    value: function tick() {
      var inst = this.rom.read(this.PC);
      var isTypeA = !(inst & I_MASK);
      this.PC = isTypeA ? this.executeA(inst) : this.executeC(inst);
    }

    // “The A-instruction is used for three different purposes. First, it provides the only way to enter a constant into the computer under program control. Second, it sets the stage for a subsequent C-instruction designed to manipulate a certain data memory location, by first setting A to the address of that location. Third, it sets the stage for a subsequent C-instruction that specifies a jump, by first loading the address of the jump destination to the A register. These uses are demonstrated in figure 4.2.

  }, {
    key: 'executeA',
    value: function executeA(inst) {
      console.log('EXEC A', inst);
      this.A = inst;
      return this.PC + 1;
    }

    // “The C-instruction is the programming workhorse of the Hack platform—the instruction that gets almost everything done. The instruction code is a specification that answers three questions: (a) what to compute, (b) where to store the computed value, and (c) what to do next?”

  }, {
    key: 'executeC',
    value: function executeC(inst) {
      console.log('Execute C', inst);
      // **The Computation Specification**
      // “The Hack ALU is designed to compute a fixed set of functions on the D, A, and M registers (where M stands for Memory[A]). The computed function is specified by the a-bit and the six c-bits comprising the instruction’s comp field. This 7-bit pattern can potentially code 128 different functions, of which only the 28 listed in figure 4.3 are documented in the language specification.”
      /* perform computation */
      var x = this.D;
      var y = inst & A_MASK ? this.memory.read(this.A) : this.A;
      this.alu.set(x, y, inst & C1_MASK, inst & C2_MASK, inst & C3_MASK, inst & C4_MASK, inst & C5_MASK, inst & C6_MASK);

      // **The Destination Specification**
      // “The value computed by the comp part of the C-instruction can be stored in several destinations, as specified by the instruction’s 3-bit dest part”
      /* store output */
      if (inst & D3_MASK) this.memory.write(this.A, this.alu.out);
      if (inst & D2_MASK) this.D = this.alu.out;
      if (inst & D1_MASK) this.A = this.alu.out;

      // **The Jump Specification**
      // “The jump field of the C-instruction tells the computer what to do next. There are two possibilities: The computer should either fetch and execute the next instruction in the program, which is the default, or it should fetch and execute an instruction located elsewhere in the program. In the latter case, we assume that the A register has been previously set to the address to which we have to jump.”
      // “Whether or not a jump should actually materialize depends on the three j-bits of the jump field and on the ALU output value”
      /* calculate the next PC */
      var shouldJump = inst & J1_MASK && this.alu.ng || inst & J2_MASK && this.alu.zr || inst & J3_MASK && !this.alu.zr && !this.alu.ng;
      return shouldJump ? this.A : this.PC + 1;
    }
  }]);

  return CPU;
}();
// “The leftmost bit is the C-instruction code, which is 1. The next two bits are not used. The remaining bits form three fields that correspond to the three parts of the instruction’s symbolic representation. ”


var A_MASK = 1 << 12; // 0 = A, 1 = memory[A]
var C1_MASK = 1 << 11; // alu's zx
var C2_MASK = 1 << 10; // alu's nx
var C3_MASK = 1 << 9; // alu's zy
var C4_MASK = 1 << 8; // alu's ny
var C5_MASK = 1 << 7; // alu's f
var C6_MASK = 1 << 6; // alu's no
// C instruction destination bits
var D1_MASK = 1 << 5;
var D2_MASK = 1 << 4;
var D3_MASK = 1 << 3;
// C instruction jump bits
var J1_MASK = 1 << 2;
var J2_MASK = 1 << 1;
var J3_MASK = 1 << 0;

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

var ALU = function () {
  function ALU() {
    _classCallCheck(this, ALU);

    this.out = 0;
    this.zr = 0;
    this.ng = 0;
  }

  _createClass(ALU, [{
    key: 'set',
    value: function set(x, y, zx, nx, zy, ny, f, no) {
      if (zx) x = 0;
      if (nx) x = ~x;
      if (zy) y = 0;
      if (ny) y = ~y;
      this.out = f ? x + y : x & y;
      if (no) this.out = ~this.out;
      this.zr = this.out === 0;
      this.ng = this.out < 0;
      return this;
    }
  }]);

  return ALU;
}();

module.exports = { ALU: ALU, CPU: CPU };

},{}],7:[function(require,module,exports){
'use strict';

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _require = require('./cpu'),
    ALU = _require.ALU,
    CPU = _require.CPU;

var _require2 = require('./memory'),
    ROM = _require2.ROM,
    RAM = _require2.RAM,
    Memory = _require2.Memory;

// “Computer: The topmost Computer chip can be composed from the chips mentioned earlier, using figure 5.10 as a blueprint.”


var Computer = function Computer() {
  var program = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
  var initRam = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;

  _classCallCheck(this, Computer);

  this.alu = new ALU();
  this.rom = new ROM(program);
  this.ram = new RAM(initRam);
  this.memory = new Memory(this.ram, this.screen, this.keyboard);
  this.cpu = new CPU(this.alu, this.rom, this.memory);
};

module.exports = { Computer: Computer };

},{"./cpu":6,"./memory":8}],8:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

// ## Memory

// “Memory: Composed from three chips: RAM16K, Screen, and Keyboard. The Screen and the Keyboard are available as built-in chips and there is no need to build them. Although the RAM16K chip was built in the project in chapter 3, we recommend using its built-in version, as it provides a debugging-friendly GUI.”

// “The Hack programmer is aware of two distinct address spaces: an instruction memory and a data memory. Both memories are 16-bit wide and have a 15-bit address space, meaning that the maximum addressable size of each memory is 32K 16-bit words.”
var RAM = function () {
  function RAM(init) {
    _classCallCheck(this, RAM);

    this.heap = {};
    for (var i = 0; i < init; i++) {
      this.heap[i] = 0;
    }
  }

  _createClass(RAM, [{
    key: 'read',
    value: function read(address) {
      return this.heap[address] || 0;
    }
  }, {
    key: 'write',
    value: function write(address, value) {
      this.heap[address] = value;
    }
  }, {
    key: 'dump',
    value: function dump() {
      var _this = this;

      return Object.keys(this.heap).map(function (k) {
        return [k, _this.heap[k]];
      });
    }
  }]);

  return RAM;
}();

var ROM = function () {
  function ROM(program) {
    _classCallCheck(this, ROM);

    console.log('PROGRAM', program);
    this.instructions = program.map(function (bits) {
      return parseInt(bits, 2);
    });
  }

  _createClass(ROM, [{
    key: 'read',
    value: function read(address) {
      var inst = this.instructions[address];
      if (inst === undefined) {
        throw new Error('Out of bounds ROM access: ' + address);
      }
      return inst;
    }
  }]);

  return ROM;
}();

var RAM_MASK = 1 << 14;
var SCREEN_MASK = 1 << 13;

var Memory = function () {
  function Memory(ram, screen, keyboard) {
    _classCallCheck(this, Memory);

    this.ram = ram;
    this.screen = screen;
    this.keyboard = keyboard;
  }

  _createClass(Memory, [{
    key: 'read',
    value: function read(address) {
      if (~address & RAM_MASK) {
        return this.ram.read(address);
      } else if (~address & SCREEN_MASK) {
        // Equivalent to addr - RAM_SIZE
        return this.screen.read(address & RAM_MASK - 1);
      } else {
        return this.keyboard.read(address & SCREEN_MASK - 1);
      }
    }
  }, {
    key: 'write',
    value: function write(address, value) {
      if (~address & RAM_MASK) {
        return this.ram.write(address, value);
      } else if (~address & SCREEN_MASK) {
        return this.screen.write(address & RAM_MASK - 1, value);
      } else {
        return this.keyboard.write(address & SCREEN_MASK - 1, value);
      }
    }
  }]);

  return Memory;
}();

module.exports = { ROM: ROM, RAM: RAM, Memory: Memory };

},{}],9:[function(require,module,exports){
/*!
  Copyright (c) 2016 Jed Watson.
  Licensed under the MIT License (MIT), see
  http://jedwatson.github.io/classnames
*/
/* global define */

(function () {
	'use strict';

	var hasOwn = {}.hasOwnProperty;

	function classNames () {
		var classes = [];

		for (var i = 0; i < arguments.length; i++) {
			var arg = arguments[i];
			if (!arg) continue;

			var argType = typeof arg;

			if (argType === 'string' || argType === 'number') {
				classes.push(arg);
			} else if (Array.isArray(arg)) {
				classes.push(classNames.apply(null, arg));
			} else if (argType === 'object') {
				for (var key in arg) {
					if (hasOwn.call(arg, key) && arg[key]) {
						classes.push(key);
					}
				}
			}
		}

		return classes.join(' ');
	}

	if (typeof module !== 'undefined' && module.exports) {
		module.exports = classNames;
	} else if (typeof define === 'function' && typeof define.amd === 'object' && define.amd) {
		// register as 'classnames', consistent with npm package name
		define('classnames', [], function () {
			return classNames;
		});
	} else {
		window.classNames = classNames;
	}
}());

},{}],10:[function(require,module,exports){
!function(e,t){"object"==typeof exports&&"undefined"!=typeof module?t(exports):"function"==typeof define&&define.amd?define(["exports"],t):t(e.hyperapp=e.hyperapp||{})}(this,function(e){"use strict";function t(e,n,o){n.ns="http://www.w3.org/2000/svg";for(var r=0;r<o.length;r++){var a=o[r];a.data&&t(a.tag,a.data,a.children)}}function n(e,t){var n,o={};for(var r in e){var a=[];if("*"!==r&&(t.replace(new RegExp("^"+r.replace(/\//g,"\\/").replace(/:([A-Za-z0-9_]+)/g,function(e,t){return a.push(t),"([A-Za-z0-9_]+)"})+"/?$","g"),function(){for(var e=1;e<arguments.length-2;e++)o[a.shift()]=arguments[e];n=r}),n))break}return{match:n||"*",params:o}}var o,r,a,i=[],c=function(e,n){var c,f;for(a=[],o=arguments.length;o-- >2;)i.push(arguments[o]);for(;i.length;)if(Array.isArray(r=i.pop()))for(o=r.length;o--;)i.push(r[o]);else null!=r&&r!==!0&&r!==!1&&("number"==typeof r&&(r+=""),c="string"==typeof r,c&&f?a[a.length-1]+=r:(a.push(r),f=c));return"function"==typeof e?e(n,a):("svg"===e&&t(e,n,a),{tag:e,data:n||{},children:a})},f=function(e){function t(e){for(var t=0;t<w.onError.length;t++)w.onError[t](e);if(t<=0)throw e}function n(e,o,i){Object.keys(o).forEach(function(c){e[c]||(e[c]={});var f,u=i?i+"."+c:c,d=o[c];"function"==typeof d?e[c]=function(e){for(f=0;f<w.onAction.length;f++)w.onAction[f](u,e);var n=d(h,e,y,t);if(void 0===n||"function"==typeof n.then)return n;for(f=0;f<w.onUpdate.length;f++)w.onUpdate[f](h,n,e);h=a(h,n),r(h,m)}:n(e[c],d,u)})}function o(e){"l"!==document.readyState[0]?e():document.addEventListener("DOMContentLoaded",e)}function r(e,t){for(n=0;n<w.onRender.length;n++)t=w.onRender[n](e,t);p(g,v,v=t(e,y),0);for(var n=0;n<A.length;n++)A[n]();A=[]}function a(e,t){var n,o={};if(i(t)||Array.isArray(t))return t;for(n in e)o[n]=e[n];for(n in t)o[n]=t[n];return o}function i(e){return e=typeof e,"string"===e||"number"===e||"boolean"===e}function c(e,t){setTimeout(function(){e(t)},0)}function f(e,t){return e.tag!==t.tag||typeof e!=typeof t||i(e)&&e!==t}function u(e){var t;if("string"==typeof e)t=document.createTextNode(e);else{t=e.data&&e.data.ns?document.createElementNS(e.data.ns,e.tag):document.createElement(e.tag);for(var n in e.data)"onCreate"===n?c(e.data[n],t):s(t,n,e.data[n]);for(var o=0;o<e.children.length;o++)t.appendChild(u(e.children[o]))}return t}function d(e,t,n){e.removeAttribute("className"===t?"class":t),"boolean"!=typeof n&&"true"!==n&&"false"!==n||(e[t]=!1)}function s(e,t,n,o){if("style"===t)for(var r in n)e.style[r]=n[r];else if("o"===t[0]&&"n"===t[1]){var a=t.substr(2).toLowerCase();e.removeEventListener(a,o),e.addEventListener(a,n)}else"false"===n||n===!1?(e.removeAttribute(t),e[t]=!1):(e.setAttribute(t,n),"http://www.w3.org/2000/svg"!==e.namespaceURI&&(e[t]=n))}function l(e,t,n){for(var o in a(n,t)){var r=t[o],i=n[o],f=e[o];void 0===r?d(e,o,i):"onUpdate"===o?c(r,e):(r!==i||"boolean"==typeof f&&f!==r)&&s(e,o,r,i)}}function p(e,t,n,o){if(void 0===t)e.appendChild(u(n));else if(void 0===n){var r=e.childNodes[o];A.push(e.removeChild.bind(e,r)),t&&t.data&&t.data.onRemove&&c(t.data.onRemove,r)}else if(f(n,t))e.replaceChild(u(n),e.childNodes[o]);else if(n.tag){var r=e.childNodes[o];l(r,n.data,t.data);for(var a=n.children.length,i=t.children.length,d=0;d<a||d<i;d++){var s=n.children[d];p(r,t.children[d],s,d)}}}for(var h,v,g,m=e.view||function(){return""},y={},b=[],w={onError:[],onAction:[],onUpdate:[],onRender:[]},E=[e].concat((e.plugins||[]).map(function(t){return t(e)})),A=[],R=0;R<E.length;R++){var C=E[R];void 0!==C.model&&(h=a(h,C.model)),C.actions&&n(y,C.actions),C.subscriptions&&(b=b.concat(C.subscriptions));var L=C.hooks;L&&Object.keys(L).forEach(function(e){w[e].push(L[e])})}o(function(){g=e.root||document.body.appendChild(document.createElement("div")),r(h,m);for(var n=0;n<b.length;n++)b[n](h,y,t)})},u=function(e){return{model:{router:n(e.view,location.pathname)},actions:{router:{match:function(t,o){return{router:n(e.view,o)}},go:function(e,t,n){history.pushState({},"",t),n.router.match(t)}}},hooks:{onRender:function(t){return e.view[t.router.match]}},subscriptions:[function(e,t){addEventListener("popstate",function(){t.router.match(location.pathname)})}]}};e.h=c,e.app=f,e.Router=u});


},{}]},{},[5]);

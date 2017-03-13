(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _require = require('./parser'),
    Parser = _require.Parser;

var _require2 = require('./code'),
    Code = _require2.Code;

var _require3 = require('./symbols'),
    Symbols = _require3.Symbols;

// Test if a string contains a positive integer


var isNumber = function isNumber(symbol) {
  return (/^\d+$/.test(symbol)
  );
};

var Assembler = function () {
  function Assembler(source) {
    var startLocalMemory = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 16;

    _classCallCheck(this, Assembler);

    this.source = source;
    this.startLocalMemory = startLocalMemory;
  }

  _createClass(Assembler, [{
    key: 'symbols',
    value: function symbols() {
      if (!this.table) {
        var table = this.table = new Symbols();
        var parser = new Parser(this.source);
        var address = 0;
        while (parser.next()) {
          if (parser.type === 'L') table.setAddress(parser.symbol, address);else address++;
        }
      }
      return this.table;
    }

    // “Before an assembly program can be executed on a computer, it must be translated into the computer’s binary machine language. The translation task is done by a program called the assembler. The assembler takes as input a stream of assembly commands and generates as output a stream of equivalent binary program. The resulting code can be loaded as is into the computer’s memory and executed by the hardware.”
    // “A binary code file is composed of text lines. Each line is a sequence of 16 “0” and “1” ASCII characters, coding a single 16-bit machine language instruction”

  }, {
    key: 'program',
    value: function program() {
      if (!this._program) {
        var program = this._program = [];
        var symbols = this.symbols();
        var parser = new Parser(this.source);
        var nextAvailable = this.startLocalMemory;
        while (parser.next()) {
          switch (parser.type) {
            case 'A':
              var sym = parser.symbol;
              var address = isNumber(sym) ? +sym : symbols.contains(sym) ? symbols.getAddress(sym) : symbols.setAddress(sym, nextAvailable++);
              program.push(Code.encodeA(address));
              break;
            case 'C':
              program.push(Code.encodeC(parser.comp, parser.dest, parser.jump));
              break;
          }
        }
      }
      return this._program;
    }
  }]);

  return Assembler;
}();

module.exports = { Assembler: Assembler };

},{"./code":2,"./parser":3,"./symbols":4}],2:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

// Pad a string with zeros
var PADDING = '0000000000000000';
var pad = function pad(str) {
  return PADDING.slice(0, -str.length) + str;
};

var Code = function () {
  function Code() {
    _classCallCheck(this, Code);
  }

  _createClass(Code, null, [{
    key: 'toBinary',
    value: function toBinary(num) {
      return pad(parseInt(num, 10).toString(2));
    }

    // Encode an A instruction into a binary number

  }, {
    key: 'encodeA',
    value: function encodeA(address) {
      return Code.toBinary(address);
    }
    // Encode a C instruction into a binary number

  }, {
    key: 'encodeC',
    value: function encodeC(comp) {
      var dest = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';
      var jump = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : '';

      return '111' + valid(comp, encodeComp, 'Invalid C comp: ') + valid(dest, encodeDest, 'Invalid C dest: ') + valid(jump, encodeJump, 'Invalid C jump: ');
    }
  }, {
    key: 'decodeC',
    value: function decodeC(binary) {
      return {
        comp: valid(binary.slice(3, 10), decodeComp, 'Invalid C comp: '),
        dest: valid(binary.slice(10, 13), decodeDest, 'Invalid C dest: '),
        jump: valid(binary.slice(13, 16), decodeJump, 'Invalid C jump: ')
      };
    }
  }]);

  return Code;
}();

function valid(src, decode, err) {
  var value = decode(src);
  if (value === undefined) throw Error(err + src);
  return value;
}

function encodeDest(dest) {
  return DEST[dest];
}
function encodeComp(comp) {
  return COMP[comp];
}
function encodeJump(jump) {
  return JUMP[jump];
}

function decodeDest(dest) {
  return REV_DEST[dest];
}
function decodeComp(comp) {
  return REV_COMP[comp];
}
function decodeJump(jump) {
  return REV_JUMP[jump];
}

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
var REV_DEST = reverse(DEST);

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
var REV_COMP = reverse(COMP);

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
var REV_JUMP = reverse(JUMP);

// It reverses a hash map (convert values tu keys and keys to values)
function reverse(map) {
  return Object.keys(map).reduce(function (rev, key) {
    rev[map[key]] = key;
    return rev;
  }, {});
}

module.exports = { Code: Code };

},{}],3:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

// “Text beginning with two slashes (//) and ending at the end of the line is considered a comment and is ignored.”
function lines() {
  var input = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';

  return input.split('\n').map(function (line) {
    return line.replace(/\s*\/\/.*/, '').trim();
  }).filter(function (x) {
    return x;
  });
}

var Parser = function () {
  function Parser(input) {
    _classCallCheck(this, Parser);

    this.toProcess = lines(input);
  }

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


  _createClass(Parser, [{
    key: 'next',
    value: function next() {
      if (this.toProcess.length === 0) return null;
      var line = this.toProcess.shift();
      var len = line.length;
      if (line[0] === '@') {
        this.type = 'A';
        this.symbol = line.substring(1);
      } else if (line[0] === '(' && line[len - 1] === ')') {
        this.type = 'L';
        this.symbol = line.substring(1, len - 1);
      } else {
        this.type = 'C';
        var eq = line.indexOf('=');
        this.dest = eq === -1 ? '' : line.substring(0, eq);
        var semi = line.indexOf(';');
        if (semi === -1) {
          this.comp = line.substring(eq + 1, len);
          this.jump = '';
        } else {
          this.comp = line.substring(eq + 1, semi);
          this.jump = line.substring(semi + 1, len);
        }
      }
      return this;
    }
  }]);

  return Parser;
}();

module.exports = { Parser: Parser };

},{}],4:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Symbols = function () {
  function Symbols(table) {
    _classCallCheck(this, Symbols);

    this.table = table || Object.assign({}, PREDEFINED);
  }

  _createClass(Symbols, [{
    key: 'contains',
    value: function contains(symbol) {
      return this.getAddress(symbol) !== undefined;
    }
  }, {
    key: 'getAddress',
    value: function getAddress(symbol) {
      return this.table[symbol];
    }
  }, {
    key: 'setAddress',
    value: function setAddress(symbol, address) {
      this.table[symbol] = address;
      return address;
    }
  }]);

  return Symbols;
}();

// “Predefined symbols: A special subset of RAM addresses can be referred to by any assembly program using the following predefined symbols:”


var PREDEFINED = {
  // Stack Pointer: points to the stack top
  'SP': 0,
  // Base address of the **local** segment
  'LCL': 1,
  // Base address of the **arguments** segment
  'ARG': 2,
  // Base address of the **this** segment
  'THIS': 3,
  // Base address of the **that** segment
  'THAT': 4,
  // “Virtual registers: To simplify assembly programming, the symbols R0 to R15 are predefined to refer to RAM addresses 0 to 15, respectively.”
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
  // Points to the start of the screen mapped memory
  'SCREEN': 0x4000,
  // Points to the keboard mapped memory
  'KBD': 0x6000
};

module.exports = { Symbols: Symbols };

},{}],5:[function(require,module,exports){
'use strict';

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _hyperapp = require('hyperapp');

var _hack = require('../hack');

var _require = require('../assembler'),
    Assembler = _require.Assembler;

var classNames = require('classnames');

var PAD = '0000000000000000';
var pad = function pad(num) {
  return PAD.slice(0, 16 - num.length) + num;
};
var toBinary = function toBinary(i) {
  return pad(i.toString(2));
};

var EXAMPLE = '\n// This file is part of www.nand2tetris.org\n// and the book \'The Elements of Computing Systems\'\n// by Nisan and Schocken, MIT Press.\n// File name: projects/06/add/Add.asm\n\n// Computes R0 = 2 + 3  (R0 refers to RAM[0])\n\n@2\nD=A\n@3\nD=D+A\n@0\nM=D\n';

var log = function log(name, value, extra) {
  console.log(name, value, extra || '');return value;
};

var emptyRAM = function emptyRAM(size) {
  var ram = {};
  for (var i = 0; i < size; i++) {
    ram[i] = 0;
  }return ram;
};

var _compile = function _compile(source, ram) {
  var asm = new Assembler(source);
  var program = asm.program();
  var symbols = asm.symbols();
  var hack = new _hack.Hack({ rom: program, ram: ram });
  return { source: source, program: program, ram: ram, symbols: symbols, hack: hack };
};

var init = function init(source) {
  return _compile(source, emptyRAM(32));
};

var actions = {
  compile: function compile(model) {
    return _compile(model.source, model.ram);
  },
  source: function source(model, _source) {
    return { source: _source };
  },
  tick: function tick(model) {
    return model.hack.tick();
  },
  updateCPU: function updateCPU(model, _ref) {
    var _ref2 = _slicedToArray(_ref, 2),
        reg = _ref2[0],
        value = _ref2[1];

    model.hack[reg] = value;
    return model;
  },
  updateRAM: function updateRAM(model, _ref3) {
    var address = _ref3.address,
        value = _ref3.value;

    model.hack.write(address, value);
    return model;
  }
};

var Register = function Register(_ref4) {
  var name = _ref4.name,
      value = _ref4.value,
      update = _ref4.update;
  return (0, _hyperapp.h)(
    'div',
    null,
    name,
    ':',
    (0, _hyperapp.h)('input', { type: 'number', value: value, onchange: function onchange(e) {
        return update([name, +e.target.value]);
      } })
  );
};
var CPU = function CPU(_ref5) {
  var hack = _ref5.hack,
      tick = _ref5.tick,
      update = _ref5.update;
  return (0, _hyperapp.h)(
    'div',
    null,
    (0, _hyperapp.h)(
      'h2',
      null,
      'CPU'
    ),
    (0, _hyperapp.h)(Register, { name: 'PC', value: hack.PC, update: update }),
    (0, _hyperapp.h)(Register, { name: 'A', value: hack.A, update: update }),
    (0, _hyperapp.h)(Register, { name: 'D', value: hack.D, update: update }),
    (0, _hyperapp.h)(
      'a',
      { href: '#!', onclick: function onclick(e) {
          return tick();
        } },
      'Tick!'
    )
  );
};
var Memory = function Memory(_ref6) {
  var address = _ref6.address,
      value = _ref6.value,
      update = _ref6.update;
  return (0, _hyperapp.h)(
    'div',
    null,
    address,
    ':',
    toBinary(value),
    (0, _hyperapp.h)('input', { type: 'number', value: value, onchange: function onchange(e) {
        return update({ address: address, value: +e.target.value });
      } })
  );
};
var RAM = function RAM(_ref7) {
  var hack = _ref7.hack,
      update = _ref7.update;
  return (0, _hyperapp.h)(
    'div',
    { 'class': 'RAM' },
    (0, _hyperapp.h)(
      'h2',
      null,
      'RAM'
    ),
    hack.dump().map(function (_ref8) {
      var address = _ref8.address,
          value = _ref8.value;
      return (0, _hyperapp.h)(Memory, { address: address, value: value, update: update });
    })
  );
};

var ROM = function ROM(_ref9) {
  var hack = _ref9.hack,
      program = _ref9.program,
      symbols = _ref9.symbols;
  return (0, _hyperapp.h)(
    'div',
    { 'class': 'ROM' },
    (0, _hyperapp.h)(
      'h2',
      null,
      'ROM'
    ),
    program.map(function (instr, pos) {
      return (0, _hyperapp.h)(
        'div',
        { 'class': classNames({ current: hack.PC === pos, inst: true }) },
        pos,
        ':\xA0',
        instr
      );
    })
  );
};
var Computer = function Computer(_ref10) {
  var program = _ref10.program,
      hack = _ref10.hack,
      actions = _ref10.actions;
  return (0, _hyperapp.h)(
    'div',
    null,
    (0, _hyperapp.h)(CPU, { hack: hack, tick: actions.tick, update: actions.updateCPU }),
    (0, _hyperapp.h)(ROM, { hack: hack, program: program }),
    (0, _hyperapp.h)(RAM, { hack: hack, update: actions.updateRAM })
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
    (0, _hyperapp.h)(Computer, { program: model.program, hack: model.hack, actions: actions })
  );
};

(0, _hyperapp.app)({
  model: init(EXAMPLE), view: view, actions: actions
});

},{"../assembler":1,"../hack":6,"classnames":7,"hyperapp":8}],6:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

// “There are two types of instructions, A and C. The 16nth bit value determines which one is”
var I_MASK = 1 << 15;

// “The Hack programmer is aware of two 16-bit registers called D and A. These registers can be manipulated explicitly by arithmetic and logical instructions like A=D-1 or D=!A (where “!” means a 16-bit Not operation). While D is used solely to store data values, A doubles as both a data register and an address register.”

var Hack = function () {
  function Hack(state) {
    _classCallCheck(this, Hack);

    this.PC = state.PC || 0;
    this.D = state.D || 0;
    this.A = state.A || 0;
    this.rom = (state.rom || []).map(function (bits) {
      return typeof bits === 'number' ? bits : parseInt(bits, 2);
    });
    this.ram = state.ram || {};
    this.alu = new ALU();
  }

  _createClass(Hack, [{
    key: 'tick',
    value: function tick() {
      var inst = this.rom[this.PC];
      if (inst === undefined) throw Error('PC Overflow');
      var isTypeA = !(inst & I_MASK);
      this.PC = isTypeA ? execA(this, inst) : execC(this, inst);
      return this;
    }
  }, {
    key: 'start',
    value: function start() {
      while (this.rom[this.PC] !== undefined) {
        this.tick();
      }
    }
  }, {
    key: 'read',
    value: function read(address) {
      return this.ram[address];
    }
  }, {
    key: 'write',
    value: function write(address, value) {
      this.ram[address] = value;
      return this;
    }
  }, {
    key: 'dump',
    value: function dump() {
      var _this = this;

      return Object.keys(this.ram).map(function (address) {
        return { address: address, value: _this.ram[address] };
      });
    }
  }, {
    key: 'registers',
    value: function registers() {
      return { PC: this.PC, A: this.A, D: this.D };
    }
  }]);

  return Hack;
}();

// “The A-instruction is used for three different purposes. First, it provides the only way to enter a constant into the computer under program control. Second, it sets the stage for a subsequent C-instruction designed to manipulate a certain data memory location, by first setting A to the address of that location. Third, it sets the stage for a subsequent C-instruction that specifies a jump, by first loading the address of the jump destination to the A register. These uses are demonstrated in figure 4.2.


function execA(hack, inst) {
  hack.A = inst;
  return hack.PC + 1;
}

// “The C-instruction is the programming workhorse of the Hack platform—the instruction that gets almost everything done. The instruction code is a specification that answers three questions: (a) what to compute, (b) where to store the computed value, and (c) what to do next?”
function execC(hack, inst) {
  // **The Computation Specification**
  // “The Hack ALU is designed to compute a fixed set of functions on the D, A, and M registers (where M stands for Memory[A]). The computed function is specified by the a-bit and the six c-bits comprising the instruction’s comp field. This 7-bit pattern can potentially code 128 different functions, of which only the 28 listed in figure 4.3 are documented in the language specification.”
  /* perform computation */

  var out = hack.alu.set(hack.D, // x: 16-bit data input
  inst & A_MASK ? hack.read(hack.A) : hack.A, // y: 16-bit data input
  inst & C1_MASK, // `zx`: zero the x input
  inst & C2_MASK, // `nx`: negate the x input
  inst & C3_MASK, // `zy`: zero the y input
  inst & C4_MASK, // `ny`: negate the y input
  inst & C5_MASK, // `f`: function code (0 = AND, 1 = ADD)
  inst & C6_MASK // `no`: negate the output
  );

  // **The Destination Specification**
  // “The value computed by the comp part of the C-instruction can be stored in several destinations, as specified by the instruction’s 3-bit dest part”
  /* store output */
  if (inst & D3_MASK) hack.write(hack.A, out);
  if (inst & D2_MASK) hack.D = out;
  if (inst & D1_MASK) hack.A = out;

  // **The Jump Specification**
  // “The jump field of the C-instruction tells the computer what to do next. There are two possibilities: The computer should either fetch and execute the next instruction in the program, which is the default, or it should fetch and execute an instruction located elsewhere in the program. In the latter case, we assume that the A register has been previously set to the address to which we have to jump.”
  // “Whether or not a jump should actually materialize depends on the three j-bits of the jump field and on the ALU output value”
  /* calculate the next PC */
  var shouldJump = inst & J1_MASK && hack.alu.ng || inst & J2_MASK && hack.alu.zr || inst & J3_MASK && !hack.alu.zr && !hack.alu.ng;

  return shouldJump ? hack.A : hack.PC + 1;
}
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

var ALU = function () {
  function ALU() {
    _classCallCheck(this, ALU);

    this.set(0, 0, 0, 0, 0, 0, 0, 0);
  }

  _createClass(ALU, [{
    key: 'set',
    value: function set(x, y, zx, nx, zy, ny, f, no) {
      this.x = x;
      this.y = y;
      this.zx = zx;
      this.nx = nx;
      this.zy = zy;
      this.ny = ny;
      this.f = f;
      this.no = no;
      if (this.zx) this.x = 0;
      if (this.nx) this.x = ~this.x;
      if (this.zy) this.y = 0;
      if (this.ny) this.y = ~this.y;
      this.out = this.f ? this.x + this.y : this.x & this.y;
      if (this.no) this.out = ~this.out;
      this.zr = this.out === 0;
      this.ng = this.out < 0;
      return this.out;
    }
  }]);

  return ALU;
}();

module.exports = { Hack: Hack, ALU: ALU };

},{}],7:[function(require,module,exports){
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

},{}],8:[function(require,module,exports){
!function(e,t){"object"==typeof exports&&"undefined"!=typeof module?t(exports):"function"==typeof define&&define.amd?define(["exports"],t):t(e.hyperapp=e.hyperapp||{})}(this,function(e){"use strict";function t(e,n,o){n.ns="http://www.w3.org/2000/svg";for(var r=0;r<o.length;r++){var a=o[r];a.data&&t(a.tag,a.data,a.children)}}function n(e,t){var n,o={};for(var r in e){var a=[];if("*"!==r&&(t.replace(new RegExp("^"+r.replace(/\//g,"\\/").replace(/:([A-Za-z0-9_]+)/g,function(e,t){return a.push(t),"([A-Za-z0-9_]+)"})+"/?$","g"),function(){for(var e=1;e<arguments.length-2;e++)o[a.shift()]=arguments[e];n=r}),n))break}return{match:n||"*",params:o}}var o,r,a,i=[],c=function(e,n){var c,f;for(a=[],o=arguments.length;o-- >2;)i.push(arguments[o]);for(;i.length;)if(Array.isArray(r=i.pop()))for(o=r.length;o--;)i.push(r[o]);else null!=r&&r!==!0&&r!==!1&&("number"==typeof r&&(r+=""),c="string"==typeof r,c&&f?a[a.length-1]+=r:(a.push(r),f=c));return"function"==typeof e?e(n,a):("svg"===e&&t(e,n,a),{tag:e,data:n||{},children:a})},f=function(e){function t(e){for(var t=0;t<w.onError.length;t++)w.onError[t](e);if(t<=0)throw e}function n(e,o,i){Object.keys(o).forEach(function(c){e[c]||(e[c]={});var f,u=i?i+"."+c:c,d=o[c];"function"==typeof d?e[c]=function(e){for(f=0;f<w.onAction.length;f++)w.onAction[f](u,e);var n=d(h,e,y,t);if(void 0===n||"function"==typeof n.then)return n;for(f=0;f<w.onUpdate.length;f++)w.onUpdate[f](h,n,e);h=a(h,n),r(h,m)}:n(e[c],d,u)})}function o(e){"l"!==document.readyState[0]?e():document.addEventListener("DOMContentLoaded",e)}function r(e,t){for(n=0;n<w.onRender.length;n++)t=w.onRender[n](e,t);p(g,v,v=t(e,y),0);for(var n=0;n<A.length;n++)A[n]();A=[]}function a(e,t){var n,o={};if(i(t)||Array.isArray(t))return t;for(n in e)o[n]=e[n];for(n in t)o[n]=t[n];return o}function i(e){return e=typeof e,"string"===e||"number"===e||"boolean"===e}function c(e,t){setTimeout(function(){e(t)},0)}function f(e,t){return e.tag!==t.tag||typeof e!=typeof t||i(e)&&e!==t}function u(e){var t;if("string"==typeof e)t=document.createTextNode(e);else{t=e.data&&e.data.ns?document.createElementNS(e.data.ns,e.tag):document.createElement(e.tag);for(var n in e.data)"onCreate"===n?c(e.data[n],t):s(t,n,e.data[n]);for(var o=0;o<e.children.length;o++)t.appendChild(u(e.children[o]))}return t}function d(e,t,n){e.removeAttribute("className"===t?"class":t),"boolean"!=typeof n&&"true"!==n&&"false"!==n||(e[t]=!1)}function s(e,t,n,o){if("style"===t)for(var r in n)e.style[r]=n[r];else if("o"===t[0]&&"n"===t[1]){var a=t.substr(2).toLowerCase();e.removeEventListener(a,o),e.addEventListener(a,n)}else"false"===n||n===!1?(e.removeAttribute(t),e[t]=!1):(e.setAttribute(t,n),"http://www.w3.org/2000/svg"!==e.namespaceURI&&(e[t]=n))}function l(e,t,n){for(var o in a(n,t)){var r=t[o],i=n[o],f=e[o];void 0===r?d(e,o,i):"onUpdate"===o?c(r,e):(r!==i||"boolean"==typeof f&&f!==r)&&s(e,o,r,i)}}function p(e,t,n,o){if(void 0===t)e.appendChild(u(n));else if(void 0===n){var r=e.childNodes[o];A.push(e.removeChild.bind(e,r)),t&&t.data&&t.data.onRemove&&c(t.data.onRemove,r)}else if(f(n,t))e.replaceChild(u(n),e.childNodes[o]);else if(n.tag){var r=e.childNodes[o];l(r,n.data,t.data);for(var a=n.children.length,i=t.children.length,d=0;d<a||d<i;d++){var s=n.children[d];p(r,t.children[d],s,d)}}}for(var h,v,g,m=e.view||function(){return""},y={},b=[],w={onError:[],onAction:[],onUpdate:[],onRender:[]},E=[e].concat((e.plugins||[]).map(function(t){return t(e)})),A=[],R=0;R<E.length;R++){var C=E[R];void 0!==C.model&&(h=a(h,C.model)),C.actions&&n(y,C.actions),C.subscriptions&&(b=b.concat(C.subscriptions));var L=C.hooks;L&&Object.keys(L).forEach(function(e){w[e].push(L[e])})}o(function(){g=e.root||document.body.appendChild(document.createElement("div")),r(h,m);for(var n=0;n<b.length;n++)b[n](h,y,t)})},u=function(e){return{model:{router:n(e.view,location.pathname)},actions:{router:{match:function(t,o){return{router:n(e.view,o)}},go:function(e,t,n){history.pushState({},"",t),n.router.match(t)}}},hooks:{onRender:function(t){return e.view[t.router.match]}},subscriptions:[function(e,t){addEventListener("popstate",function(){t.router.match(location.pathname)})}]}};e.h=c,e.app=f,e.Router=u});


},{}]},{},[5]);

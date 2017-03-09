(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var Parser = require('./parser');
var Code = require('./code');
var SymbolTable = require('./symbol-table');

function isNumber(symbol) {
  return (/^\d+$/.test(symbol)
  );
}

var PADDING = '0000000000000000';
function toBinaryString(number, parser) {
  var result = parseInt(number, 10).toString(2);
  return PADDING.slice(0, -result.length) + result;
}

function parseLabels(source, table) {
  var address = 0;
  var parser = new Parser(source);
  while (parser.hasMoreCommands()) {
    var _parser$next = parser.next(),
        type = _parser$next.type,
        symbol = _parser$next.symbol;

    if (type === 'L') table.addEntry(symbol, address);else address++;
  }
}

function generateCode(source, table) {
  var parser = new Parser(source);
  var output = '';
  var nextAvailableAddress = 16;

  while (parser.hasMoreCommands()) {
    var _parser$next2 = parser.next(),
        type = _parser$next2.type,
        symbol = _parser$next2.symbol,
        comp = _parser$next2.comp,
        dest = _parser$next2.dest,
        jump = _parser$next2.jump;

    var address = void 0;

    switch (type) {
      case 'A':
        if (isNumber(symbol)) address = symbol;else {
          if (!table.contains(symbol)) {
            table.addEntry(symbol, nextAvailableAddress);
            nextAvailableAddress++;
          }
          address = table.getAddress(symbol);
        }
        output += toBinaryString(address) + '\n';
        break;
      case 'C':
        output += '111' + Code.comp(comp) + Code.dest(dest) + Code.jump(jump) + '\n';
        break;
    }
  }
  return output;
}

function assemble(source) {
  var table = new SymbolTable();
  parseLabels(source, table);
  return generateCode(source, table);
}

module.exports = { assemble: assemble };

},{"./code":2,"./parser":3,"./symbol-table":4}],2:[function(require,module,exports){
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

},{}],3:[function(require,module,exports){
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

var _hyperapp = require('hyperapp');

var _require = require('../assembler/src/assemble'),
    assemble = _require.assemble;

var EXAMPLE = '// This file is part of www.nand2tetris.org\n// and the book \'The Elements of Computing Systems\'\n// by Nisan and Schocken, MIT Press.\n// File name: projects/06/add/Add.asm\n\n// Computes R0 = 2 + 3  (R0 refers to RAM[0])\n\n@2\nD=A\n@3\nD=D+A\n@0\nM=D\n';

var log = function log(name, value, extra) {
  console.log(name, value, extra || '');return value;
};

var actions = {
  compile: function compile(state) {
    return { compiled: assemble(state.source) };
  }
};

var init = function init() {
  return {
    source: EXAMPLE
  };
};

var viewCompilation = function viewCompilation(compiled) {
  return (0, _hyperapp.h)(
    'div',
    null,
    (0, _hyperapp.h)(
      'h3',
      null,
      'Compiled'
    ),
    (0, _hyperapp.h)(
      'pre',
      null,
      compiled
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
    viewCompilation(model.compiled)
  );
};
(0, _hyperapp.app)({
  model: init(), view: view, actions: actions
});

},{"../assembler/src/assemble":1,"hyperapp":6}],6:[function(require,module,exports){
!function(e,t){"object"==typeof exports&&"undefined"!=typeof module?t(exports):"function"==typeof define&&define.amd?define(["exports"],t):t(e.hyperapp=e.hyperapp||{})}(this,function(e){"use strict";function t(e,n,o){n.ns="http://www.w3.org/2000/svg";for(var r=0;r<o.length;r++){var a=o[r];a.data&&t(a.tag,a.data,a.children)}}function n(e,t){var n,o={};for(var r in e){var a=[];if("*"!==r&&(t.replace(new RegExp("^"+r.replace(/\//g,"\\/").replace(/:([A-Za-z0-9_]+)/g,function(e,t){return a.push(t),"([A-Za-z0-9_]+)"})+"/?$","g"),function(){for(var e=1;e<arguments.length-2;e++)o[a.shift()]=arguments[e];n=r}),n))break}return{match:n||"*",params:o}}var o,r,a,i=[],c=function(e,n){var c,f;for(a=[],o=arguments.length;o-- >2;)i.push(arguments[o]);for(;i.length;)if(Array.isArray(r=i.pop()))for(o=r.length;o--;)i.push(r[o]);else null!=r&&r!==!0&&r!==!1&&("number"==typeof r&&(r+=""),c="string"==typeof r,c&&f?a[a.length-1]+=r:(a.push(r),f=c));return"function"==typeof e?e(n,a):("svg"===e&&t(e,n,a),{tag:e,data:n||{},children:a})},f=function(e){function t(e){for(var t=0;t<w.onError.length;t++)w.onError[t](e);if(t<=0)throw e}function n(e,o,i){Object.keys(o).forEach(function(c){e[c]||(e[c]={});var f,u=i?i+"."+c:c,d=o[c];"function"==typeof d?e[c]=function(e){for(f=0;f<w.onAction.length;f++)w.onAction[f](u,e);var n=d(h,e,y,t);if(void 0===n||"function"==typeof n.then)return n;for(f=0;f<w.onUpdate.length;f++)w.onUpdate[f](h,n,e);h=a(h,n),r(h,m)}:n(e[c],d,u)})}function o(e){"l"!==document.readyState[0]?e():document.addEventListener("DOMContentLoaded",e)}function r(e,t){for(n=0;n<w.onRender.length;n++)t=w.onRender[n](e,t);p(g,v,v=t(e,y),0);for(var n=0;n<A.length;n++)A[n]();A=[]}function a(e,t){var n,o={};if(i(t)||Array.isArray(t))return t;for(n in e)o[n]=e[n];for(n in t)o[n]=t[n];return o}function i(e){return e=typeof e,"string"===e||"number"===e||"boolean"===e}function c(e,t){setTimeout(function(){e(t)},0)}function f(e,t){return e.tag!==t.tag||typeof e!=typeof t||i(e)&&e!==t}function u(e){var t;if("string"==typeof e)t=document.createTextNode(e);else{t=e.data&&e.data.ns?document.createElementNS(e.data.ns,e.tag):document.createElement(e.tag);for(var n in e.data)"onCreate"===n?c(e.data[n],t):s(t,n,e.data[n]);for(var o=0;o<e.children.length;o++)t.appendChild(u(e.children[o]))}return t}function d(e,t,n){e.removeAttribute("className"===t?"class":t),"boolean"!=typeof n&&"true"!==n&&"false"!==n||(e[t]=!1)}function s(e,t,n,o){if("style"===t)for(var r in n)e.style[r]=n[r];else if("o"===t[0]&&"n"===t[1]){var a=t.substr(2).toLowerCase();e.removeEventListener(a,o),e.addEventListener(a,n)}else"false"===n||n===!1?(e.removeAttribute(t),e[t]=!1):(e.setAttribute(t,n),"http://www.w3.org/2000/svg"!==e.namespaceURI&&(e[t]=n))}function l(e,t,n){for(var o in a(n,t)){var r=t[o],i=n[o],f=e[o];void 0===r?d(e,o,i):"onUpdate"===o?c(r,e):(r!==i||"boolean"==typeof f&&f!==r)&&s(e,o,r,i)}}function p(e,t,n,o){if(void 0===t)e.appendChild(u(n));else if(void 0===n){var r=e.childNodes[o];A.push(e.removeChild.bind(e,r)),t&&t.data&&t.data.onRemove&&c(t.data.onRemove,r)}else if(f(n,t))e.replaceChild(u(n),e.childNodes[o]);else if(n.tag){var r=e.childNodes[o];l(r,n.data,t.data);for(var a=n.children.length,i=t.children.length,d=0;d<a||d<i;d++){var s=n.children[d];p(r,t.children[d],s,d)}}}for(var h,v,g,m=e.view||function(){return""},y={},b=[],w={onError:[],onAction:[],onUpdate:[],onRender:[]},E=[e].concat((e.plugins||[]).map(function(t){return t(e)})),A=[],R=0;R<E.length;R++){var C=E[R];void 0!==C.model&&(h=a(h,C.model)),C.actions&&n(y,C.actions),C.subscriptions&&(b=b.concat(C.subscriptions));var L=C.hooks;L&&Object.keys(L).forEach(function(e){w[e].push(L[e])})}o(function(){g=e.root||document.body.appendChild(document.createElement("div")),r(h,m);for(var n=0;n<b.length;n++)b[n](h,y,t)})},u=function(e){return{model:{router:n(e.view,location.pathname)},actions:{router:{match:function(t,o){return{router:n(e.view,o)}},go:function(e,t,n){history.pushState({},"",t),n.router.match(t)}}},hooks:{onRender:function(t){return e.view[t.router.match]}},subscriptions:[function(e,t){addEventListener("popstate",function(){t.router.match(location.pathname)})}]}};e.h=c,e.app=f,e.Router=u});


},{}]},{},[5]);

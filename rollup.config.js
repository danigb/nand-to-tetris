import babel from 'rollup-plugin-babel'
import resolve from 'rollup-plugin-node-resolve'
import uglify from 'rollup-plugin-uglify'
import commonjs from 'rollup-plugin-commonjs'

export default {
  plugins: [
    babel({
      babelrc: false,
      presets: ['es2015-rollup'],
      plugins: [
        ['transform-react-jsx', { pragma: 'h' }]
      ]
    }),
    resolve({
      jsnext: true
    }),
    commonjs({
      namedExports: {
        'assembler/src/assemble.js': [ 'default' ],
        'assembler/src/parser.js': [ 'default' ],
        'assembler/src/symbol-table.js': [ 'default' ]
      }
    }),
    uglify()
  ]
}

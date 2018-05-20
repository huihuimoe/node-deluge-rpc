import resolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'
import {uglify} from 'rollup-plugin-uglify'
import {minify} from 'uglify-es'

export default {
  input: 'index.js',
  output: {
    file: 'dist/deluge-rpc.min.js',
    format: 'umd',
    name: 'DelugeRPC',
    sourcemap: true,
    globals: {
      'axios': 'axios',
      'stream': 'undefined',
      'form-data': 'FormData'
    }
  },
  plugins: [resolve(), commonjs(), uglify({}, minify)],
  external: ['axios', 'form-data', 'stream']
}

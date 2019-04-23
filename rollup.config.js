import resolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'
import { terser } from 'rollup-plugin-terser'

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
  plugins: [resolve(), commonjs(), terser()],
  external: ['axios', 'form-data', 'stream']
}

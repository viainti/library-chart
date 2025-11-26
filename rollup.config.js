import typescript from '@rollup/plugin-typescript';
import resolve from '@rollup/plugin-node-resolve';
import dts from 'rollup-plugin-dts';

const input = 'src/index.ts';
const extensions = ['.js', '.ts', '.tsx'];
const external = ['react', 'react-dom', 'framer-motion'];

export default [
  {
    input,
    external,
    plugins: [
      resolve({ extensions }),
      typescript({ tsconfig: './tsconfig.json', declaration: false, declarationMap: false })
    ],
    output: [
      {
        file: 'dist/index.cjs',
        format: 'cjs',
        sourcemap: true,
        exports: 'named'
      },
      {
        file: 'dist/index.mjs',
        format: 'esm',
        sourcemap: true
      }
    ]
  },
  {
    input,
    plugins: [dts()],
    output: [
      {
        file: 'dist/index.d.ts',
        format: 'es'
      }
    ]
  }
];

import type { OutputOptions, RollupOptions } from 'rollup'
import dts from 'rollup-plugin-dts'
import type { Options as ESBuildOptions } from 'rollup-plugin-esbuild'
import esbuild from 'rollup-plugin-esbuild'
import { packages } from '../meta/packages'


const configs: RollupOptions[] = []

const pluginEsbuild = esbuild()
const pluginDts = dts()


function esbuildMinifer(options: ESBuildOptions) {
  const { renderChunk } = esbuild(options)

  return {
    name: 'esbuild-minifer',
    renderChunk,
  }
}

for (const { globals, name, external, iife, build, cjs, mjs, dts, target } of packages) {
  if (build === false)
    continue

  const input = `packages/${name}/index.ts`

  const output: OutputOptions[] = []

  const iifeGlobals = {
    ...(globals || {})
  }

  const iifeName = 'monorepo-starter'

  if (mjs !== false) {
    output.push({
      file: `packages/${name}/dist/index.mjs`,
      format: 'es'
    })
  }

  if (cjs !== false) {
    output.push({
      file: `packages/${name}/dist/index.cjs`,
      format: 'cjs'
    })
  }

  if (iife !== false) {
    output.push({
      file: `packages/${name}/dist/index.iife.js`,
      format: 'iife',
      name: iifeName,
      extend: true,
      globals: iifeGlobals,
    }, {
      file: `packages/${name}/dist/index.iife.min.js`,
      format: 'iife',
      name: iifeName,
      extend: true,
      globals: iifeGlobals,
      plugins: [
        esbuildMinifer({
          minify: true
        })
      ]
    })
  }

  configs.push({
    input,
    output,
    plugins: [
      target ? esbuild({ target }) : pluginEsbuild,
    ],
    external
  })

  if (dts !== false) {
    configs.push({
      input,
      output: {
        file: `packages/${name}/dist/index.d.ts`,
        format: 'es'
      },
      plugins: [
        pluginDts
      ],
      external
    })
  }
}

export default configs



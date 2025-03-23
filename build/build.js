#!/usr/bin/env node
/* eslint-disable no-undef */

import * as esbuild from 'esbuild'
import { sassPlugin } from 'esbuild-sass-plugin'
import fse from 'fs-extra'
import rr from 'recursive-readdir'
import { spawn } from 'child_process'

await (async () => {
  const isProduction = process.env.NODE_ENV === 'production'
  const DIR_BASE = process.cwd()
  const DIR_SRC = `${DIR_BASE}/src`
  const DIR_DIST = `${DIR_BASE}/dist`
  const DIR_DOCS = `${DIR_BASE}/docs`
  const DIR_DOCS_DIST = `${DIR_DOCS}/dist`

  const removeDebugger = string => {
    const reg = /(\n|\s|\/\/\s)+?debugger/gm
    if (reg.test(string)) {
      const clearedString = string.replace(reg, '')
      console.log('Removing debugger')

      return clearedString
    }

    return string
  }

  const removeConsoleLog = string => {
    // todo
  }

  const cleanSrcFiles = () => {
    rr(`${DIR_SRC}`, (err, files) => {
      if (err) {
        console.error(err)
      } else {
        for (let i = 0; i < files.length; i++) {
          const file = files[i]
          if (file.endsWith('.ts')) {
            let filecontent = fse.readFileSync(file, 'utf-8')

            filecontent = removeDebugger(filecontent)

            fse.writeFileSync(file, filecontent)
          }
        }
      }
    })
  }

  const copyFolder = (src, dest, options) => {
    try {
      fse.copySync(src, dest, options)
      console.log(`Directory ${src} copied to ${dest}`)
    } catch (error) {
      console.log('\u001B[31m', `Error while copying directory ${src} to ${dest}`)
      console.error(error)
    }
  }

  const liveReload = action => {
    const html = `
  <script id="live-reload">
    new EventSource('/esbuild').addEventListener('change', () => location.reload())
  </script>
</body>`
    rr(`${DIR_DOCS}/examples`, (err, files) => {
      if (err) {
        console.error(err)
      } else {
        files.forEach(file => {
          if (file.endsWith('index.html') && !file.includes('frameworks')) {
            let fileContent = fse.readFileSync(file, 'utf-8')
            const liveReloadExists = /<script id="live-reload">/.test(fileContent) === true
            if (action === 'add' && !liveReloadExists) {
              fileContent = fileContent.replace('</body>', html)
            }

            if (action === 'remove' && liveReloadExists) {
              fileContent = fileContent.replace(html, '</body>')
            }
            fse.writeFileSync(file, fileContent)
          }
        })
      }
    })
  }

  const run = (program, args) => {
    const cmd = spawn(program, args, {
      stdio: ['pipe', 'pipe', 'pipe'],
      env: {
        ...process.env,
        FORCE_COLOR: 'true',
        COLORTERM: 'truecolor'
      }
    })

    return new Promise((resolve, reject) => {
      cmd.stdout.setEncoding('utf8')
      cmd.stderr.setEncoding('utf8')

      cmd.stdout.on('data', data => {
        process.stdout.write(`stdout: ${data}`)
      })

      cmd.stderr.on('data', data => {
        process.stderr.write(`stderr: ${data}`)
      })

      cmd.on('error', error => {
        console.log(`error: ${error.message}`)
        reject(error)
      })

      cmd.on('exit', code => resolve(code))
    })
  }

  const options = {
    bundle: true,
    sourcemap: true,
    outdir: isProduction ? DIR_DIST : DIR_DOCS_DIST,
    plugins: [sassPlugin()],
    entryPoints: {
      'js/autofill': `${DIR_SRC}/js/autofill.ts`,
      'css/autofill': `${DIR_SRC}/sass/autofill.scss`
    }
  }

  if (!isProduction) {
    liveReload('add')
    const ctx = await esbuild.context({
      ...options,
      plugins: [
        ...options.plugins,
        {
          name: 'on-end',
          setup(build) {
            build.onEnd(result => console.log(`build ended with ${result.errors.length} errors`))
          }
        }
      ],
    })

    await ctx.watch()
    await ctx.serve({
      host: '127.0.0.1',
      port: 5100,
      servedir: `${DIR_DOCS}`,
    })
  }


  if (isProduction) {
    liveReload('remove')
    cleanSrcFiles()

    const lintJsExitCode = await run('eslint', ['.'])
    if (lintJsExitCode !== 0) process.exit(1)

    const lintCssExitCode = await run('stylelint', ['./**/*.scss'])
    if (lintCssExitCode !== 0) process.exit(1)

    const unitExitCode = await run('jest', ['--rootDir="./tests/unit"'])
    if (unitExitCode !== 0) process.exit(1)

    const e2eExitCode = await run('playwright', ['test', '-x', '--project=chromium', './tests/e2e'])
    if (e2eExitCode !== 0) process.exit(1)

    // base build
    await esbuild.build(options)

    // minified build
    await esbuild.build({
      ...options,
      target: ['es2015'],
      minify: true,
      entryPoints: {
        'js/autofill.min': `${DIR_SRC}/js/autofill.ts`,
        'css/autofill.min': `${DIR_SRC}/sass/autofill.scss`
      },
    })

    // copy dist folder to docs folder
    copyFolder(DIR_DIST, `${DIR_DOCS_DIST}`, { overwrite: true })

    console.log('\u001B[32m', 'Build succeeded')
  }
})()

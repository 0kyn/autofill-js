#!/usr/bin/env node

import { build } from 'esbuild'
import { sassPlugin } from 'esbuild-sass-plugin'
import fse from 'fs-extra'
import rr from 'recursive-readdir'

await (async () => {
  const isProduction = process.env.NODE_ENV === 'production'
  const DIR_BASE = process.cwd()
  const DIR_SRC = `${DIR_BASE}/src`
  const DIR_DIST = `${DIR_BASE}/dist`
  const DIR_DOCS = `${DIR_BASE}/docs`
  const DIR_DOCS_DIST = `${DIR_DOCS}/dist`
  const DIR_ROOT_DOCS_DIST = isProduction ? '../../dist' : '../../../dist'

  const removeDebugger = (string) => {
    const reg = /(\n|\s+?\/\/\s)?debugger/gm
    if (reg.test(string)) {
      const clearedString = string.replace(reg, '')
      console.log('Removing debugger')

      return clearedString
    }

    return string
  }

  const cleanSrcFiles = () => {
    rr(`${DIR_SRC}`, (err, files) => {
      if (err) {
        console.error(err)
      } else {
        for (let i = 0; i < files.length; i++) {
          const file = files[i]
          if (file.endsWith('.js')) {
            let filecontent = getFileContent(file)

            filecontent = removeDebugger(filecontent)

            writeFileContent(file, filecontent)
          }
        }
      }
    })
  }

  const handleDocsLinks = () => {
    rr(`${DIR_DOCS}/examples`, (err, files) => {
      if (err) {
        console.error(err)
      } else {
        for (let i = 0; i < files.length; i++) {
          const file = files[i]
          if (file.endsWith('index.html')) {
            let filecontent = getFileContent(file)
            const regCss = /(<link\sid="js-autofill-css-link".+?href=")(.+?)(")/gm
            const regJs = /(<script\sid="js-autofill-script-src".+?src=")(.+?)(")/gm
            filecontent = filecontent.replace(regCss, `$1${DIR_ROOT_DOCS_DIST}/css/autofill.css$3`)
            filecontent = filecontent.replace(regJs, `$1${DIR_ROOT_DOCS_DIST}/js/autofill.js$3`)

            writeFileContent(file, filecontent)
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

  const getFileContent = (filename) => {
    const string = fse.readFileSync(filename, 'utf8')

    return string
  }

  const writeFileContent = (filename, string) => {
    fse.writeFileSync(filename, string)
  }

  const defaultOptions = {
    bundle: true,
    sourcemap: true,
    outdir: DIR_DIST,
    plugins: [sassPlugin()]
  }

  const options = {
    ...defaultOptions,
    entryPoints: {
      'js/autofill': `${DIR_SRC}/js/autofill.js`,
      'css/autofill': `${DIR_SRC}/sass/autofill.scss`
    }
  }

  if (!isProduction) {
    options.watch = {
      onRebuild (err, res) {
        if (err) {
          console.log('\u001B[31m', 'Watch build failed')
        } else {
          console.log('\u001B[32m', 'Watch build succeeded')
        }
      }
    }
  }

  // handle assets link
  handleDocsLinks()

  // base build
  await build(options)

  if (isProduction) {
    cleanSrcFiles()

    await build({
      ...defaultOptions,
      minify: true,
      entryPoints: {
        'js/autofill.min': `${DIR_SRC}/js/autofill.js`,
        'css/autofill.min': `${DIR_SRC}/sass/autofill.scss`
      }
    })

    // copy dist folder to docs folder
    fse.removeSync(DIR_DOCS_DIST)
    copyFolder(DIR_DIST, `${DIR_DOCS_DIST}`)

    console.log('\u001B[32m', 'Build succeeded')
  }
})()

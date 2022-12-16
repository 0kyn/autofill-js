import fse from 'fs-extra'
import rr from 'recursive-readdir'
import path from 'node:path'
import readline from 'node:readline'
import { exec } from 'node:child_process'

await (async () => {
  const DRY_RUN = process.argv.includes('--dry-run')
  const DIR_BASE = process.cwd()
  const DIRS_IGNORED = new Set(['build', 'node_modules', '.git'])
  const FILETYPES_ALLOWED = new Set(['css', 'scss', 'map', 'js', 'html', 'md'])
  let count = 0

  const ignoreFunc = (file, stats) => {
    const fileBasename = path.basename(file)
    const condDirsIgnored = stats.isDirectory() && DIRS_IGNORED.has(fileBasename)

    return condDirsIgnored
  }

  const multipleIndexOf = (string, oldVersion) => {
    const searchStrLen = oldVersion.length
    if (searchStrLen === 0) {
      return []
    }
    let startIndex = 0; let index; const indices = []
    while ((index = string.indexOf(oldVersion, startIndex)) > -1) {
      indices.push(index)
      startIndex = index + searchStrLen
    }

    return indices
  }

  const allowFunc = (file) => FILETYPES_ALLOWED.has(path.extname(file).slice(1))

  const escape = (string, charToEscape) => {
    return string.replace(new RegExp(`\\${charToEscape}`, 'g'), `\\${charToEscape}`)
  }

  const runNpmVersion = (version) => {
    const cmd = `npm version --commit-hooks false --git-tag-version false ${version}`
    exec(cmd, (err, stdout, stderr) => {
      if (err) {
        console.log(`error: ${err.message}`)

        return
      }
      if (stderr) {
        console.log(`stderr: ${stderr}`)

        return
      }
      console.log('\u001B[32m', `Successfully run npm version. Bumped to ${stdout}`)
    })
  }

  const replaceVersion = async (file, oldVersion, newVersion) => {
    const regexEscapeOldVersion = escape(oldVersion, '.')
    const regexOldVersion = new RegExp(regexEscapeOldVersion, 'g')
    const originalString = await fse.readFile(file, 'utf8')
    count += originalString.match(regexOldVersion)?.length ?? 0
    const newString = originalString.replace(
      regexOldVersion,
      newVersion
    )

    if (originalString !== newString) {
      let lineCount = 1
      const rl = readline.createInterface({
        input: fse.createReadStream(file)
      })

      for await (const line of rl) {
        if (regexOldVersion.test(line)) {
          const cursorsPos = multipleIndexOf(line, oldVersion)
          cursorsPos.forEach(cursorPos => {
            const start = cursorPos > 100 ? cursorPos - 50 : 0
            console.log('\u001B[33m', `${file}(${lineCount},${cursorPos + 1})`)
            const fragments = [
              '\u001B[0m', // reset
              line.slice(start, cursorPos).trim(),
              '\u001B[101m', // bright red
              oldVersion,
              '\u001B[102m', // bright green
              newVersion,
              '\u001B[0m', // reset
              '\n'
            ]

            console.log.apply(undefined, fragments)
          })
        }
        lineCount++
      }

      if (DRY_RUN) return

      await fse.writeFile(file, newString, 'utf8')
    }
  }

  const main = async (args) => {
    const [oldVersion, newVersion] = args

    try {
      const files = await rr(DIR_BASE, [ignoreFunc])
      const filesToCheck = files.filter(file => allowFunc(file))

      await Promise.all(filesToCheck.map(async (file) => await replaceVersion(file, oldVersion, newVersion)))

      console.log(
        '\u001B[34m', // blue
        `${count} old version occurences found`,
        '\u001B[0m', // reset
        '\n'
      )

      if (!DRY_RUN) {
        console.log(
          '\u001B[32m', // green
          `${count} old version occurences replaced`,
          '\u001B[0m', // reset
          '\n'
        )
        runNpmVersion(newVersion)
      }
    } catch (error) {
      console.error(error)
      process.exit(1)
    }
  }

  await main(process.argv.slice(2))
})()

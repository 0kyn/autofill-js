/* eslint-disable @stylistic/max-len */
/* eslint-disable unicorn/consistent-function-scoping */
import { test, expect } from '@playwright/test'
import Random from '../../../src/js/random'

const consoleMessages: string[] = []

test.beforeEach(async({ page }) => {
  page.on('console', message => {
    consoleMessages.push(message.text())
  })

  await page.goto('/docs/examples/zero-config/index.html')
})

test('has title', async({ page }) => {
  await expect(page).toHaveTitle('Autofill.js - Zero Config example')
})

test('overlay', async({ page }) => {
  await expect(page.locator('.autofill-overlay')).toBeVisible({ visible: false })
})

test('form has expected input values', async({ page }) => {
  const data = Random.getData()
  const form = page.locator('form')

  // fullnames
  const expectedFullnames = (firstnames, lastnames): string[] => {
    let fullnames: string[] = []
    firstnames.forEach((firstname) => {
      lastnames.forEach(lastname => {
        fullnames = [...fullnames, `${firstname} ${lastname}`]
      })
    })

    return fullnames
  }
  expect(expectedFullnames(data.firstname, data.lastname)).toContain(
    await form.locator('#fullname').inputValue(),
  )

  // search
  expect(data.search).toContain(
    await form.locator('#search').inputValue(),
  )

  // url
  const tlds = data.location.map(location => location.tld)
  const expectedUrls = (companies, tlds): string[] => {
    let urls: string[] = []
    companies.forEach(company => {
      tlds.forEach(tld => {
        const url = `https://www.${company.toLocaleLowerCase().replace(/\W/g, '')}.${tld}`
        urls = [...urls, url]
      })
    })

    return urls
  }
  expect(expectedUrls(data.company, tlds)).toContain(
    await form.locator('#url').inputValue(),
  )

  // email
  const expectedEmails = (firstnames, lastnames, companies, tlds): string[] => {
    let emails: string[] = []
    firstnames.forEach(firstname => {
      lastnames.forEach(lastname => {
        companies.forEach(company => {
          tlds.forEach(tld => {
            const email = `${firstname.toLocaleLowerCase()}.${lastname.toLocaleLowerCase()}@${company.toLocaleLowerCase().replace(/\W/g, '')}.${tld}`
            emails = [...emails, email]
          })
        })
      })
    })

    return emails
  }
  expect(expectedEmails(data.firstname, data.lastname, data.company, tlds))
    .toContain(await form.locator('#email').inputValue())

  // tel
  const expectedPhones = data.location.map(location => location.phoneNumber)
  expect(expectedPhones).toContain(await form.locator('#tel').inputValue())

  // dates @todo

  // select
  const expectedOptions = ['option1', 'option2', 'option3']
  expect(expectedOptions).toContain(await form.locator('#select').inputValue())

  // select-multiple
  const expectedMultipleOptions = [
    expectedOptions,
    ['option1', 'option2'],
    ['option1', 'option3'],
    ['option2', 'option3'],
  ]
  const selectMultiple = form.locator('#select-multiple')
  const selectedValues = await selectMultiple.evaluate(
    (select: HTMLSelectElement) => [...select.selectedOptions].map(option => option.value),
  )
  expect(selectedValues.length).toBeGreaterThan(1)
  expect(expectedMultipleOptions).toContainEqual(selectedValues)

  // datalist
  const expectedDatalistOptions = [
    'San Francisco',
    'New York',
    'Seattle',
    'Los Angeles',
    'Chicago',
  ]
  expect(expectedDatalistOptions).toContain(await form.locator('#datalist').inputValue())

  // checkbox
  expect([true, false]).toContain(await form.locator('#checkbox').isChecked())

  // checkbox-multiple
  const expectedCheckboxMultiples = (length: number): boolean[][] =>
    Array.from({ length: 2 ** length }, (_, i) =>
      Array.from({ length }, (_, j) => Boolean((i >> (length - j - 1)) & 1)),
    )

  const checkedCheckboxValues = await page.evaluate(() => {
    return [...document.querySelectorAll('input[id^="checkbox-multiple"]')].map(
      input => (input as HTMLInputElement).checked,
    )
  })
  expect(expectedCheckboxMultiples(3)).toContainEqual(checkedCheckboxValues)

  // radio
  const expectedRadio = [
    [false, false, true],
    [false, true, false],
    [true, false, false],
  ]
  const checkedRadioValues = await page.evaluate(() => {
    return [...document.querySelectorAll('input[id^="radio"]')].map(
      input => (input as HTMLInputElement).checked,
    )
  })
  expect(expectedRadio).toContainEqual(checkedRadioValues)

  // range
  const rangeValue = Number.parseInt(await form.locator('#range').inputValue())
  expect(rangeValue >= 0 && rangeValue <= 100).toBe(true)

  // age @todo

  // color
  expect(/^#[A-Fa-f0-9]{6}$/.test(await form.locator('#color').inputValue())).toBe(true)

  // progress
  const progressValue = Number.parseInt(await form.locator('#progress').evaluate(input => (input as HTMLInputElement).value))
  expect(progressValue >= 0 && progressValue <= 100).toBe(true)

  // meter
  const meterValue = Number.parseInt(await form.locator('#progress').evaluate(input => (input as HTMLInputElement).value))
  expect(meterValue >= 0 && meterValue <= 100).toBe(true)

  // file
  await page.waitForTimeout(10_000)
  expect(consoleMessages).toContainEqual('Event triggered: change on #file')

  const fileCount = await page.evaluate(() => {
    const input = document.querySelector('#file') as HTMLInputElement

    console.log(input)

    return input?.files?.length ?? 0
  })
  expect(fileCount).toBe(1)

  const fileName = await page.evaluate(() => {
    const input = document.querySelector('#file') as HTMLInputElement

    return input?.files?.[0].name ?? ''
  })
  expect(fileName).toBe('test.txt')

  const fileContent = await page.evaluate(() => {
    const input = document.querySelector('#file') as HTMLInputElement

    if (!input?.files || input.files.length === 0) {
      return
    }

    const file = input.files[0]

    return new Promise<string | void>((resolve) => {
      const reader = new FileReader()
      reader.onload = (event: ProgressEvent<FileReader>): void => {
        if (event.target?.result && typeof event.target.result === 'string') {
          resolve(event.target.result)
        } else {
          resolve()
        }
      }
      reader.readAsText(file, 'ascii')
    })
  })

  expect(fileContent).toBe('file content')
})

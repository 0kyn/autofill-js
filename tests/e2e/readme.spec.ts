import { test, expect } from '@playwright/test'
import type { Page } from '@playwright/test'

declare global {
  interface Window {
    autofill: (options?: any) => Promise<any>
  }
}

const testArbitrary = async(page: Page) => {
  const form = page.locator('form:first-of-type')
  const username = await form.locator('input[name="username"]').inputValue()
  const email = await form.locator('input[name="email"]').inputValue()
  const selectMultiple = form.locator('select[name="selectMultiple"]')
  const checkbox1 = await form.locator('input[name="checkboxes[opt1]"]').isChecked()
  const checkbox2 = await form.locator('input[name="checkboxes[opt2]"]').isChecked()
  const checkbox3 = await form.locator('input[name="checkboxes[opt3]"]').isChecked()

  expect(username).toBeFalsy()

  expect(email).toBe('john@doe.com')

  const selectedValues = await selectMultiple.evaluate(
    (select: HTMLSelectElement) => [...select.selectedOptions].map(option => option.value),
  )
  expect(selectedValues).toStrictEqual(['UKNW', 'PLCE'])

  expect(checkbox1).toBe(true)
  expect(checkbox2).toBe(true)
  expect(checkbox3).toBe(false)
}

let consoleMessages: string[] = []

test.beforeEach(async({ page }) => {
  consoleMessages = []
  page.on('console', message => {
    consoleMessages.push(message.text())
  })

  await page.goto('/docs/readme.html')
})

test('zero config', async({ page }) => {
  await page.evaluate(() => {
    window.autofill()
  })

  const username = await page.locator('input[name="username"]').inputValue()
  expect(username).toBeTruthy()
  // ... see zero-config.spec.ts
})

test('async call', async({ page }) => {
  const called = await page.evaluate(() => {
    return (async(): Promise<boolean> => {
      try {
        await window.autofill()

        console.log('form inputs filled')

        return true
      } catch {
        console.error('error')

        return false
      }
    })()
  })

  expect(called).toBe(true)
})

test('arbitrary values', async({ page }) => {
  await page.evaluate(() => {
    const inputs = {
      email: 'john@doe.com',
      selectMultiple: ['UKNW', 'PLCE'],
      checkboxes: ['option1', 'option2'],
    }
    window.autofill({ inputs })
  })

  await testArbitrary(page)
})

test('arbitrary values 2', async({ page }) => {
  await page.evaluate(() => {
    const inputs = {
      email: 'john@doe.com',
      selectMultiple: ['UKNW', 'PLCE'],
      checkboxes: [0, 1],
    }
    window.autofill({ inputs })
  })

  await testArbitrary(page)
})

test('multiple form with same config', async({ page }) => {
  await page.evaluate(() => {
    window.autofill({
      overlay: true,
      random: true,
      generate: true,
      forms: {
        'form#formId, form.formClasses': {
          inputs: {
            email: 'john@doe.com',
            password: '{{ password|len:16 }}',
          },
        },
      },
    })
  })

  const overlayLocator = page.locator('.autofill-overlay')
  await expect(overlayLocator).toBeVisible()
  await expect(overlayLocator).toHaveCSS('background-color', 'rgb(129, 174, 206)')

  const formId = page.locator('form#formId')
  const formIdEmail = await formId.locator('input[name="email"]').inputValue()
  const formIdPassword = await formId.locator('input[name="password"]').inputValue()
  expect(formIdEmail).toBe('john@doe.com')
  expect(formIdPassword).toHaveLength(16)

  const formClasses = page.locator('form.formClasses')
  const formClassesEmail = await formClasses.locator('input[name="email"]').inputValue()
  const formClassesPassword = await formClasses.locator('input[name="password"]').inputValue()
  expect(formClassesEmail).toBe('john@doe.com')
  expect(formClassesPassword).toHaveLength(16)
})

test('multiple forms independently', async({ page }) => {
  await page.evaluate(() => {
    window.autofill({
      generate: true,
      forms: {
        '#formId': {
          autosubmit: true,
          generate: false,
          inputs: {
            email: 'john@doe.com',
            password: '{{ password|len:16 }}',
          },
        },
        'form.formClasses': {
          inputs: {
            email: 'john@do3.com',
            password: '{{ password|len:100 }}',
          },
        },
      },
    })
  })

  const formId = page.locator('form#formId')
  const formIdEmail = await formId.locator('input[name="email"]').inputValue()
  const formIdPassword = await formId.locator('input[name="password"]').inputValue()
  expect(formIdEmail).toBe('john@doe.com')
  expect(formIdPassword).toBe('{{ password|len:16 }}')

  const formClasses = page.locator('form.formClasses')
  const formClassesEmail = await formClasses.locator('input[name="email"]').inputValue()
  const formClassesPassword = await formClasses.locator('input[name="password"]').inputValue()
  expect(formClassesEmail).toBe('john@do3.com')
  expect(formClassesPassword).toHaveLength(100)

  // await autosubmitting
  await page.waitForTimeout(1500)
  expect(consoleMessages).toContainEqual('Form form#formId submitted')
})

test('events dispatch', async({ page }) => {
  await page.evaluate(() => {
    window.autofill({
      inputs: {
        username: 'jdoe', // trigger 'change' & 'input'
        email: {
          events: ['click'],
          value: 'john@doe.com', // trigger only 'click'
        },
        password: 'S3cUrEd', // trigger 'change' & 'input'
      },
    })
  })
  await page.waitForTimeout(100)

  expect(consoleMessages).toContainEqual('Event triggered: change on username')
  expect(consoleMessages).not.toContainEqual('Event triggered: change on email')
  expect(consoleMessages).toContainEqual('Event triggered: click on email')
  expect(consoleMessages).toContainEqual('Event triggered: change on password')
})

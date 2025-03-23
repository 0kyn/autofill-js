import { test, expect } from '@playwright/test'

test.beforeEach(async({ page }) => {
  await page.goto('/docs/examples/json/index.html')
})

test('has title', async({ page }) => {
  await expect(page).toHaveTitle('Autofill.js - JSON Config example')
})

test('overlay', async({ page }) => {
  const overlayLocator = page.locator('.autofill-overlay')
  await expect(overlayLocator).toBeVisible()
  await expect(overlayLocator).toHaveCSS('background-color', 'rgb(129, 174, 206)')

  let consoleMessages: Record<string, string>[] = []

  page.on('console', message => {
    consoleMessages.push({
      type: message.type(),
      text: message.text(),
    })
  })

  // infos
  await page.click('.js-btn-infos')
  await page.waitForTimeout(100)
  expect(consoleMessages.length).toBeGreaterThan(0)
  consoleMessages = []

  // reset
  await page.click('.js-btn-reset')
  await page.waitForTimeout(100)
  const areFormsEmpty = await page.evaluate(() => {
    return ['form:first-of-type', 'form#contact-form', 'form#random-form'].every(selector => {
      const form = document.querySelector(selector) as HTMLFormElement

      return [...(new FormData(form).entries())].every(input => {
        const [inputType, value] = input

        return value === '' || (inputType === 'range' && value === '50')
      })
    })
  })
  expect(areFormsEmpty).toBe(true)

  // fill
  const areFormsFilled = await page.evaluate(() => {
    (document.querySelector('.js-btn-autofill') as HTMLButtonElement).click()

    return ['form:first-of-type', 'form#contact-form', 'form#random-form'].every(
      selector => [
        ...(new FormData((document.querySelector(selector) as HTMLFormElement)).entries()),
      ]
        .every(input => {
          const [, value] = input

          return value !== ''
        }),
    )
  })
  expect(areFormsFilled).toBe(true)
})

test('default form has expected input values', async({ page }) => {
  const form = page.locator('form:first-of-type')

  await expect(form.locator('[name="name"]')).toHaveValue('Doe')
  await expect(form.locator('[name="firstname"]')).toHaveValue('JohnOverridden')
  await expect(form.locator('[name="username"]')).toHaveValue('jdoe')
  await expect(form.locator('[name="email"]')).toHaveValue('john@doe.com')
  await expect(form.locator('[name="select"]')).toHaveValue('option1')
  await expect(form.locator('[name="select"] option[value="option1"]'))
    .toHaveJSProperty('selected', true)
  await expect(form.locator('[name="select-multiple"]')).toHaveValue('option2')
  await expect(form.locator('[name="select-multiple"] option[value="option2"]'))
    .toHaveJSProperty('selected', true)
  await expect(form.locator('[name="select-multiple"] option[value="option3"]'))
    .toHaveJSProperty('selected', true)
  await expect(form.locator('[name="checkbox"]')).toHaveJSProperty('checked', false)
  await expect(form.locator('[name="checkbox-multiple[1]"]')).toHaveJSProperty('checked', true)
  await expect(form.locator('[name="checkbox-multiple[2]"]')).toHaveJSProperty('checked', false)
  await expect(form.locator('[name="checkbox-multiple[3]"]')).toHaveJSProperty('checked', true)
  await expect(form.locator('[name="radio"][value="option1"]')).toHaveJSProperty('checked', false)
  await expect(form.locator('[name="radio"][value="option2"]')).toHaveJSProperty('checked', false)
  await expect(form.locator('[name="radio"][value="option3"]')).toHaveJSProperty('checked', true)
  await expect(form.locator('[name="range"]')).toHaveValue('75')
})

test('contact form form has expected input values with autosubmit', async({ page }) => {
  const form = page.locator('form#contact-form')

  await expect(form.locator('[name="email"]')).toHaveValue('qwerty@dfg.com')
  await expect(form.locator('[name="message"]')).toHaveValue('J0hNDo4 (because of data-autofill="password")')

  await page.evaluate(() => {
    document.querySelector('#contact-form')?.dispatchEvent(new Event('submit'))
  })

  await page.waitForSelector('.js-render-submit:not(:empty)', {
    state: 'attached',
    timeout: 2000,
  })

  await page.waitForTimeout(500)

  const submissionText = await page.textContent('.js-render-submit')
  expect(submissionText).toContain('email: qwerty@dfg.com')
  expect(submissionText).toContain('message: J0hNDo4 (because of data-autofill="password")')
})

test('random form form has expected input values', async({ page }) => {
  const inputValue = await page.inputValue('form#random-form [name="message"]')
  expect(inputValue.length).toBe(150)

  // check email validity
  const isInvalid = await page.evaluate(() => {
    const form = document.querySelector('form#random-form') as HTMLFormElement
    const input = document.querySelector('form#random-form [name="email"]') as HTMLInputElement
    form.submit()

    return !input.validity.valid
  })
  expect(isInvalid).toBe(false)
})

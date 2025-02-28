import { test, expect } from '@playwright/test'

const consoleMessages: string[] = []

test.beforeEach(async({ page }) => {
  page.on('console', message => {
    consoleMessages.push(message.text())
  })

  await page.goto('/docs/examples/events/index.html')
})

test('verify events are triggered', async({ page }) => {
  await page.waitForTimeout(100)

  expect(consoleMessages).not.toContainEqual('Event triggered: input on #name')
  expect(consoleMessages).toContainEqual('Event triggered: click on #name')
  expect(consoleMessages).toContainEqual('Event triggered: input on #email')
  expect(consoleMessages).toContainEqual('Event triggered: change on #select')
})

import Random from '../../src/js/random'

const randomWithoutPreset = new Random({
  withPreset: false,
})

const randomWithPreset = new Random({
  withPreset: true,
})

describe('constructor', () => {
  test('returns an instance of Random without preset', () => {
    expect(randomWithoutPreset).toBeInstanceOf(Random)
    expect(randomWithoutPreset.withPreset).toBe(false)
  })

  test('returns an instance of Random with preset', () => {
    expect(randomWithPreset).toBeInstanceOf(Random)
    expect(randomWithPreset.withPreset).toBe(true)
  })
})

describe('genInputValue', () => {
  const input = document.createElement('input')

  test('generates a value for text input', () => {
    input.type = 'text'
    const value = randomWithoutPreset.genInputValue(input) as string
    expect(typeof value).toBe('string')
    expect(value.length).toBeGreaterThanOrEqual(12)
    expect(value.length).toBeLessThanOrEqual(16)
  })

  test('generates a value for email input', () => {
    input.type = 'email'
    const value = randomWithoutPreset.genInputValue(input)
    expect(typeof value).toBe('string')
    expect(value).toMatch(/^[a-z]+@[a-z]+\.[a-z]{2}$/)
  })

  test('generates a value for password input', () => {
    input.type = 'password'
    const value = randomWithoutPreset.genInputValue(input) as string
    expect(typeof value).toBe('string')
    expect(value.length).toBeGreaterThanOrEqual(12)
    expect(value.length).toBeLessThanOrEqual(16)
  })

  test('generates a value for number input', () => {
    input.type = 'number'
    const value = randomWithoutPreset.genInputValue(input)
    expect(typeof value).toBe('number')
    expect(value).toBeGreaterThanOrEqual(-1000)
    expect(value).toBeLessThanOrEqual(1000)
  })

  test('generates a value for color input', () => {
    input.type = 'color'
    const value = randomWithoutPreset.genInputValue(input)
    expect(typeof value).toBe('string')
    expect(value).toMatch(/^#[0-9A-F]{6}$/i)
  })

  test('generates a value for date input', () => {
    input.type = 'date'
    const value = randomWithoutPreset.genInputValue(input)
    expect(typeof value).toBe('string')
    expect(value).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })

  test('generates a value for checkbox input', () => {
    input.type = 'checkbox'
    const value = randomWithoutPreset.genInputValue(input)
    expect(typeof value).toBe('boolean')
  })

  test('generates a value for range input', () => {
    input.type = 'range'
    input.min = '0'
    input.max = '100'
    const value = randomWithoutPreset.genInputValue(input)
    expect(typeof value).toBe('number')
    expect(value).toBeGreaterThanOrEqual(0)
    expect(value).toBeLessThanOrEqual(100)
  })
})

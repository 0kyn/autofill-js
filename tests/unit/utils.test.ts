import { describe, expect, test } from '@jest/globals'
import { AutofillInput } from '../../src/js/types/autofill.types'
import {
  hasProp,
  asArray,
  itemExists,
  truncate,
  toCamelCase,
  notContainsAttributes,
  notContainsTypes,
  isValidUrl,
  loadFromJson,
} from '../../src/js/utils'

describe('hasProp', () => {
  test('returns true for existing property', () => {
    expect(hasProp({ name: 'John' }, 'name')).toBe(true)
  })

  test('returns false for non-existing property', () => {
    expect(hasProp({ name: 'John' }, 'age')).toBe(false)
  })
})

describe('asArray', () => {
  test('returns array when given an array', () => {
    expect(asArray([1, 2, 3])).toEqual([1, 2, 3])
  })

  test('returns array with single item when given a non-array', () => {
    expect(asArray(1)).toEqual([1])
  })
})

describe('itemExists', () => {
  test('returns true for existing item', () => {
    expect(itemExists(2, [1, 2, 3])).toBe(true)
  })

  test('returns false for non-existing item', () => {
    expect(itemExists(4, [1, 2, 3])).toBe(false)
  })

  test('returns true for nested array', () => {
    expect(itemExists(3, [1, [2, 3], 4])).toBe(true)
  })
})

describe('truncate', () => {
  test('truncates string to specified length', () => {
    expect(truncate('Hello, World!', 5)).toBe('Hello')
  })

  test('returns full string if length is greater than string length', () => {
    expect(truncate('Hello', 10)).toBe('Hello')
  })
})

describe('toCamelCase', () => {
  test('converts kebab-case to camelCase', () => {
    expect(toCamelCase('hello-world')).toBe('helloWorld')
  })

  test('converts snake_case to camelCase', () => {
    expect(toCamelCase('hello_world')).toBe('helloWorld')
  })
})

describe('notContainsAttributes', () => {
  test('returns true when input does not contain specified attributes', () => {
    const input = {
      getAttributeNames: () => ['class', 'id'],
    } as AutofillInput
    expect(notContainsAttributes(input, ['name', 'value'])).toBe(true)
  })

  test('returns false when input contains specified attributes', () => {
    const input = {
      getAttributeNames: () => ['class', 'id', 'name'],
    } as AutofillInput
    expect(notContainsAttributes(input, ['name', 'value'])).toBe(false)
  })
})

describe('notContainsTypes', () => {
  test('returns true when input type is not in specified types', () => {
    const input = { type: 'text' } as AutofillInput
    expect(notContainsTypes(input, ['password', 'email'])).toBe(true)
  })

  test('returns false when input type is in specified types', () => {
    const input = { type: 'password' } as AutofillInput
    expect(notContainsTypes(input, ['password', 'email'])).toBe(false)
  })
})

describe('isValidUrl', () => {
  test('returns true for non-empty string', () => {
    expect(isValidUrl('https://example.com')).toBe(true)
  })

  test('returns false for empty string', () => {
    expect(isValidUrl('')).toBe(false)
  })

  test('returns false for boolean', () => {
    expect(isValidUrl(true)).toBe(false)
  })
})

global.fetch = jest.fn()

describe('loadFromJson', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('should successfully load and parse JSON data', async() => {
    const mockData = {
      enable: true,
      forms: {
        form: {
          inputs: {
            username: 'testuser',
          },
        },
      },
    }

    const mockResponse = {
      text: jest.fn().mockResolvedValue(JSON.stringify(mockData)),
    }
    ;(global.fetch as jest.Mock).mockResolvedValue(mockResponse)

    const result = await loadFromJson('https://example.com/config.json')

    expect(global.fetch).toHaveBeenCalledWith('https://example.com/config.json')
    expect(result).toEqual(mockData)
  })

  it('should throw an error when JSON parsing fails', async() => {
    const mockResponse = {
      text: jest.fn().mockResolvedValue('invalid json data'),
    }

    ;(global.fetch as jest.Mock).mockResolvedValue(mockResponse)

    await expect(loadFromJson('https://example.com/config.json'))
      .rejects
      .toThrow('Failed to parse JSON')

    expect(console.error).toHaveBeenCalled()
  })
})

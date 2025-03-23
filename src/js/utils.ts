import { AutofillInput } from './types/autofill.types'

export const isObject = (thing: unknown): thing is object =>
  typeof thing === 'object' && !Array.isArray(thing) && thing !== null

export const hasProp = (obj: object, name: string): boolean =>
  Object.prototype.hasOwnProperty.call(obj, name)

export const asArray = <T>(item: T | T[]): T[] => Array.isArray(item) ? item : [item]

export const itemExists = <T>(item: T, array: T[] | T[][]): boolean => {
  for (let i = 0; i < array.length; i++) {
    const element = array[i]
    if (item === element) {
      return true
    } else if (Array.isArray(element) && itemExists(item, element)) {
      return true
    }
  }

  return false
}

export const truncate = (string: string, length: number): string =>
  string.slice(0, Math.max(0, length))

export const toCamelCase = (string: string): string => {
  const split = string.split('-').length > 1 ? string.split('-') : string.split('_')

  return split.map((item, index) => {
    if (index > 0) {
      item = item.charAt(0).toUpperCase() + item.slice(1)
    }

    return item
  }).join('')
}

export const notContainsAttributes = (input: AutofillInput, attributes: string[]): boolean => {
  const excludedAttributes = new Set(attributes)

  return input.getAttributeNames().every(attr => {
    return !excludedAttributes.has(attr)
  })
}

export const notContainsTypes = (input: AutofillInput, types: string[]): boolean =>
  !types.includes(input.type)

export const isValidUrl = (url?: string | boolean): url is string =>
  typeof url === 'string' && url.length > 0

export const loadFromJson = async<AutofillOptions>(url: string): Promise<AutofillOptions> => {
  const response = await fetch(url)
  const string = await response.text()

  try {
    const object = JSON.parse(string) as AutofillOptions

    return object
  } catch (error) {
    console.error(error)
    throw new Error('Failed to parse JSON')
  }
}

export function hasProp (name, obj) {
  return Object.prototype.hasOwnProperty.call(obj, name)
}

export function asArray (item) {
  return Array.isArray(item) ? item : [item]
}

export function itemExists (item, array) {
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

export function truncate (string, length) {
  return string.slice(0, Math.max(0, length))
}

export function toCamelCase (string) {
  if (typeof string !== 'undefined') {
    const split = string.split('-').length > 1 ? string.split('-') : string.split('_')

    return split.map((item, index) => {
      if (index > 0) {
        item = item.charAt(0).toUpperCase() + item.slice(1)
      }

      return item
    }).join('')
  }

  return string
}

export function toKebabCase (string) {
  if (typeof string !== 'undefined') {
    return string
      .match(/[A-Z]{2,}(?=[A-Z][a-z]+\d*|\b)|[A-Z]?[a-z]+\d*|[A-Z]|\d+/g)
      .map(x => x.toLowerCase())
      .join('-')
  }

  return string
}

export function toSnakeCase (string) {
  if (typeof string !== 'undefined') {
    return string
      .match(/[A-Z]{2,}(?=[A-Z][a-z]+\d*|\b)|[A-Z]?[a-z]+\d*|[A-Z]|\d+/g)
      .map(x => x.toLowerCase())
      .join('_')
  }
}

export function stringToArr (string, separator) {
  return string.split(`${separator}`).map(item => item.trim())
}

export function notContainsAttributes (element, attributes) {
  const excludedAttributes = new Set(attributes)

  return element.getAttributeNames().every(attr => {
    return !excludedAttributes.has(attr)
  })
}

export function notContainsTypes (input, types) {
  return !types.includes(input.type)
}

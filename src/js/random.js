import * as utils from './utils.js'

export default class Random {
  static data = {
    lastname: ['Kent', 'Doe', 'Bond'],
    firstname: ['Clark', 'John', 'James'],
    location: [
      {
        country: 'United States of America',
        countryCode: 1,
        iso: 'US/USA',
        state: 'New York',
        phoneNumber: '012-345-6789',
        city: 'New York City',
        zipCode: '10016',
        street: '7985 E 38th St',
        currency: 'US Dollar',
        tld: 'us'
      },
      {
        country: 'France',
        countryCode: 33,
        iso: 'FR/FRA',
        state: 'Ile-de-France',
        phoneNumber: '0123456789',
        city: 'Paris',
        zipCode: '75008',
        street: '312 Av. des Champs-Élysées',
        currency: 'Euro',
        tld: 'fr'
      },
      {
        country: 'United Kingdom',
        countryCode: 44,
        iso: 'GB/GBR',
        state: 'London',
        phoneNumber: '02012347890',
        city: 'London',
        zipCode: '75008',
        street: '1578 Willesden St',
        currency: 'Pounds',
        tld: 'uk'
      }
    ],
    animal: ['Dog', 'Cat', 'Bird'],
    colorString: ['Red', 'Green', 'Blue'],
    colorHex: ['#ff0000', '#00ff00', '#0000ff'],
    music: ['Classical', 'Electro', 'Blues'],
    vehicle: ['Car', 'Bicycle', 'Truck'],
    company: ['Test Inc.', '3W Corp', 'DevIn'],
    search: ['search keyword 1', 'search keyword 2', 'search keyword 3']
  }

  static mapInputTypePreset = {
    tel: 'phoneNumber',
    email: 'email',
    color: 'colorHex',
    datetimeLocal: 'datetime',
    time: 'time',
    date: 'date'
  }

  static mapInputTypeStringOption = {
    text: 'string',
    textarea: 'string',
    email: 'email',
    password: 'password'
  }

  constructor ({ withPreset }) {
    this.withPreset = withPreset
    if (this.withPreset) {
      this.initPreset()
    }
  }

  initPreset () {
    this.preset = {}
    for (const key in Random.data) {
      if (key !== 'location') {
        this.preset[key] = Random.getRandomItem(Random.data[key])
      } else {
        this.preset = { ...this.preset, ...Random.getRandomItem(Random.data.location) }
      }
    }

    this.preset.name = this.preset.firstname
    this.preset.fullname = `${this.preset.firstname} ${this.preset.lastname}`
    this.preset.email = this.genPresetEmail()
    this.preset.username = this.genPresetUsername()
    this.preset.nickname = this.preset.username
    this.preset.password = this.genPresetPassword()
    this.preset.birthdate = this.genPresetBirthdate()
    this.preset.age = this.genPresetAge()
    this.preset.url = this.genPresetUrl()
    this.preset.datetime = this.genPresetDatetime()
    this.preset.date = this.genPresetDate()
    this.preset.month = this.genPresetMonth()
    this.preset.week = this.genPresetWeek()
    this.preset.time = this.genPresetTime()
  }

  genPresetEmail () {
    return `${this.preset.firstname.toLocaleLowerCase()}.${this.preset.lastname.toLocaleLowerCase()}@${this.preset.company.toLocaleLowerCase().replace(/\W/g, '')}.${this.preset.tld}`
  }

  genPresetUsername () {
    return `${this.preset.firstname}_${this.preset.lastname}`.toLowerCase()
  }

  genPresetPassword () {
    const mapChars = {
      a: '4', e: '3', g: '9', i: '1', l: '7', s: '5', z: '2'
    }
    const base = `${this.preset.username}_isnotasecurepwd`
    const string = [...base].map(char => {
      return mapChars[char] ?? char
    }).map(char => {
      return Random.genBool() ? char.toLocaleUpperCase() : char
    }).join('')

    return string
  }

  genPresetAge () {
    return Math.floor((Date.now() - new Date(this.preset.birthdate).getTime()) / 3.155_76e+10)
  }

  genPresetUrl () {
    return `https://www.${this.preset.company.toLocaleLowerCase().replace(/\W/g, '')}.${this.preset.tld}`
  }

  genPresetBirthdate () {
    const date = new Date()
    const years = date.getFullYear()
    const randomYear = years - Random.genInt(21, 100)
    const randomMonth = Random.genInt(0, 11)
    const randomDay = Random.genInt(1, 31)
    const birthdate = new Date(randomYear, randomMonth, randomDay).toISOString().split('T')[0]

    return birthdate
  }

  genPresetDatetime () {
    return Random.getDatetime()
  }

  genPresetDate () {
    return Random.getDate(this.preset.datetime)
  }

  genPresetMonth () {
    return Random.getMonth(this.preset.datetime)
  }

  genPresetWeek () {
    return Random.getWeek(this.preset.datetime)
  }

  genPresetTime () {
    return Random.getTime(this.preset.datetime)
  }

  searchPreset ({ type, ...attrs }) {
    const camelType = utils.toCamelCase(type)

    for (const pKey in this.preset) {
      for (const aKey in attrs) {
        const attrVal = attrs[aKey]
        const reg = new RegExp(`^${attrVal}$`, 'i')
        if (attrVal?.length > 0 && reg.test(pKey)) {
          return this.preset[pKey]
        }
      }
    }

    if (Random.mapInputTypePreset[camelType]) {
      return this.preset[Random.mapInputTypePreset[camelType]]
    }
  }

  genInputValue (input) {
    let inputValue
    let type
    if (input.getAttribute('list')?.length > 0) type = 'datalist'
    else if (input.tagName === 'PROGRESS') type = 'progress'
    else if (input.tagName === 'METER') type = 'meter'
    else type = input.type

    const stringType = Random.mapInputTypeStringOption[type] ?? 'string'

    switch (type) {
      case 'select-one':
      case 'select-multiple':
        inputValue = this.genSelect(input)
        break

      case 'checkbox':
        inputValue = this.genCheckbox(input)
        break

      case 'radio':
        inputValue = this.genRadio(input)
        break

      case 'datalist':
        inputValue = this.genDatalist(input)
        break

      case 'range':
        inputValue = this.genRange(input)
        break

      case 'number':
        inputValue = this.genNumber(input)
        break

      case 'progress':
        inputValue = this.genProgress(input)
        break

      case 'meter':
        inputValue = this.genMeter(input)
        break

      case 'date':
      case 'datetime-local':
      case 'month':
      case 'week':
      case 'time':
        inputValue = this.genDate(input, type)
        break

      case 'color':
        inputValue = this.genColor()
        break

      default:
        break
    }

    if (this.withPreset) {
      const attributes = Random.getAttributesByKeyValue(input)
      const preset = this.searchPreset({ type, ...attributes })

      if (typeof preset !== 'undefined') inputValue = preset
    }

    if (typeof inputValue === 'undefined') {
      const minlength = input.getAttribute('minlength') ? Number.parseInt(input.getAttribute('minlength')) : false
      const maxlength = input.getAttribute('maxlength') ? Number.parseInt(input.getAttribute('maxlength')) : false

      inputValue = Random.gen(stringType, { min: minlength, max: maxlength })
    }

    return inputValue
  }

  genSelect (input) {
    const selectType = input.type
    const options = input.querySelectorAll('option')
    const optionsIndexes = [...options]
      .map((option, index) => option.value.length > 0 ? index : false)
      .filter(Boolean)
    const optionsIndexesCount = optionsIndexes.length

    if (selectType === 'select-one') {
      return optionsIndexes[Random.genInt(0, optionsIndexes.length - 1)]
    } else {
      const minOptionToSelect = Random.genInt(2, optionsIndexesCount)
      let randomOptionsIndexes = []

      while (randomOptionsIndexes.length < minOptionToSelect) {
        const randomOptionIndex = optionsIndexes[Random.genInt(0, optionsIndexesCount - 1)]

        if (!randomOptionsIndexes.includes(randomOptionIndex)) {
          randomOptionsIndexes = [...randomOptionsIndexes, randomOptionIndex]
        }
      }

      return randomOptionsIndexes
    }
  }

  genCheckbox (input) {
    const reg = /\[/g
    if (reg.test(input.getAttribute('name'))) {
      const checkboxesIndexes = [...document.querySelectorAll(`input[name^=${input.getAttribute('name')
        .split('[')[0]}\\[]`)]
        .map((_, index) => index)

      const minCheckboxToCheck = Random.genInt(1, checkboxesIndexes.length)
      let randomCheckboxesIndexes = []

      while (randomCheckboxesIndexes.length < minCheckboxToCheck) {
        const randomCheckboxIndex = checkboxesIndexes[Random.genInt(0, checkboxesIndexes.length - 1)]

        if (!randomCheckboxesIndexes.includes(randomCheckboxIndex)) {
          randomCheckboxesIndexes = [...randomCheckboxesIndexes, randomCheckboxIndex]
        }
      }

      return randomCheckboxesIndexes
    } else {
      return Random.genBool()
    }
  }

  genRadio (input) {
    const radioIndexes = [...document.querySelectorAll(`[name^=${input.getAttribute('name').split('[')[0]}]`)].map((_, index) => {
      return index
    })

    return radioIndexes[Random.genInt(0, radioIndexes.length - 1)]
  }

  genDatalist (input) {
    const options = document.querySelectorAll(`datalist#${input.getAttribute('list')} option`)
    if (options !== null) {
      const optionsIndexes = [...options].map((option, index) => option.value.length > 0 ? index : false).filter(Boolean)

      return optionsIndexes[Random.genInt(0, optionsIndexes.length - 1)]
    }
  }

  genRange (input) {
    const min = input.getAttribute('min') ?? 0
    const max = input.getAttribute('max') ?? 100

    return Random.genInt(min, max)
  }

  genNumber (input) {
    const min = input.getAttribute('min') ?? -1000
    const max = input.getAttribute('max') ?? 1000

    return Random.genInt(min, max)
  }

  genProgress (input) {
    const max = input.getAttribute('max') ?? 100

    return Random.genInt(0, max)
  }

  genMeter (input) {
    return this.genNumber(input)
  }

  genDate (input, type = 'date') {
    const start = input.getAttribute('min') ?? '1970-01-01'
    const end = input.getAttribute('max') ?? '2099-12-31'
    let date

    switch (type) {
      case 'datetime-local':
        date = Random.genDatetime(start, end)
        break
      case 'month':
        date = Random.genMonth(start, end)
        break
      case 'week':
        date = Random.genWeek(start, end)
        break
      case 'time':
        date = Random.genTime(start, end)
        break
      case 'date':
        date = Random.genDate(start, end)
        break
    }

    return date
  }

  genColor () {
    return `#${Math.floor(Math.random() * 16_777_215).toString(16)}`
  }

  static parse (string) {
    const match = string.match(/^(\w+)/)
    if (match) {
      const stringType = match[1]
      const splitArgs = string.split('|')
      const options = {}
      if (splitArgs.length > 0) {
        for (let i = 0; i < splitArgs.length; i++) {
          const splitArg = splitArgs[i].split(':')
          options[splitArg[0]] = splitArg[1]
        }
      }

      return Random.gen(stringType, options)
    }
  }

  static gen (stringType, options) {
    const alphaLower = 'abcdefghijklmnopqrstuvwxyz'
    const alphaUpper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    const alpha = alphaLower + alphaUpper
    const digit = '0123456789'
    const specialsChars = ' !"#$%&\'()*+,-./:;<=>?@[\\]^_`{|}~'
    const allChars = alpha + digit + specialsChars

    const stringTypes = {
      string: alpha,
      email: alphaLower,
      password: allChars,
      digit
    }

    const minLength = options.min || 12
    const maxLength = options.max || 16
    const randomLength = Random.genInt(minLength, maxLength)

    options.len = options.len || randomLength
    options.chars = stringTypes[stringType]

    let randomString = ''
    if (stringType === 'email') {
      randomString += Random.genEmail(options)
    } else {
      if (options.chars) {
        randomString += Random.genString(options)
      }
    }

    return randomString
  }

  static genEmail (options) {
    const length = options.len >= 5 ? options.len : 5

    const tldLength = 2
    const domainLength = Math.floor(length / 3)
    const usernameLength = length - domainLength + tldLength

    let randomString = ''

    randomString += Random.genString({ ...options, len: usernameLength })
    randomString += '@'
    randomString += Random.genString({ ...options, len: domainLength })
    randomString += '.'
    randomString += Random.genString({ ...options, len: tldLength })

    return randomString
  }

  static genString (options) {
    const chars = options.chars
    const length = options.len

    let randomString = ''

    for (let i = 0; i < length; i++) {
      randomString += chars[Math.floor(Math.random() * chars.length)]
    }

    return randomString
  }

  static getAttributesByKeyValue (input) {
    const attrNames = ['name', 'id', 'class']

    const attributesByKV = attrNames.reduce((acc, key) => {
      const attrValue = input.getAttribute(key)
      if (typeof attrValue !== 'undefined') {
        acc[key] = attrValue
      }

      return acc
    }, {})

    return attributesByKV
  }

  static genInt (min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min)
  }

  static genBool () {
    return Math.random() < 0.5
  }

  static genDateBetween (start, end) {
    start = start instanceof Date ? start : new Date(start)
    end = end instanceof Date ? end : new Date(end)

    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()))
  }

  static genDate (start, end) {
    const date = Random.genDateBetween(start, end)
    const dateFormat = Random.getDate(Random.getDatetime(date))

    return dateFormat
  }

  static genDatetime (start, end) {
    const date = Random.genDateBetween(start, end)

    return Random.getDatetime(date)
  }

  static genMonth (start, end) {
    return Random.getMonth(Random.genDate(start, end))
  }

  static genWeek (start, end) {
    return Random.getWeek(Random.genDate(start, end))
  }

  static genTime (start, end) {
    return Random.getTime(Random.genDatetime(start, end))
  }

  static getDatetime (date) {
    if (typeof date === 'undefined') {
      date = new Date()
    }

    const datetime = date.toISOString().split('.')[0]

    return datetime
  }

  static getDate (datetime) {
    return datetime.split('T')[0]
  }

  static getMonth (date) {
    date = date instanceof Date ? date : new Date(date)

    return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`
  }

  static getWeek (date) {
    date = date instanceof Date ? date : new Date(date)

    return `${date.getFullYear()}-W${Random.getWeekNumber(date).toString().padStart(2, '0')}`
  }

  static getTime (datetime) {
    return datetime.split('T')[1]
  }

  static getWeekNumber (date) {
    date = date instanceof Date ? date : new Date(date)
    const startDate = new Date(date.getFullYear(), 0, 1)
    const days = Math.floor((date - startDate) / (24 * 60 * 60 * 1000))
    const weekNumber = Math.ceil(days / 7)

    return weekNumber
  }

  static getRandomItem (array) {
    return array[Math.floor(Math.random() * array.length)]
  }
}

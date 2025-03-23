import { AutofillInput } from './types/autofill.types'
import * as utils from './utils'

interface RandomConfig {
  withPreset: boolean
}

interface GenOptions {
  chars?: string
  min?: number
  max?: number
  len?: number
}

interface Data {
  [key: string]: string[] | object[]
}

export default class Random {
  private static data: Data = {
    lastname: ['Kent', 'Doe', 'Bond'],
    firstname: ['Clark', 'John', 'James'],
    location: [
      {
        country: 'United States of America',
        countryCode: '1',
        iso: 'US/USA',
        state: 'New York',
        phoneNumber: '012-345-6789',
        city: 'New York City',
        zipCode: '10016',
        street: '7985 E 38th St',
        currency: 'US Dollar',
        tld: 'us',
      },
      {
        country: 'France',
        countryCode: '33',
        iso: 'FR/FRA',
        state: 'Ile-de-France',
        phoneNumber: '0123456789',
        city: 'Paris',
        zipCode: '75008',
        street: '312 Av. des Champs-Élysées',
        currency: 'Euro',
        tld: 'fr',
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
        tld: 'uk',
      },
    ],
    animal: ['Dog', 'Cat', 'Bird'],
    colorString: ['Red', 'Green', 'Blue'],
    colorHex: ['#ff0000', '#00ff00', '#0000ff'],
    music: ['Classical', 'Electro', 'Blues'],
    vehicle: ['Car', 'Bicycle', 'Truck'],
    company: ['Test Inc.', '3W Corp', 'DevIn'],
    search: ['search keyword 1', 'search keyword 2', 'search keyword 3'],
  }

  private static mapInputTypePreset: Record<string, string> = {
    tel: 'phoneNumber',
    email: 'email',
    color: 'colorHex',
    datetimeLocal: 'datetime',
    time: 'time',
    date: 'date',
  }

  private static mapInputTypeStringOption: Record<string, string> = {
    text: 'string',
    textarea: 'string',
    email: 'email',
    password: 'password',
  }

  public withPreset: boolean
  public preset: Record<string, string> = {}

  constructor({ withPreset }: RandomConfig) {
    this.withPreset = withPreset
    if (this.withPreset) {
      this.initPreset()
    }
  }

  public static parse(string: string): string | void {
    const match = string.match(/^(\w+)/)
    if (match) {
      const stringType = match[1]
      const splitArgs = string.split('|')
      const options: Record<string, string> = {}
      if (splitArgs.length > 0) {
        for (let i = 0; i < splitArgs.length; i++) {
          const splitArg = splitArgs[i].split(':')
          options[splitArg[0]] = splitArg[1]
        }
      }

      return Random.gen(stringType, options)
    }
  }

  public static gen(type: string, options: GenOptions): string {
    const alphaLower = 'abcdefghijklmnopqrstuvwxyz'
    const alphaUpper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    const alpha = alphaLower + alphaUpper
    const digit = '0123456789'
    const specialsChars = ' !"#$%&\'()*+,-./:;<=>?@[\\]^_`{|}~'
    const allChars = alpha + digit + specialsChars

    const stringTypes: Record<string, string> = {
      string: alpha,
      email: alphaLower,
      password: allChars,
      digit,
    }

    const minLength = options.min || 12
    const maxLength = options.max || 16
    const randomLength = Random.genInt(minLength, maxLength)

    options.len = options.len || randomLength
    options.chars = stringTypes[type]

    let randomString = ''
    if (type === 'email') {
      randomString += Random.genEmail(options)
    } else {
      if (options.chars) {
        randomString += Random.genString(options)
      }
    }

    return randomString
  }

  public genInputValue(input: AutofillInput): string | number | boolean | number[] {
    let inputValue
    let type

    if (input.getAttribute('list') ?? false) type = 'datalist'
    else if (input.tagName === 'PROGRESS') type = 'progress'
    else if (input.tagName === 'METER') type = 'meter'
    else type = input.type

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

      if (preset !== undefined) inputValue = preset
    }

    if (inputValue === undefined) {
      const stringType = Random.mapInputTypeStringOption[type] ?? 'string'
      const minlength = input.getAttribute('minlength')
        ? Number.parseInt((input.getAttribute('minlength') as string))
        : undefined
      const maxlength = input.getAttribute('maxlength')
        ? Number.parseInt((input.getAttribute('maxlength') as string))
        : undefined

      inputValue = Random.gen(stringType, { min: minlength, max: maxlength })
    }

    return inputValue
  }

  public static getData(): Data
  {
    return Random.data
  }

  private initPreset(): void {
    this.preset = {}
    for (const key in Random.data) {
      if (key !== 'location') {
        this.preset[key] = Random.getRandomItem(Random.data[key] as string[])
      } else {
        this.preset = { ...this.preset, ...Random.getRandomItem(Random.data.location as object[]) }
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

  private genPresetEmail(): string {
    // eslint-disable-next-line @stylistic/max-len
    return `${this.preset.firstname.toLocaleLowerCase()}.${this.preset.lastname.toLocaleLowerCase()}@${this.preset.company.toLocaleLowerCase().replace(/\W/g, '')}.${this.preset.tld}`
  }

  private genPresetUsername(): string {
    return `${this.preset.firstname}_${this.preset.lastname}`.toLowerCase()
  }

  private genPresetPassword(): string {
    const mapChars: Record<string, string> = {
      a: '4', e: '3', g: '9', i: '1', l: '7', s: '5', z: '2',
    }
    const base = `${this.preset.username}_isnotasecurepwd`
    const string = [...base].map(char => {
      return mapChars[char] ?? char
    }).map(char => {
      return Random.genBool() ? char.toLocaleUpperCase() : char
    }).join('')

    return string
  }

  private genPresetAge(): string {
    return (Math.floor(
      (Date.now() - new Date(this.preset.birthdate).getTime()) / 3.155_76e+10)
    ).toString()
  }

  private genPresetUrl(): string {
    // eslint-disable-next-line @stylistic/max-len
    return `https://www.${this.preset.company.toLocaleLowerCase().replace(/\W/g, '')}.${this.preset.tld}`
  }

  private genPresetBirthdate(): string {
    const date = new Date()
    const years = date.getFullYear()
    const randomYear = years - Random.genInt(21, 100)
    const randomMonth = Random.genInt(0, 11)
    const randomDay = Random.genInt(1, 31)
    const birthdate = new Date(randomYear, randomMonth, randomDay).toISOString().split('T')[0]

    return birthdate
  }

  private genPresetDatetime(): string {
    return Random.getDatetime()
  }

  private genPresetDate(): string {
    return Random.getDate(this.preset.datetime)
  }

  private genPresetMonth(): string {
    return Random.getMonth(this.preset.datetime)
  }

  private genPresetWeek(): string {
    return Random.getWeek(this.preset.datetime)
  }

  private genPresetTime(): string {
    return Random.getTime(this.preset.datetime)
  }

  private searchPreset({ type, ...attrs }: { type: string, [key: string]: string }): string | void {
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

    const mappedType = Random.mapInputTypePreset[camelType]
    if (mappedType) {
      return this.preset[mappedType]
    }
  }

  private genSelect(input: AutofillInput): number | number[] {
    const selectType = input.type
    const options = input.querySelectorAll('option')
    const optionsIndexes = [...options]
      .map((option, index) => option.value.length > 0 ? index : undefined)
      .filter((index): index is number => index !== undefined)
    const optionsIndexesCount = optionsIndexes.length
    if (selectType === 'select-one') {
      return optionsIndexes[Random.genInt(0, optionsIndexes.length - 1)]
    } else {
      const minOptionToSelect = Random.genInt(2, optionsIndexesCount)
      let randomOptionsIndexes: number[] = []

      while (randomOptionsIndexes.length < minOptionToSelect) {
        const randomOptionIndex = optionsIndexes[Random.genInt(0, optionsIndexesCount - 1)]
        if (!randomOptionsIndexes.includes(randomOptionIndex)) {
          randomOptionsIndexes = [...randomOptionsIndexes, randomOptionIndex]
        }
      }

      return randomOptionsIndexes
    }
  }

  private genCheckbox(input: AutofillInput): boolean | number[] {
    const reg = /\[/g
    const name = input.getAttribute('name')
    if (name && reg.test(name)) {
      const checkboxesIndexes = [
        ...document.querySelectorAll(`input[name^=${name.split('[')[0]}\\[]`),
      ].map((_, index) => index)

      const minCheckboxToCheck = Random.genInt(1, checkboxesIndexes.length)
      let randomCheckboxesIndexes: number[] = []

      while (randomCheckboxesIndexes.length < minCheckboxToCheck) {
        const randomCheckboxIndex = checkboxesIndexes[
          Random.genInt(0, checkboxesIndexes.length - 1)
        ]

        if (!randomCheckboxesIndexes.includes(randomCheckboxIndex)) {
          randomCheckboxesIndexes = [...randomCheckboxesIndexes, randomCheckboxIndex]
        }
      }

      return randomCheckboxesIndexes
    } else {
      return Random.genBool()
    }
  }

  private genRadio(input: AutofillInput): number | void {
    const name = input.getAttribute('name') ?? ''
    const radios = document.querySelectorAll(`[name^=${name.split('[')[0]}]`)
    if (radios.length > 0) {
      const radioIndexes = [...radios].map((_, index) => index)

      return radioIndexes[Random.genInt(0, radioIndexes.length - 1)]
    }
  }

  private genDatalist(input: AutofillInput): number | void {
    const options = document.querySelectorAll(`datalist#${input.getAttribute('list')} option`)
    if (options.length > 0) {
      const optionsIndexes = [...options].map((_, index) => index)

      return optionsIndexes[Random.genInt(0, optionsIndexes.length - 1)]
    }
  }

  private genRange(input: AutofillInput): number {
    const min = Number.parseInt(input.getAttribute('min') ?? '0')
    const max = Number.parseInt(input.getAttribute('max') ?? '100')

    return Random.genInt(min, max)
  }

  private genNumber(input: AutofillInput): number {
    const min = Number.parseInt(input.getAttribute('min') ?? '-1000')
    const max = Number.parseInt(input.getAttribute('max') ?? '1000')

    return Random.genInt(min, max)
  }

  private genProgress(input: AutofillInput): number {
    const max = Number.parseInt(input.getAttribute('max') ?? '100')

    return Random.genInt(0, max)
  }

  private genMeter(input: AutofillInput): number {
    return this.genNumber(input)
  }

  private genDate(input: AutofillInput, type = 'date'): string | undefined {
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

  private genColor(): string {
    return `#${Math.floor(Math.random() * 16_777_215).toString(16).padStart(6, '0')}`
  }

  private static genEmail(options: GenOptions): string {
    const length = options?.len !== undefined && options.len >= 5
      ? options.len
      : 5

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

  private static genString(options: GenOptions): string {
    const chars = options.chars as string
    const length = options.len ?? 0

    let randomString = ''

    for (let i = 0; i < length; i++) {
      randomString += chars[Math.floor(Math.random() * chars.length)]
    }

    return randomString
  }

  private static getAttributesByKeyValue(input: AutofillInput): Record<string, string> {
    const attrNames = ['name', 'id', 'class']

    const attributesByKV = attrNames.reduce((acc: Record<string, string>, key) => {
      const attrValue = input.getAttribute(key)
      if (attrValue !== null) {
        acc[key] = attrValue
      }

      return acc
    }, {})

    return attributesByKV
  }

  private static genInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1) + min)
  }

  private static genBool(): boolean {
    return Math.random() < 0.5
  }

  private static genDateBetween(start: string, end: string): Date {
    const startDate = new Date(start)
    const endDate = new Date(end)

    return new Date(startDate.getTime() + Math.random() * (endDate.getTime() - startDate.getTime()))
  }

  private static genDate(start: string, end: string): string {
    const date = Random.genDateBetween(start, end)
    const dateFormat = Random.getDate(Random.getDatetime(date))

    return dateFormat
  }

  private static genDatetime(start: string, end: string): string {
    const date = Random.genDateBetween(start, end)

    return Random.getDatetime(date)
  }

  private static genMonth(start: string, end: string): string {
    return Random.getMonth(Random.genDate(start, end))
  }

  private static genWeek(start: string, end: string): string {
    return Random.getWeek(Random.genDate(start, end))
  }

  private static genTime(start: string, end: string): string {
    return Random.getTime(Random.genDatetime(start, end))
  }

  private static getDatetime(date?: Date): string {
    if (date === undefined) {
      date = new Date()
    }

    const datetime = date.toISOString().split('.')[0]

    return datetime
  }

  private static getDate(datetime: string): string {
    return datetime.split('T')[0]
  }

  private static getMonth(datetime: string): string {
    const date = new Date(datetime)

    return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`
  }

  private static getWeek(datetime: string): string {
    const date = new Date(datetime)

    return `${date.getFullYear()}-W${Random.getWeekNumber(date).toString().padStart(2, '0')}`
  }

  private static getTime(datetime: string): string {
    return datetime.split('T')[1]
  }

  private static getWeekNumber(date: Date): string {
    const startDate = new Date(date.getFullYear(), 0, 1)
    const days = Math.floor((date.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000))
    const weekNumber = Math.ceil(days / 7)

    return weekNumber.toString()
  }

  private static getRandomItem<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)]
  }
}

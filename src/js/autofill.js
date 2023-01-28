import * as utils from './utils.js'
import Random from './random.js'
import Overlay from './overlay.js'

export class Autofill {
  autofillInfos = {
    author: '0kyn',
    version: '1.2.2',
    name: 'Autofill.js',
    github: 'https://github.com/0kyn/autofill-js',
    npm: 'https://www.npmjs.com/package/autofill-js'
  }

  autofillConfig = {
    autofill: true, // enable autofill
    autosubmit: false, // emit submit event after form's inputs filling
    camelize: false, // e.g. allow input property 'inputName' to handle 'input-name' or 'input_name'
    events: [], // trigger events after value set
    generate: false, // generate random value where an input's value is formatted as follow {{ password|len:16 }}
    inputAttributes: ['data-autofill', 'name', 'id', 'class'], // input key attributes targets ordered from the highest priority to the lowest
    inputAttributesSkip: [], // skip autofilling when input has specific attribute. e.g. 'disabled' or 'readonly',
    inputTypesSkip: [], // skip autofilling when input has specific type
    formsSelectors: ['form'], // default form query selector
    inputsSelectors: ['input', 'textarea', 'select', 'progress', 'meter'], // default inputs support
    maxlength: false, // truncate if value length > maxlength attribute
    minlength: false, // fill with random char if value length < minlength attribute
    overlay: false, // display an overlay with config infos & reset/autofill buttons
    override: true, // override already defined input value
    random: false, // if an input value is not defined it fills with a random value
    randomPreset: false, // if random === true && randomPreset === true then it tries to find a significant preset
    url: false // JSON config file url
  }

  constructor (formsSelectors, options) {
    this.infos = { ...this.autofillInfos }
    this.config = { ...this.autofillConfig }

    this.initOptions(formsSelectors, options)

    if (this.hasOptions()) {
      this.initFormsOptions()
      this.initConfig()
    }
  }

  async init () {
    if (this.config.url) {
      const configFile = await this.loadFromJson(this.config.url)
      const jsonFormsOptions = { forms: configFile.forms }
      const formsSelectors = Object.keys(configFile.forms)
      this.config = { ...this.autofillConfig, ...configFile.config, ...this.options }
      this.config.formsSelectors = formsSelectors
      this.formsOptions = this.mergeJsonFormsOptions(jsonFormsOptions, this.formsOptions)
    }

    if (this.hasFormsOptions()) {
      this.initForms()
    }

    this.initDomForms()

    if (this.config.autofill) {
      this.fill()
    }
    if (this.config.overlay) {
      const overlay = new Overlay(this)
      overlay.show()
    }

    return this
  }

  async loadFromJson (url) {
    const response = await fetch(url)
    const string = await response.text()

    try {
      const object = JSON.parse(string)

      return object
    } catch (error) {
      console.error(error)
    }
  }

  mergeJsonFormsOptions (...args) {
    const target = {}

    const merger = (obj) => {
      for (const prop in obj) {
        if (utils.hasProp(prop, obj)) {
          if (Object.prototype.toString.call(obj[prop]) === '[object Object]') {
            target[prop] = this.mergeJsonFormsOptions(target[prop], obj[prop])
          } else {
            target[prop] = obj[prop]
          }
        }
      }
    }

    for (let i = 0; i < args.length; i++) {
      merger(args[i])
    }

    return target
  };

  initOptions (formsSelectors, options) {
    if (typeof formsSelectors === 'object') {
      this.options = formsSelectors
    } else {
      this.options = options ?? {}
    }

    this.initFormsSelectors(formsSelectors)
  }

  initFormsSelectors (options) {
    if (typeof options !== 'undefined') {
      if (typeof options === 'string') {
        this.options.formsSelectors = options.split(',').map(item => item.trim())
      } else if (Array.isArray(options)) {
        this.options.formsSelectors = options
      } else if (options.forms) {
        this.options.formsSelectors = Object.keys(options.forms)
      } else if (options.formsSelectors) {
        this.initFormsSelectors(options.formsSelectors)
      }
    }
  }

  initConfig () {
    for (const key in this.options) {
      const option = this.options[key]

      if (utils.hasProp(key, this.autofillConfig)) {
        this.config[key] = option
      }
    }
  }

  initFormsOptions () {
    const formsOptions = {}

    for (const key in this.options) {
      const option = this.options[key]

      if (!utils.hasProp(key, this.autofillConfig)) {
        formsOptions[key] = option
      }
    }
    if (Object.keys(formsOptions).length > 0) {
      this.formsOptions = formsOptions
    }
  }

  initDomForms () {
    const domInputs = document.querySelectorAll(this.config.inputsSelectors)
    let lastForm
    this.domForms = []

    let i = -1
    domInputs.forEach((input) => {
      const form = input.closest('form')
      const condHasForm = form !== null && lastForm !== form
      const condOrphan = form === null && lastForm !== null

      if (condHasForm || condOrphan) {
        i++
        this.domForms[i] = { form, inputs: [] }
      }

      lastForm = form
      this.domForms[i].inputs = [...this.domForms[i].inputs, input]
    })
  }

  initForms () {
    const forms = {}

    this.config.formsSelectors.forEach(formsSelector => {
      let inputs = {}

      if (this.formsOptions.inputs) {
        inputs = this.formsOptions.inputs
      } else if (!this.formsOptions.forms) {
        inputs = this.formsOptions
      } else if (this.formsOptions.forms[formsSelector]) {
        const form = this.formsOptions.forms[formsSelector]
        forms[formsSelector] = form
        inputs = form.inputs ?? form
      }

      forms[formsSelector] = { ...forms[formsSelector], inputs }
    })

    this.forms = forms
  }

  getFormConfig (formSelector) {
    const config = { ...this.forms[formSelector], formSelector }
    const formConfig = { ...this.config, ...config }
    delete formConfig.inputs

    return formConfig
  }

  submit (form, timeout = 1000) {
    setTimeout(() => {
      const event = new CustomEvent('submit', { cancelable: true })
      form.dispatchEvent(event)
    }, timeout)
  }

  fill () {
    if (Object.keys(this.domForms).length === 0) {
      console.log('No forms found in the HTML DOM')
      console.log('Handle inputs')
      this.handleForm(document)
    } else {
      this.domForms.forEach(dForm => this.handleForm(dForm))
    }
  }

  handleForm (dForm) {
    let { form, inputs } = dForm
    const formSelector = this.getFormSelector(form)

    let config = this.config

    if (this.hasFormsOptions()) {
      if (typeof formSelector === 'undefined') {
        return false
      }

      config = this.getFormConfig(formSelector)

      if (config.random) {
        this.randomInstance = new Random({ withPreset: config.randomPreset })
      }
    } else {
      this.randomInstance = new Random({ withPreset: true })
    }

    inputs = this.inputsConfigFilter(inputs, config)

    const defaultInputs = this.getDefaultInputs(inputs)
    const fileInputs = this.getFileInputs(inputs)
    const checkboxesGroup = this.getCheckboxesGroup(inputs)
    const radiosGroup = this.getRadios(inputs)
    const selects = this.getSelects(inputs)
    const datalists = this.getDatalists(inputs)

    defaultInputs.forEach(input => this.handleDefaultInput(input, config))
    fileInputs.forEach(input => this.handleFileInput(input, config))
    checkboxesGroup.forEach(group => this.handleCheckboxGroup(group, config))
    radiosGroup.forEach(group => this.handleRadioGroup(group, config))
    selects.forEach(input => this.handleSelect(input, config))
    datalists.forEach(input => this.handleDatalist(input, config))

    if (config?.autosubmit) {
      this.submit(form)
    }
  }

  getAfConfigByInput (input, config) {
    if (this.hasFormsOptions() && this.hasFormAndInputs(config)) {
      const afKey = this.getAfKey(input, config)
      if (typeof afKey !== 'undefined') return this.forms[config.formSelector].inputs[afKey]
    }

    return []
  }

  getAfValue (afKey, config) {
    const afInput = this.forms[config.formSelector].inputs[afKey]
    if (typeof afInput === 'object' && utils.hasProp('value', afInput)) return afInput.value

    return afInput
  }

  getAfKey (input, config) {
    for (let i = 0; i < this.config.inputAttributes.length; i++) {
      const inputAttrName = this.config.inputAttributes[i]
      const inputAttrValue = input.getAttribute(inputAttrName) ?? undefined

      if (typeof inputAttrValue !== 'undefined') {
        const afKey = inputAttrValue.split('[')[0]
        if (typeof this.getAfValue(afKey, config) !== 'undefined') {
          return afKey
        } else if (config.camelize) {
          const camelKey = utils.toCamelCase(afKey)
          if (typeof this.getAfValue(camelKey, config) !== 'undefined') {
            return camelKey
          }
        }
      }
    }
  }

  getInputAfValue (input, config) {
    let value

    if (this.hasFormsOptions() && this.hasFormAndInputs(config)) {
      const afKey = this.getAfKey(input, config)

      if (typeof afKey !== 'undefined') {
        value = this.getAfValue(afKey, config)

        const stringToGen = this.needToGenerate(value, config)
        if (stringToGen) {
          value = Random.parse(stringToGen)
        }
      } else {
        if (config.random) {
          value = this.randomInstance.genInputValue(input)
        }
      }
    } else {
      // zero config
      value = this.randomInstance.genInputValue(input)
    }

    if (config.minlength) {
      const minlength = Number.parseInt(input.getAttribute('minlength'))
      if (!Number.isNaN(minlength) && value.length < minlength) {
        value += Random.gen('string', { len: minlength - value.length })
      }
    }

    if (config.maxlength) {
      const maxlength = Number.parseInt(input.getAttribute('maxlength'))
      if (!Number.isNaN(maxlength) && value.length > maxlength) {
        value = utils.truncate(value, maxlength)
      }
    }

    return value
  }

  handleDefaultInput (input, config) {
    if (config.override || input.value.length === 0) {
      const value = this.getInputAfValue(input, config)

      if (typeof value !== 'undefined') {
        this.setInputProp(input, { key: 'value', value }, config)
      }
    }
  }

  handleFileInput (input) {
    console.log(input, 'I can\'t handle you for now...')
  }

  handleCheckboxGroup (group, config) {
    this.handleCheckboxOrRadioGroups(group, config)
  }

  handleRadioGroup (group, config) {
    this.handleCheckboxOrRadioGroups(group, config)
  }

  handleCheckboxOrRadioGroups (group, config) {
    const input = group[0]

    if (!config.override) {
      const groupHasInputChecked = typeof group.find(input => input.checked) !== 'undefined'

      if (groupHasInputChecked) return
    }
    const values = utils.asArray(this.getInputAfValue(input, config))

    values.forEach((value, vIndex) => {
      group.forEach((input, index) => {
        if (typeof value === 'string' && input.value === value) {
          this.setInputProp(input, { key: 'checked', value: true }, config)
        } else if (typeof value === 'number' && index === value) {
          this.setInputProp(input, { key: 'checked', value: true }, config)
        } else if (typeof value === 'boolean' && index === vIndex) {
          this.setInputProp(input, { key: 'checked', value }, config)
        }
      })
    })
  }

  handleSelect (input, config) {
    const options = input.querySelectorAll('option')
    if (!config.override) {
      const optionsHasSelected = typeof [...options].find(option => option.selected) !== 'undefined'

      if (optionsHasSelected) return
    }
    const values = utils.asArray(this.getInputAfValue(input, config))

    values.forEach((value) => {
      if (typeof value === 'string') {
        const option = [...options].find(option => this.setInputProp(option, { key: 'selected', value: option.value }))
        if (typeof option !== 'undefined') {
          this.setInputProp(option, { key: 'selected', value: true })
        }
      } else if (typeof value === 'number') {
        this.setInputProp(options[value], { key: 'selected', value: true })
      }
    })

    this.dispatchInputEvents(input, config)
  }

  handleDatalist (input, config) {
    if (config.override || input.value.length === 0) {
      const value = this.getInputAfValue(input, config)
      if (typeof value === 'string') {
        this.setInputProp(input, { key: 'value', value }, config)
      } else if (typeof value === 'number') {
        const options = document.querySelectorAll(`datalist#${input.getAttribute('list')} option`)
        if (options !== null) {
          this.setInputProp(input, { key: 'value', value: options[value].value }, config)
        }
      }
    }
  }

  needToGenerate (value, config) {
    const reg = /{{\s(.+?)\s}}/

    if (config.generate && typeof value === 'string' && reg.test(value)) {
      return value.match(reg)[1]
    }

    return false
  }

  getFormSelector (form) {
    const formsSelectors = this.config.formsSelectors

    for (let i = 0; i < formsSelectors.length; i++) {
      const formSelector = formsSelectors[i]
      const formSelectored = document.querySelector(formSelector)
      if (form === formSelectored) return formSelector
    }

    // @todo enhance specificity handling
    for (let i = 0; i < formsSelectors.length; i++) {
      const formSelector = formsSelectors[i]
      const formsSelectored = document.querySelectorAll(formSelector)
      for (let j = 0; j < formsSelectored.length; j++) {
        const formSelectored = formsSelectored[j]
        if (form === formSelectored) return formSelector
      }
    }
  }

  getDefaultInputs (inputs) {
    return inputs.filter(input => {
      const excludedInputTypes = ['checkbox', 'radio', 'file', 'reset', 'submit', 'button']
      const excludedAttributes = ['list']

      const condType = !excludedInputTypes.includes(input.type)
      const condAttr = utils.notContainsAttributes(input, excludedAttributes)

      return condType && condAttr
    })
  }

  getFileInputs (inputs) {
    return inputs.filter(input => input.type === 'file')
  }

  getCheckboxesGroup (inputs) {
    const reg = /(.+)\[/
    let checkboxesGroup = []

    for (let i = 0; i < inputs.length; i++) {
      const input = inputs[i]
      if (input.type !== 'checkbox') continue

      const attrValue = input.getAttribute('name')
      if (attrValue?.match(reg)) {
        const inputExists = utils.itemExists(input, checkboxesGroup)

        if (!inputExists) {
          const reg2 = new RegExp(`^${attrValue.match(reg)[1]}\\[`)
          const checkboxGroup = inputs.filter(input => input.type === 'checkbox' && reg2.test(input.getAttribute('name')))

          if (checkboxGroup.length > 0) {
            checkboxesGroup = [...checkboxesGroup, [...checkboxGroup]]
          }
        }
      } else {
        checkboxesGroup = [...checkboxesGroup, [input]]
      }
    }

    return checkboxesGroup
  }

  getSelects (inputs) {
    return inputs.filter(input => ['select-one', 'select-multiple'].includes(input.type))
  }

  getDatalists (inputs) {
    return inputs.filter(input => input.getAttribute('list') !== null)
  }

  getRadios (inputs) {
    let radios = []

    for (let i = 0; i < inputs.length; i++) {
      const input = inputs[i]
      const attrValue = input.getAttribute('name')
      const inputExists = utils.itemExists(input, radios)
      if (!inputExists) {
        const radioGroup = inputs.filter(input => input.type === 'radio' && input.getAttribute('name') === attrValue)
        if (radioGroup.length > 0) {
          radios = [...radios, [...radioGroup]]
        }
      }
    }

    return radios
  }

  hasOptions () {
    return typeof this.options !== 'undefined' && Object.keys(this.options).length > 0
  }

  hasFormsOptions () {
    return typeof this.formsOptions !== 'undefined'
  }

  hasFormAndInputs (formConfig) {
    return formConfig && this.forms[formConfig.formSelector] && this.forms[formConfig.formSelector].inputs
  }

  inputsConfigFilter (inputs, config) {
    return inputs.filter(input => {
      const condAttrs = utils.notContainsAttributes(input, config.inputAttributesSkip)
      const condTypes = utils.notContainsTypes(input, config.inputTypesSkip)
      const cond = condAttrs && condTypes

      return cond
    })
  }

  dispatchInputEvents (input, config) {
    const inputEvents = this.getAfConfigByInput(input, config)?.events ?? []
    const events = inputEvents.length > 0 ? inputEvents : config.events

    events.forEach(event => input.dispatchEvent(new Event(event, { cancelable: true })))
  }

  setInputProp (input, { key, value }, config) {
    input[key] = value
    if (typeof config !== 'undefined') {
      this.dispatchInputEvents(input, config)
    }
  }
}

export const autofill = (formsSelectors, options) => {
  return new Promise(resolve => {
    const af = new Autofill(formsSelectors, options)
    if (document.readyState === 'complete') {
      resolve(af.init())
    } else {
      window.addEventListener('load', () => {
        resolve(af.init())
      })
    }
  })
}

window.autofill = autofill

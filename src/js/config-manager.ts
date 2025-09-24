import * as utils from './utils'
import type {
  AutofillConfig,
  AutofillOptions,
  AutofillForms,
  AutofillForm,
  AutofillInfos,
} from './types/autofill.types'

export class ConfigManager {
  public readonly defaultConfig: Readonly<AutofillConfig> = {
    enable: true,
    overlay: false,
    url: false,
    formsSelectors: ['form'],
    validateInputAttributes: ['minlength', 'maxlength'],
    autosubmit: false,
    camelize: false,
    events: ['input', 'change'],
    generate: false,
    inputAttributes: ['data-autofill', 'name', 'id', 'class'],
    inputAttributesSkip: [],
    inputTypesSkip: [],
    inputsSelectors: ['input', 'textarea', 'select', 'progress', 'meter'],
    override: false,
    random: false,
    randomPreset: false,
    valueAttribute: true,
  }

  public readonly infos: Readonly<AutofillInfos> = {
    author: '0kyn',
    version: '2.0.0',
    name: 'Autofill.js',
    github: 'https://github.com/0kyn/autofill-js',
    npm: 'https://www.npmjs.com/package/autofill-js',
  }

  private _config: AutofillConfig

  private _forms: AutofillForms = {}

  private _options: AutofillOptions = {}

  constructor(options?: AutofillOptions) {
    this._options = options ?? {}
    this._config = { ...this.defaultConfig }

    if (options) {
      this.applyOptions(options)
    }
  }

  public get options(): Readonly<AutofillOptions> {
    return this._options
  }

  public get config(): Readonly<AutofillConfig> {
    return this._config
  }

  public get forms(): Readonly<AutofillForms> {
    return this._forms
  }

  public get isEnabled(): boolean {
    return this._config.enable
  }

  public applyOptions(options: AutofillOptions): void {
    this.validateOptions(options)

    const { inputs, forms, ...configOptions } = options

    this.validateConfigOptions(configOptions)

    this._config = {
      ...this._config,
      ...configOptions,
    }

    this._config.formsSelectors = this.buildFormsSelectors(forms)
    this._forms = this.buildForms(forms, inputs)
  }

  public async loadFromUrl(url: string): Promise<void> {
    if (!utils.isValidUrl(url)) {
      throw new Error(`Invalid URL: ${url}`)
    }

    try {
      const configFile = await utils.loadFromJson(url)
      const { inputs, forms, ...jsonConfig } = configFile as AutofillOptions

      this.validateConfigOptions(jsonConfig)

      this._config = {
        ...this.defaultConfig,
        ...jsonConfig,
      }

      this._config.formsSelectors = this.buildFormsSelectors(forms)

      const jsonForms = this.buildForms(forms, inputs)
      this._forms = this.mergeFormConfigs(jsonForms, this._forms)
    } catch (error) {
      console.error('Failed to load configuration from URL:', error)
      throw error
    }
  }

  public getFormConfig(formSelector?: string): AutofillConfig {
    let formConfig: AutofillForm = {}

    if (typeof formSelector === 'string' && this._forms && this._forms[formSelector]) {
      formConfig = { ...this._forms[formSelector] }
    }

    const combinedConfig = {
      ...this._config,
      ...formConfig,
    }

    delete combinedConfig.inputs

    return combinedConfig
  }

  public getInputConfig(
    formSelector?: string,
    inputKey?: string,
  ): AutofillConfig {
    const config = this.getFormConfig(formSelector)

    if (!this.hasFormWithInputs(formSelector) || !inputKey) {
      return config
    }

    const inputOptions = this.forms[formSelector]?.inputs?.[inputKey]
    const inputConfig = typeof inputOptions !== 'string' ? { ...inputOptions } : {}
    delete inputConfig?.value

    if (!utils.isObject(inputConfig)) {
      return config
    }

    return { ...config, ...inputConfig } as AutofillConfig
  }

  public findFormSelector(form: HTMLFormElement | null): string | undefined {
    if (!form || !this._config.formsSelectors) {
      return undefined
    }
    for (const formSelector of this._config.formsSelectors) {
      if (form === document.querySelector(formSelector)) {
        return formSelector
      }
    }

    for (const formSelector of this._config.formsSelectors) {
      const matchedForms = document.querySelectorAll(formSelector)
      if ([...matchedForms].includes(form)) {
        return formSelector
      }
    }

    return undefined
  }

  public hasFormWithInputs(formSelector?: string): formSelector is string {
    return typeof formSelector === 'string'
      && !!this._forms
      && !!this._forms[formSelector]
      && !!this._forms[formSelector]?.inputs
  }

  private buildFormsSelectors(forms?: AutofillForm): string[] {
    const formsSelectors = [...this._config.formsSelectors]
    if (forms === undefined) return formsSelectors

    Object.keys(forms).forEach(key => {
      key.split(',').forEach(split => {
        const trimed = split.trim()
        if (!formsSelectors.includes(trimed)) {
          formsSelectors.push(trimed)
        }
      })
    })

    return formsSelectors
  }

  private buildForms(formsOpt: any, inputsOpt: unknown): AutofillForms {
    this.validateOptions(inputsOpt)
    this.validateOptions(formsOpt)

    const forms: AutofillForms = {}

    const newFormOpts: Record<string, any> = {}
    Object.keys(formsOpt ?? {}).forEach(key => {
      key.split(',').forEach(split => {
        newFormOpts[split.trim()] = formsOpt[key]
      })
    })

    this._config.formsSelectors.forEach(formsSelector => {
      forms[formsSelector] = forms[formsSelector] || {}

      if (inputsOpt !== undefined) {
        forms[formsSelector].inputs = { ...inputsOpt }
      } else if (newFormOpts !== undefined) {
        forms[formsSelector] = (newFormOpts as AutofillForms)[formsSelector]
      }
    })

    return forms
  }

  private mergeFormConfigs(...sources: AutofillForms[]): AutofillForms {
    const target: AutofillForms = {}

    const deepMerge = (target: AutofillForms, source: AutofillForms): void => {
      for (const prop in source) {
        if (utils.hasProp(source, prop)) {
          const sourceProp = source[prop]

          if (utils.isObject(sourceProp)) {
            target[prop] = target[prop] || {} as AutofillForm
            deepMerge(
              target[prop] as unknown as AutofillForms,
              sourceProp as unknown as AutofillForms,
            )
          } else {
            target[prop] = sourceProp
          }
        }
      }
    }

    for (const source of sources) {
      if (source) {
        deepMerge(target, source)
      }
    }

    return target
  }

  private validateOptions(options: unknown): void {
    if (options !== undefined && !utils.isObject(options)) {
      throw new Error('Options must be a valid object or undefined.')
    }
  }

  private validateConfigOptions(config: unknown): void {
    if (!config) return

    const allowedKeys = Object.keys(this.defaultConfig)
    const providedKeys = Object.keys(config)
    const invalidKeys = providedKeys.filter(key => !allowedKeys.includes(key))

    if (invalidKeys.length > 0) {
      throw new Error(`Invalid config keys: ${invalidKeys.join(', ')}`)
    }
  }
}

/* eslint-disable @stylistic/max-len */
export interface AutofillInfos {
  author: string
  version: string
  name: string
  github: string
  npm: string
}

export interface AutofillConfig {
  enable: boolean // enable autofill
  overlay: boolean // display an overlay with config infos & reset/autofill buttons
  url: string | false // JSON config file url
  formsSelectors: string[] // form query selector
  validateInputAttributes: string[] // generated value must be valid according to inputs attributes ['type', 'minlength', 'maxlength', 'required']
  autosubmit: boolean // emit submit event after form's inputs filling
  camelize: boolean // e.g. allow input property 'inputName' to handle 'input-name' or 'input_name'
  events: string[] // trigger events after value set
  generate: boolean // generate random value where an input's value is formatted as follow {{ password|len?:16 }}
  inputAttributes: string[] // input key attributes targets ordered from the highest priority to the lowest
  inputAttributesSkip: string[] // skip autofilling when input has specific attribute. e.g. 'disabled' or 'readonly',
  inputTypesSkip: string[] // skip autofilling when input has specific type
  inputsSelectors: string[] // inputs support
  override: boolean // override already defined input value
  random: boolean // if an input value is not defined it fills with a random value
  randomPreset: boolean // if random === true && randomPreset === true then it tries to find a significant preset
  valueAttribute: true // handle value in html attribute
}

export type AutofillInputOptions = string | {
  [key in keyof Partial<AutofillConfig>]: AutofillConfig[key]
} & {
  value?: unknown
}

export interface AutofillInputsOptions {
  [key: string]: AutofillInputOptions
}

export type AutofillForm = {
  [key in keyof Partial<AutofillConfig>]: AutofillConfig[key]
} & {
  inputs?: AutofillInputsOptions
}

export interface AutofillForms {
  [key: string]: AutofillForm
}

export interface AutofillOptions extends Partial<AutofillConfig> {
  forms?: AutofillForms
  inputs?: AutofillInputsOptions
}

export type AutofillInput = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement

export interface AutofillDomForm {
  form: HTMLFormElement | null
  inputs: AutofillInput[]
}

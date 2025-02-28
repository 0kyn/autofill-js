import * as utils from './utils'

import { AutofillConfig, AutofillInput } from './types/autofill.types'
import { ConfigManager } from './config-manager'
import Random from './random'
import { TextInputHandler } from './handlers/text-handler'
import { SelectInputHandler } from './handlers/select-handler'
import { FileInputHandler } from './handlers/file-handler'
import { CheckboxRadioInputHandler } from './handlers/checkbox-radio-handler'
import { DatalistInputHandler } from './handlers/datalist-handler'
import { fireEvent } from './event'

export class FormProcessor {
  public formSelector?: string
  public config: AutofillConfig
  public randomInstance: Random

  constructor(
    private configManager: ConfigManager,
    private form: HTMLFormElement | null,
  ) {
    this.formSelector = this.configManager.findFormSelector(this.form)
    this.config = this.configManager.getFormConfig(this.formSelector)

    this.randomInstance = new Random({
      withPreset: this.config.random ? this.config.randomPreset : true,
    })
  }

  public process(inputs: AutofillInput[]): void
  {
    const filteredInputs = this.filterInputs(inputs, this.config)

    this.processAllInputs(filteredInputs, this.config, this.formSelector)

    if (this.config?.autosubmit && this.form !== null) {
      this.submitForm(this.form)
    }
  }

  private filterInputs(inputs: AutofillInput[], config: AutofillConfig): AutofillInput[] {
    return inputs.filter(input =>
      utils.notContainsAttributes(input, config.inputAttributesSkip)
      && utils.notContainsTypes(input, config.inputTypesSkip),
    )
  }

  private submitForm(form: HTMLFormElement, timeout = 1000): void {
    setTimeout(() => fireEvent(form, 'submit'), timeout)
  }

  private processAllInputs(
    inputs: AutofillInput[],
    config: AutofillConfig,
    formSelector?: string,
  ): void {
    const configManager = this.configManager
    const randomInstance = this.randomInstance
    this.getDefaultInputs(inputs).forEach(input => {
      new TextInputHandler(
        input, configManager, randomInstance, config, formSelector,
      ).handle()
    })

    this.getSelects(inputs).forEach(input => {
      new SelectInputHandler(
        input, configManager, randomInstance, config, formSelector,
      ).handle()
    })

    this.getCheckboxesGroup(inputs).forEach(group => {
      new CheckboxRadioInputHandler(
        /* @todo rewrite */group[0], configManager, randomInstance, config, formSelector,
      ).handle(group)
    })

    this.getRadios(inputs).forEach(group => {
      new CheckboxRadioInputHandler(
        group[0], configManager, randomInstance, config, formSelector,
      ).handle(group)
    })

    this.getDatalists(inputs).forEach(input => {
      new DatalistInputHandler(
        input, configManager, randomInstance, config, formSelector,
      ).handle()
    })

    this.getFileInputs(inputs).forEach(input => {
      new FileInputHandler(
        input, configManager, randomInstance, config, formSelector,
      ).handle()
    })
  }

  private getDefaultInputs(inputs: AutofillInput[]): (HTMLInputElement | HTMLTextAreaElement)[] {
    const excludedInputTypes = ['checkbox', 'radio', 'file', 'reset', 'submit', 'button']
    const excludedAttributes = ['list']

    return inputs.filter((input): input is (HTMLInputElement | HTMLTextAreaElement) => {
      return utils.notContainsTypes(input, excludedInputTypes)
        && utils.notContainsAttributes(input, excludedAttributes)
    })
  }

  private getFileInputs(inputs: AutofillInput[]): HTMLInputElement[] {
    return inputs.filter((input): input is HTMLInputElement => input.type === 'file')
  }

  private getCheckboxesGroup(inputs: AutofillInput[]): HTMLInputElement[][] {
    const nameGroupPattern = /(.+)\[/
    const checkboxGroups: HTMLInputElement[][] = []
    const processedInputs = new Set()

    for (const input of inputs) {
      if (input.type !== 'checkbox' || processedInputs.has(input)) continue

      const inputName = input.getAttribute('name')
      const nameMatch = inputName?.match(nameGroupPattern)

      if (nameMatch) {
        const groupNamePrefix = nameMatch[1]
        const groupNameRegex = new RegExp(`^${groupNamePrefix}\\[`)

        const checkboxGroup = inputs.filter(
          (input): input is HTMLInputElement =>
            input.type === 'checkbox'
            && groupNameRegex.test(input?.getAttribute('name') || ''),
        )

        if (checkboxGroup.length > 0) {
          checkboxGroups.push(checkboxGroup)
          checkboxGroup.forEach(input => processedInputs.add(input))
        }
      } else {
        checkboxGroups.push([input as HTMLInputElement])
        processedInputs.add(input)
      }
    }

    return checkboxGroups
  }

  private getSelects(inputs: AutofillInput[]): HTMLSelectElement[] {
    return inputs.filter(
      (input): input is HTMLSelectElement =>
        input.type === 'select-one' || input.type === 'select-multiple',
    )
  }

  private getDatalists(inputs: AutofillInput[]): HTMLInputElement[] {
    return inputs.filter(
      (input): input is HTMLInputElement => input.getAttribute('list') !== null,
    )
  }

  private getRadios(inputs: AutofillInput[]): HTMLInputElement[][] {
    const radioGroups: HTMLInputElement[][] = []
    const processedNames = new Set<string>()

    for (const input of inputs) {
      if (input.type !== 'radio') continue

      const name = input.getAttribute('name')
      if (!name || processedNames.has(name)) continue

      const radioGroup = inputs.filter(
        (input): input is HTMLInputElement =>
          input.type === 'radio' && input.getAttribute('name') === name,
      )

      if (radioGroup.length > 0) {
        radioGroups.push(radioGroup)
        processedNames.add(name)
      }
    }

    return radioGroups
  }
}

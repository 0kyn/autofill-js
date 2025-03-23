import { ConfigManager } from '../config-manager'
import Random from '../random'
import { fireEvent } from '../event'

import {
  AutofillConfig,
  AutofillInput,
  AutofillInputsOptions,
  AutofillOptions,
} from '../types/autofill.types'
import * as utils from '../utils'

export class InputHandler {
  public config: AutofillConfig

  constructor(
    protected input: AutofillInput,
    private configManager: ConfigManager,
    private randomInstance: Random,
    formConfig: AutofillConfig,
    protected formSelector?: string,
  ) {
    const identifier = this.getInputIdentifier(input, formConfig)
    this.config = this.configManager.getInputConfig(formSelector, identifier)
  }

  protected generateInputValue(
    input: AutofillInput,
    config: AutofillConfig,
  ): unknown {
    let value

    if (this.configManager.hasFormWithInputs(this.formSelector)) {
      const identifier = this.getInputIdentifier(input, config)

      if (identifier) {
        value = this.getInputValue(identifier, this.formSelector)

        const generationTemplate = this.needsGeneration(value, config)
        if (generationTemplate) {
          value = Random.parse(generationTemplate)
        }
      } else if (config.random) {
        value = this.randomInstance?.genInputValue(input)
      }
    } else {
      value = this.randomInstance?.genInputValue(input)
    }

    return this.validateValueConstraints(input, value, config)
  }

  protected setInputProperty(
    input: AutofillInput | HTMLOptionElement,
    property: { key: 'selected' | 'checked' | 'value' | 'files', value: unknown },
    config: AutofillConfig,
  ): void {
    this.setProperty(input, property, config)

    config.events.forEach(eventName => fireEvent(input, eventName))
  }

  private needsGeneration(value: unknown, config: AutofillConfig): false | string {
    if (!config.generate || typeof value !== 'string') return false

    const generationPattern = /{{\s(.+?)\s}}/
    const match = value.match(generationPattern)

    return match && match[1] ? match[1] : false
  }

  private validateValueConstraints(
    input: AutofillInput,
    value: unknown,
    config: AutofillConfig,
  ): unknown {
    if (typeof value !== 'string') return value

    if (config.validateInputAttributes.includes('minlength')) {
      const minlength = Number.parseInt(input?.getAttribute('minlength') || '-1', 10)
      if (minlength > 0 && value.length < minlength) {
        value += Random.gen('string', { len: minlength - value.length })
      }
    }

    if (config.validateInputAttributes.includes('maxlength')) {
      const maxlength = Number.parseInt(input.getAttribute('maxlength') || '-1', 10)
      if (maxlength > 0 && value.length > maxlength) {
        value = utils.truncate(value, maxlength)
      }
    }

    return value
  }

  private getInputValue(identifier: string, formSelector: string): unknown {
    if (!this.configManager.hasFormWithInputs(formSelector) || !identifier) {
      return undefined
    }
    const inputs = this.configManager.forms[formSelector].inputs as AutofillInputsOptions
    const input = inputs[identifier]

    if (utils.isObject(input) && utils.hasProp(input as object, 'value')) {
      return input.value
    }

    return input
  }

  private getInputIdentifier(
    input: AutofillInput,
    config: AutofillOptions,
  ): string | undefined {
    const { inputAttributes } = config

    if (!inputAttributes || !this.formSelector) return undefined

    for (const attrName of inputAttributes) {
      const attrValue = input.getAttribute(attrName)
      if (!attrValue) continue

      const baseKey = attrValue.split('[')[0]

      if (this.getInputValue(baseKey, this.formSelector) !== undefined) {
        return baseKey
      }

      if (config.camelize) {
        const camelKey = utils.toCamelCase(baseKey)
        if (this.getInputValue(camelKey, this.formSelector) !== undefined) {
          return camelKey
        }
      }
    }

    return undefined
  }

  private setProperty = (
    input: AutofillInput | HTMLOptionElement,
    property: { key: 'selected' | 'checked' | 'value' | 'files', value: unknown },
    config: AutofillConfig,
  ): void => {
    const { key, value } = property

    switch (key) {
      case 'selected':
        if ('selected' in input) {
          (input as HTMLOptionElement).selected = Boolean(value)
        }
        break

      case 'checked':
        if ('checked' in input) {
          (input as HTMLInputElement).checked = Boolean(value)
        }
        break

      case 'files':
        if ('files' in input) {
          (input as HTMLInputElement).files = value as FileList
        }
        break

      case 'value':
        if ('value' in input) {
          input.value = String(value === null ? '' : value)
          if (config.valueAttribute) input.setAttribute('value', input.value)
        }
        break
    }
  }
}

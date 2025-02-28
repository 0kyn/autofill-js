import { InputHandler } from './handler'
import { asArray } from '../utils'

export class CheckboxRadioInputHandler extends InputHandler {
  public handle(
    group: HTMLInputElement[],
  ): void {
    const config = this.config
    const input = group[0]

    if (!config.override) {
      const anyChecked = group.some(input => input.checked)
      if (anyChecked) return
    }

    const values = asArray(this.generateInputValue(input, config))

    values.forEach((value, valueIndex) => {
      group.forEach((input, inputIndex) => {
        let shouldCheck = false

        if (typeof value === 'string' && input.value === value) {
          shouldCheck = true
        } else if (typeof value === 'number' && inputIndex === value) {
          shouldCheck = true
        } else if (typeof value === 'boolean' && inputIndex === valueIndex) {
          shouldCheck = value
        }

        if (shouldCheck) {
          this.setInputProperty(input, { key: 'checked', value: true }, config)
        }
      })
    })
  }
}

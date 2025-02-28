import { InputHandler } from './handler'
import { asArray } from '../utils'

export class SelectInputHandler extends InputHandler {
  public handle(): void {
    const input = this.input
    const config = this.config
    const options = [...input.querySelectorAll('option')]

    if (!config.override && options.some(option => option.selected)) {
      return
    }

    const values = asArray(this.generateInputValue(input, config))

    values.forEach((value) => {
      if (typeof value === 'string') {
        const option = options.find(option => option.value === value)
        if (option) {
          this.setInputProperty(option, { key: 'selected', value: true }, config)
        }
      } else if (typeof value === 'number' && value >= 0 && value < options.length) {
        this.setInputProperty(options[value], { key: 'selected', value: true }, config)
      }
    })
  }
}

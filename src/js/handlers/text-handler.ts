import { InputHandler } from './handler'

export class TextInputHandler extends InputHandler {
  public handle(): void {
    const input = this.input
    const config = this.config
    const shouldFill = this.config.override
      || !input.value?.length
      || (input.type === 'range' && input.value === '50')
      || (input.type === 'color' && input.value === '#000000')

    if (!shouldFill) return

    const value = this.generateInputValue(input, config)

    if (value !== undefined) {
      this.setInputProperty(input, { key: 'value', value }, config)
    }
  }
}

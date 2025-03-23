import { InputHandler } from './handler'

export class DatalistInputHandler extends InputHandler {
  public handle(): void {
    const input = this.input
    const config = this.config

    if (!config.override && input.value.length > 0) {
      return
    }

    const value = this.generateInputValue(input, config)

    if (typeof value === 'string') {
      this.setInputProperty(input, { key: 'value', value }, config)
    } else if (typeof value === 'number') {
      const listId = input.getAttribute('list')
      if (!listId) return

      const options = document.querySelectorAll(`datalist#${listId} option`)
      if (options.length > value) {
        this.setInputProperty(
          input,
          { key: 'value', value: (options[value] as HTMLOptionElement).value },
          config,
        )
      }
    }
  }
}

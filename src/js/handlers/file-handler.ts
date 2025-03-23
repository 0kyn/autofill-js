import { InputHandler } from './handler'

export class FileInputHandler extends InputHandler {
  public handle(): void {
    const input = this.input
    const config = this.config
    const file = new File(['file content'], 'test.txt', { type: 'text/plain' })
    const dataTransfer = new DataTransfer()
    dataTransfer.items.add(file)

    this.setInputProperty(input, { key: 'files', value: dataTransfer.files }, config)
  }
}

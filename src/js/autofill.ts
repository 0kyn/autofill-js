import * as utils from './utils'
import Random from './random'
import Overlay from './overlay'
import { ConfigManager } from './config-manager'
import type {
  AutofillOptions,
  AutofillDomForm,
  AutofillInfos,
} from './types/autofill.types'
import { FormProcessor } from './form-processor'

declare global {
  interface Window {
    autofill?: (options?: AutofillOptions) => Promise<Autofill>
  }
}

export class Autofill {
  public configManager: ConfigManager
  public domForms: AutofillDomForm[] = []
  public randomInstance?: Random

  constructor(public readonly options?: AutofillOptions) {
    this.configManager = new ConfigManager(options)
  }

  public get infos(): AutofillInfos {
    return this.configManager.infos
  }

  public async init(): Promise<Autofill> {
    if (!this.configManager.isEnabled) {
      console.warn('Autofill.js is disabled')

      return this
    }

    const { url } = this.configManager.config
    if (typeof url === 'string' && utils.isValidUrl(url)) {
      await this.configManager.loadFromUrl(url)
    }

    this.initDomForms()
    this.fill()

    if (this.configManager.config.overlay) {
      new Overlay(
        this,
        this.configManager,
        this.domForms,
      ).init()
    }

    return this
  }

  private initDomForms(): void {
    const { inputsSelectors } = this.configManager.config
    if (!inputsSelectors) return

    const selector = inputsSelectors.join(',')
    const domInputs: NodeListOf<HTMLInputElement> = document.querySelectorAll(selector)
    this.domForms = []

    domInputs.forEach(input => {
      const form = input.closest('form')
      const existingDomForm = this.domForms.find(domForm => domForm.form === form)

      if (existingDomForm) {
        existingDomForm.inputs.push(input)
      } else {
        this.domForms.push({ form, inputs: [input] })
      }
    })
  }

  private processForm(domForm: AutofillDomForm): void {
    const { form, inputs } = domForm
    const formProcessor = new FormProcessor(this.configManager, form)
    formProcessor.process(inputs)
  }

  public fill(): void {
    if (this.domForms.length === 0) {
      console.log('No input found in the HTML DOM')

      return
    }

    this.domForms.forEach(domForm => this.processForm(domForm))
  }
}

export const autofill = (options?: AutofillOptions): Promise<Autofill> => {
  return new Promise(resolve => {
    const instance = new Autofill(options)

    if (document.readyState === 'complete') {
      resolve(instance.init())
    } else {
      window.addEventListener('load', () => {
        resolve(instance.init())
      })
    }
  })
}

window.autofill = autofill

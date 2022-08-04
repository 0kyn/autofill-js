export default class Overlay {
  constructor (autofillInstance) {
    this.autofill = autofillInstance
  }

  show () {
    const autofill = this.autofill

    document.querySelector('body').style.paddingTop = '35px'

    const html = `
      <div class="autofill-overlay">
        <div class="autofill-overlay-brand">
          <span class="autofill-overlay-name">${autofill.infos.name}</span>
          <span class="autofill-overlay-version">${autofill.infos.version}</span>
        </div>
        <div class="autofill-overlay-buttons">
          <button type="button" class="js-btn-infos">${Overlay.icon('information-circle-outline')}</button>
          <button type="button" class="js-btn-autofill">${Overlay.icon('play-outline')}</button>
          <button type="button" class="js-btn-reset">${Overlay.icon('reload-outline')}</button>
        </div>
        <div class="autofill-overlay-links">
          <a class="npm" href="${autofill.infos.npm}" title="NPM package">${Overlay.icon('npm')}</a>
          <a class="github" href="${autofill.infos.github}" title="Github repository">${Overlay.icon('github')}</a>
        </div>
      </div>
      `
    document.body.insertAdjacentHTML('beforeend', html)

    document.querySelector('.js-btn-reset').addEventListener('click', () => {
      this.autofill.domForms.forEach(domForm => {
        domForm.form.reset()
        domForm.inputs.forEach(input => {
          input.checked = false
        })
      })
    })

    document.querySelector('.js-btn-autofill').addEventListener('click', () => {
      this.autofill.fill()
    })

    document.querySelector('.js-btn-infos').addEventListener('click', () => {
      const config = { ...this.autofill.config }
      const forms = { ...this.autofill.forms }

      const groupTitleStyle = 'color: #81aece;'
      const configTitleStyle = 'color: #b24bd6;'
      const consoleLogKeyStyle = 'color: #cf7b3a; font-weight: 600;'

      console.log(`%cAutofill.js - v${this.autofill.infos.version}`, `
        padding: 0.5rem 1.5rem;
        color: #212529;
        background-color: #81aece;
      `)

      console.groupCollapsed('%cAutofill Instance', groupTitleStyle)
      console.log(this.autofill)
      console.groupEnd()

      console.groupCollapsed('%cInfos', groupTitleStyle)
      console.table(this.autofill.infos)
      console.groupEnd()

      // BEGIN config
      console.groupCollapsed('%cConfig', groupTitleStyle)

      console.groupCollapsed('%cDefault', configTitleStyle)
      for (const key in { ...this.autofill.autofillConfig }) {
        const value = this.autofill.autofillConfig[key]
        console.log(`%c${key}`, consoleLogKeyStyle, value)
      }
      console.groupEnd()

      console.groupCollapsed('%cConstructor', configTitleStyle)
      for (const key in this.autofill.options) {
        const value = this.autofill.options[key]
        console.log(`%c${key}`, consoleLogKeyStyle, value)
      }
      console.groupEnd()

      console.group('%cInstance', configTitleStyle)
      for (const key in config) {
        const value = config[key]
        console.log(`%c${key}`, consoleLogKeyStyle, value)
      }
      console.groupEnd()

      console.groupEnd()
      // END config

      if (Object.keys(forms).length > 0) {
        console.groupCollapsed('%cForms', groupTitleStyle)
        for (const selector in forms) {
          const form = forms[selector]
          const inputs = form.inputs
          console.groupCollapsed(`%c${selector}`, 'color: #e74747')
          for (const key in form) {
            if (key !== 'inputs') {
              console.log(`%c${key}`, consoleLogKeyStyle, form[key])
            }
          }
          console.table(inputs)

          console.groupEnd()
        }
        console.groupEnd()
      }
    })
  }

  static icon (name) {
    const icons = {
      npm: `<svg xmlns="http://www.w3.org/2000/svg" class="icon icon-${name}" viewBox="0 0 512 512"><title>NPM package</title><path fill="currentColor" d="M227.6 213.1H256v57.1h-28.4z"/><path fill="currentColor" d="M0 156v171.4h142.2V356H256v-28.6h256V156zm142.2 142.9h-28.4v-85.7H85.3v85.7H28.4V184.6h113.8zm142.2 0h-56.9v28.6h-56.9V184.6h113.8zm199.2 0h-28.4v-85.7h-28.4v85.7h-28.4v-85.7H370v85.7h-56.9V184.6h170.7v114.3z"/></svg>`,

      github: `<svg xmlns="http://www.w3.org/2000/svg" class="icon icon-${name}" viewBox="0 0 512 512"><title>Github repository</title><path fill="currentColor" d="M256 32C132.3 32 32 134.9 32 261.7c0 101.5 64.2 187.5 153.2 217.9a17.56 17.56 0 003.8.4c8.3 0 11.5-6.1 11.5-11.4 0-5.5-.2-19.9-.3-39.1a102.4 102.4 0 01-22.6 2.7c-43.1 0-52.9-33.5-52.9-33.5-10.2-26.5-24.9-33.6-24.9-33.6-19.5-13.7-.1-14.1 1.4-14.1h.1c22.5 2 34.3 23.8 34.3 23.8 11.2 19.6 26.2 25.1 39.6 25.1a63 63 0 0025.6-6c2-14.8 7.8-24.9 14.2-30.7-49.7-5.8-102-25.5-102-113.5 0-25.1 8.7-45.6 23-61.6-2.3-5.8-10-29.2 2.2-60.8a18.64 18.64 0 015-.5c8.1 0 26.4 3.1 56.6 24.1a208.21 208.21 0 01112.2 0c30.2-21 48.5-24.1 56.6-24.1a18.64 18.64 0 015 .5c12.2 31.6 4.5 55 2.2 60.8 14.3 16.1 23 36.6 23 61.6 0 88.2-52.4 107.6-102.3 113.3 8 7.1 15.2 21.1 15.2 42.5 0 30.7-.3 55.5-.3 63 0 5.4 3.1 11.5 11.4 11.5a19.35 19.35 0 004-.4C415.9 449.2 480 363.1 480 261.7 480 134.9 379.7 32 256 32z"/></svg>`,

      'information-circle-outline': `<svg xmlns="http://www.w3.org/2000/svg"  class="icon icon-${name}" viewBox="0 0 512 512"><title>Infos (checkout developer tools console)</title><path d="M248 64C146.39 64 64 146.39 64 248s82.39 184 184 184 184-82.39 184-184S349.61 64 248 64z" fill="none" stroke="currentColor" stroke-miterlimit="10" stroke-width="32"/><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="32" d="M220 220h32v116"/><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-miterlimit="10" stroke-width="32" d="M208 340h88"/><path fill="currentColor" d="M248 130a26 26 0 1026 26 26 26 0 00-26-26z"/></svg>`,

      'play-outline': `<svg xmlns="http://www.w3.org/2000/svg" class="icon icon-${name}" viewBox="0 0 512 512"><title>Fill forms</title><path d="M112 111v290c0 17.44 17 28.52 31 20.16l247.9-148.37c12.12-7.25 12.12-26.33 0-33.58L143 90.84c-14-8.36-31 2.72-31 20.16z" fill="none" stroke="currentColor" stroke-miterlimit="10" stroke-width="32"/></svg>`,

      'reload-outline': `<svg xmlns="http://www.w3.org/2000/svg" class="icon icon-${name}" viewBox="0 0 512 512"><title>Reset forms</title><path d="M400 148l-21.12-24.57A191.43 191.43 0 00240 64C134 64 48 150 48 256s86 192 192 192a192.09 192.09 0 00181.07-128" fill="none" stroke="currentColor" stroke-linecap="round" stroke-miterlimit="10" stroke-width="32"/><path fill="currentColor" d="M464 97.42V208a16 16 0 01-16 16H337.42c-14.26 0-21.4-17.23-11.32-27.31L436.69 86.1C446.77 76 464 83.16 464 97.42z"/></svg>`
    }

    return icons[name]
  }
}

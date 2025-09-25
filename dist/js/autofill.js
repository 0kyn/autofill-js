"use strict";
(() => {
  // src/js/utils.ts
  var isObject = (thing) => typeof thing === "object" && !Array.isArray(thing) && thing !== null;
  var hasProp = (obj, name) => Object.prototype.hasOwnProperty.call(obj, name);
  var asArray = (item) => Array.isArray(item) ? item : [item];
  var truncate = (string, length) => string.slice(0, Math.max(0, length));
  var toCamelCase = (string) => {
    const split = string.split("-").length > 1 ? string.split("-") : string.split("_");
    return split.map((item, index) => {
      if (index > 0) {
        item = item.charAt(0).toUpperCase() + item.slice(1);
      }
      return item;
    }).join("");
  };
  var notContainsAttributes = (input, attributes) => {
    const excludedAttributes = new Set(attributes);
    return input.getAttributeNames().every((attr) => {
      return !excludedAttributes.has(attr);
    });
  };
  var notContainsTypes = (input, types) => !types.includes(input.type);
  var isValidUrl = (url) => typeof url === "string" && url.length > 0;
  var loadFromJson = async (url) => {
    const response = await fetch(url);
    const string = await response.text();
    try {
      const object = JSON.parse(string);
      return object;
    } catch (error) {
      console.error(error);
      throw new Error("Failed to parse JSON");
    }
  };

  // src/js/constants.ts
  var constants_default = {
    CDN_JS_URL: "https://cdn.jsdelivr.net/npm/autofill-js@2.0.2/dist/js/autofill.min.js",
    CDN_CSS_URL: "https://cdn.jsdelivr.net/npm/autofill-js@2.0.2/dist/css/autofill.min.css",
    DEV_HOSTS: [
      "127.0.0.1:5100",
      "127.0.0.1:5101"
    ]
  };

  // src/js/overlay.ts
  var Overlay = class _Overlay {
    constructor(autofill2, configManager, domForms) {
      this.autofill = autofill2;
      this.configManager = configManager;
      this.domForms = domForms;
    }
    // @todo nombre de form détecté dans le dom
    init() {
      const link = document.createElement("link");
      link.setAttribute("rel", "stylesheet");
      link.setAttribute("type", "text/css");
      link.onload = this.show.bind(this);
      link.setAttribute("href", _Overlay.cssLink());
      document.querySelectorAll("head")[0].append(link);
    }
    show() {
      const autofill2 = this.autofill;
      document.querySelector("body").style.paddingTop = "35px";
      const html = `
      <div class="autofill-overlay">
        <div class="autofill-overlay-brand">
          <span class="autofill-overlay-name">${autofill2.infos.name}</span>
          <span class="autofill-overlay-version">${autofill2.infos.version}</span>
        </div>
        <div class="autofill-overlay-buttons">
          <button type="button" class="js-btn-infos">${_Overlay.icon("information-circle-outline")}</button>
          <button type="button" class="js-btn-autofill">${_Overlay.icon("play-outline")}</button>
          <button type="button" class="js-btn-reset">${_Overlay.icon("reload-outline")}</button>
        </div>
        <div class="autofill-overlay-links">
          <a class="npm" href="${autofill2.infos.npm}" title="NPM package">${_Overlay.icon("npm")}</a>
          <a class="github" href="${autofill2.infos.github}" title="Github repository">${_Overlay.icon("github")}</a>
        </div>
      </div>
      `;
      document.body.insertAdjacentHTML("beforeend", html);
      document.querySelector(".js-btn-reset").addEventListener("click", () => {
        this.domForms.forEach((domForm) => {
          if (domForm.form !== null) {
            domForm.form.reset();
          }
          domForm.inputs.forEach((input) => {
            if (input instanceof HTMLInputElement) {
              input.checked = false;
              if (autofill2.configManager.config.valueAttribute) {
                input.removeAttribute("value");
              }
            }
          });
        });
      });
      document.querySelector(".js-btn-autofill").addEventListener("click", () => {
        this.autofill.fill();
      });
      document.querySelector(".js-btn-infos").addEventListener("click", () => {
        const config = { ...this.configManager.config };
        const forms = { ...this.configManager.forms };
        const groupTitleStyle = "color: #81aece;";
        const configTitleStyle = "color: #b24bd6;";
        const consoleLogKeyStyle = "color: #cf7b3a; font-weight: 600;";
        console.log(`%cAutofill.js - v${this.autofill.infos.version}`, `
        padding: 0.5rem 1.5rem;
        color: #212529;
        background-color: #81aece;
      `);
        console.groupCollapsed("%cAutofill Instance", groupTitleStyle);
        console.log(this.autofill);
        console.groupEnd();
        console.groupCollapsed("%cInfos", groupTitleStyle);
        console.table(this.autofill.infos);
        console.groupEnd();
        console.groupCollapsed("%cConfig", groupTitleStyle);
        console.groupCollapsed("%cDefault", configTitleStyle);
        for (const key in this.configManager.defaultConfig) {
          const value = this.configManager.defaultConfig[key];
          console.log(`%c${key}`, consoleLogKeyStyle, value);
        }
        console.groupEnd();
        console.groupCollapsed("%cConstructor", configTitleStyle);
        for (const key in this.configManager.options) {
          const value = this.configManager.options[key];
          console.log(`%c${key}`, consoleLogKeyStyle, value);
        }
        console.groupEnd();
        console.group("%cInstance", configTitleStyle);
        for (const key in config) {
          const value = config[key];
          console.log(`%c${key}`, consoleLogKeyStyle, value);
        }
        console.groupEnd();
        console.groupEnd();
        if (Object.keys(forms).length > 0) {
          console.groupCollapsed("%cForms", groupTitleStyle);
          for (const selector in forms) {
            const form = forms[selector];
            const inputs = form.inputs;
            console.groupCollapsed(`%c${selector}`, "color: #e74747");
            for (const key in form) {
              if (key !== "inputs") {
                console.log(`%c${key}`, consoleLogKeyStyle, form[key]);
              }
            }
            console.table(inputs);
            console.groupEnd();
          }
          console.groupEnd();
        }
      });
    }
    static cssLink() {
      const { CDN_CSS_URL, DEV_HOSTS } = constants_default;
      const devPorts = DEV_HOSTS.map((host) => host.split(":")[1]);
      return devPorts.includes(window.location.port) ? `//${window.location.host}/dist/css/autofill.css` : CDN_CSS_URL;
    }
    static icon(name) {
      const icons = {
        "npm": `<svg xmlns="http://www.w3.org/2000/svg" class="icon icon-${name}" viewBox="0 0 512 512"><title>NPM package</title><path fill="currentColor" d="M227.6 213.1H256v57.1h-28.4z"/><path fill="currentColor" d="M0 156v171.4h142.2V356H256v-28.6h256V156zm142.2 142.9h-28.4v-85.7H85.3v85.7H28.4V184.6h113.8zm142.2 0h-56.9v28.6h-56.9V184.6h113.8zm199.2 0h-28.4v-85.7h-28.4v85.7h-28.4v-85.7H370v85.7h-56.9V184.6h170.7v114.3z"/></svg>`,
        "github": `<svg xmlns="http://www.w3.org/2000/svg" class="icon icon-${name}" viewBox="0 0 512 512"><title>Github repository</title><path fill="currentColor" d="M256 32C132.3 32 32 134.9 32 261.7c0 101.5 64.2 187.5 153.2 217.9a17.56 17.56 0 003.8.4c8.3 0 11.5-6.1 11.5-11.4 0-5.5-.2-19.9-.3-39.1a102.4 102.4 0 01-22.6 2.7c-43.1 0-52.9-33.5-52.9-33.5-10.2-26.5-24.9-33.6-24.9-33.6-19.5-13.7-.1-14.1 1.4-14.1h.1c22.5 2 34.3 23.8 34.3 23.8 11.2 19.6 26.2 25.1 39.6 25.1a63 63 0 0025.6-6c2-14.8 7.8-24.9 14.2-30.7-49.7-5.8-102-25.5-102-113.5 0-25.1 8.7-45.6 23-61.6-2.3-5.8-10-29.2 2.2-60.8a18.64 18.64 0 015-.5c8.1 0 26.4 3.1 56.6 24.1a208.21 208.21 0 01112.2 0c30.2-21 48.5-24.1 56.6-24.1a18.64 18.64 0 015 .5c12.2 31.6 4.5 55 2.2 60.8 14.3 16.1 23 36.6 23 61.6 0 88.2-52.4 107.6-102.3 113.3 8 7.1 15.2 21.1 15.2 42.5 0 30.7-.3 55.5-.3 63 0 5.4 3.1 11.5 11.4 11.5a19.35 19.35 0 004-.4C415.9 449.2 480 363.1 480 261.7 480 134.9 379.7 32 256 32z"/></svg>`,
        "information-circle-outline": `<svg xmlns="http://www.w3.org/2000/svg"  class="icon icon-${name}" viewBox="0 0 512 512"><title>Infos (checkout developer tools console)</title><path d="M248 64C146.39 64 64 146.39 64 248s82.39 184 184 184 184-82.39 184-184S349.61 64 248 64z" fill="none" stroke="currentColor" stroke-miterlimit="10" stroke-width="32"/><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="32" d="M220 220h32v116"/><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-miterlimit="10" stroke-width="32" d="M208 340h88"/><path fill="currentColor" d="M248 130a26 26 0 1026 26 26 26 0 00-26-26z"/></svg>`,
        "play-outline": `<svg xmlns="http://www.w3.org/2000/svg" class="icon icon-${name}" viewBox="0 0 512 512"><title>Fill forms</title><path d="M112 111v290c0 17.44 17 28.52 31 20.16l247.9-148.37c12.12-7.25 12.12-26.33 0-33.58L143 90.84c-14-8.36-31 2.72-31 20.16z" fill="none" stroke="currentColor" stroke-miterlimit="10" stroke-width="32"/></svg>`,
        "reload-outline": `<svg xmlns="http://www.w3.org/2000/svg" class="icon icon-${name}" viewBox="0 0 512 512"><title>Reset forms</title><path d="M400 148l-21.12-24.57A191.43 191.43 0 00240 64C134 64 48 150 48 256s86 192 192 192a192.09 192.09 0 00181.07-128" fill="none" stroke="currentColor" stroke-linecap="round" stroke-miterlimit="10" stroke-width="32"/><path fill="currentColor" d="M464 97.42V208a16 16 0 01-16 16H337.42c-14.26 0-21.4-17.23-11.32-27.31L436.69 86.1C446.77 76 464 83.16 464 97.42z"/></svg>`
      };
      return icons[name];
    }
  };

  // src/js/config-manager.ts
  var ConfigManager = class {
    defaultConfig = {
      enable: true,
      overlay: false,
      url: false,
      formsSelectors: ["form"],
      validateInputAttributes: ["minlength", "maxlength"],
      autosubmit: false,
      camelize: false,
      events: ["input", "change"],
      generate: false,
      inputAttributes: ["data-autofill", "name", "id", "class"],
      inputAttributesSkip: [],
      inputTypesSkip: [],
      inputsSelectors: ["input", "textarea", "select", "progress", "meter"],
      override: false,
      random: false,
      randomPreset: false,
      valueAttribute: true
    };
    infos = {
      author: "0kyn",
      version: "2.0.2",
      name: "Autofill.js",
      github: "https://github.com/0kyn/autofill-js",
      npm: "https://www.npmjs.com/package/autofill-js"
    };
    _config;
    _forms = {};
    _options = {};
    constructor(options) {
      this._options = options ?? {};
      this._config = { ...this.defaultConfig };
      if (options) {
        this.applyOptions(options);
      }
    }
    get options() {
      return this._options;
    }
    get config() {
      return this._config;
    }
    get forms() {
      return this._forms;
    }
    get isEnabled() {
      return this._config.enable;
    }
    applyOptions(options) {
      this.validateOptions(options);
      const { inputs, forms, ...configOptions } = options;
      this.validateConfigOptions(configOptions);
      this._config = {
        ...this._config,
        ...configOptions
      };
      this._config.formsSelectors = this.buildFormsSelectors(forms);
      this._forms = this.buildForms(forms, inputs);
    }
    async loadFromUrl(url) {
      if (!isValidUrl(url)) {
        throw new Error(`Invalid URL: ${url}`);
      }
      try {
        const configFile = await loadFromJson(url);
        const { inputs, forms, ...jsonConfig } = configFile;
        this.validateConfigOptions(jsonConfig);
        this._config = {
          ...this.defaultConfig,
          ...jsonConfig
        };
        this._config.formsSelectors = this.buildFormsSelectors(forms);
        const jsonForms = this.buildForms(forms, inputs);
        this._forms = this.mergeFormConfigs(jsonForms, this._forms);
      } catch (error) {
        console.error("Failed to load configuration from URL:", error);
        throw error;
      }
    }
    getFormConfig(formSelector) {
      let formConfig = {};
      if (typeof formSelector === "string" && this._forms && this._forms[formSelector]) {
        formConfig = { ...this._forms[formSelector] };
      }
      const combinedConfig = {
        ...this._config,
        ...formConfig
      };
      delete combinedConfig.inputs;
      return combinedConfig;
    }
    getInputConfig(formSelector, inputKey) {
      const config = this.getFormConfig(formSelector);
      if (!this.hasFormWithInputs(formSelector) || !inputKey) {
        return config;
      }
      const inputOptions = this.forms[formSelector]?.inputs?.[inputKey];
      const inputConfig = typeof inputOptions !== "string" ? { ...inputOptions } : {};
      delete inputConfig?.value;
      if (!isObject(inputConfig)) {
        return config;
      }
      return { ...config, ...inputConfig };
    }
    findFormSelector(form) {
      if (!form || !this._config.formsSelectors) {
        return void 0;
      }
      for (const formSelector of this._config.formsSelectors) {
        if (form === document.querySelector(formSelector)) {
          return formSelector;
        }
      }
      for (const formSelector of this._config.formsSelectors) {
        const matchedForms = document.querySelectorAll(formSelector);
        if ([...matchedForms].includes(form)) {
          return formSelector;
        }
      }
      return void 0;
    }
    hasFormWithInputs(formSelector) {
      return typeof formSelector === "string" && !!this._forms && !!this._forms[formSelector] && !!this._forms[formSelector]?.inputs;
    }
    buildFormsSelectors(forms) {
      const formsSelectors = [...this._config.formsSelectors];
      if (forms === void 0) return formsSelectors;
      Object.keys(forms).forEach((key) => {
        key.split(",").forEach((split) => {
          const trimed = split.trim();
          if (!formsSelectors.includes(trimed)) {
            formsSelectors.push(trimed);
          }
        });
      });
      return formsSelectors;
    }
    buildForms(formsOpt, inputsOpt) {
      this.validateOptions(inputsOpt);
      this.validateOptions(formsOpt);
      const forms = {};
      const newFormOpts = {};
      Object.keys(formsOpt ?? {}).forEach((key) => {
        key.split(",").forEach((split) => {
          newFormOpts[split.trim()] = formsOpt[key];
        });
      });
      this._config.formsSelectors.forEach((formsSelector) => {
        forms[formsSelector] = forms[formsSelector] || {};
        if (inputsOpt !== void 0) {
          forms[formsSelector].inputs = { ...inputsOpt };
        } else if (newFormOpts !== void 0) {
          forms[formsSelector] = newFormOpts[formsSelector];
        }
      });
      return forms;
    }
    mergeFormConfigs(...sources) {
      const target = {};
      const deepMerge = (target2, source) => {
        for (const prop in source) {
          if (hasProp(source, prop)) {
            const sourceProp = source[prop];
            if (isObject(sourceProp)) {
              target2[prop] = target2[prop] || {};
              deepMerge(
                target2[prop],
                sourceProp
              );
            } else {
              target2[prop] = sourceProp;
            }
          }
        }
      };
      for (const source of sources) {
        if (source) {
          deepMerge(target, source);
        }
      }
      return target;
    }
    validateOptions(options) {
      if (options !== void 0 && !isObject(options)) {
        throw new Error("Options must be a valid object or undefined.");
      }
    }
    validateConfigOptions(config) {
      if (!config) return;
      const allowedKeys = Object.keys(this.defaultConfig);
      const providedKeys = Object.keys(config);
      const invalidKeys = providedKeys.filter((key) => !allowedKeys.includes(key));
      if (invalidKeys.length > 0) {
        throw new Error(`Invalid config keys: ${invalidKeys.join(", ")}`);
      }
    }
  };

  // src/js/random.ts
  var Random = class _Random {
    static data = {
      lastname: ["Kent", "Doe", "Bond"],
      firstname: ["Clark", "John", "James"],
      location: [
        {
          country: "United States of America",
          countryCode: "1",
          iso: "US/USA",
          state: "New York",
          phoneNumber: "012-345-6789",
          city: "New York City",
          zipCode: "10016",
          street: "7985 E 38th St",
          currency: "US Dollar",
          tld: "us"
        },
        {
          country: "France",
          countryCode: "33",
          iso: "FR/FRA",
          state: "Ile-de-France",
          phoneNumber: "0123456789",
          city: "Paris",
          zipCode: "75008",
          street: "312 Av. des Champs-\xC9lys\xE9es",
          currency: "Euro",
          tld: "fr"
        },
        {
          country: "United Kingdom",
          countryCode: 44,
          iso: "GB/GBR",
          state: "London",
          phoneNumber: "02012347890",
          city: "London",
          zipCode: "75008",
          street: "1578 Willesden St",
          currency: "Pounds",
          tld: "uk"
        }
      ],
      animal: ["Dog", "Cat", "Bird"],
      colorString: ["Red", "Green", "Blue"],
      colorHex: ["#ff0000", "#00ff00", "#0000ff"],
      music: ["Classical", "Electro", "Blues"],
      vehicle: ["Car", "Bicycle", "Truck"],
      company: ["Test Inc.", "3W Corp", "DevIn"],
      search: ["search keyword 1", "search keyword 2", "search keyword 3"]
    };
    static mapInputTypePreset = {
      tel: "phoneNumber",
      email: "email",
      color: "colorHex",
      datetimeLocal: "datetime",
      time: "time",
      date: "date"
    };
    static mapInputTypeStringOption = {
      text: "string",
      textarea: "string",
      email: "email",
      password: "password"
    };
    withPreset;
    preset = {};
    constructor({ withPreset }) {
      this.withPreset = withPreset;
      if (this.withPreset) {
        this.initPreset();
      }
    }
    static parse(string) {
      const match = string.match(/^(\w+)/);
      if (match) {
        const stringType = match[1];
        const splitArgs = string.split("|");
        const options = {};
        if (splitArgs.length > 0) {
          for (let i = 0; i < splitArgs.length; i++) {
            const splitArg = splitArgs[i].split(":");
            options[splitArg[0]] = splitArg[1];
          }
        }
        return _Random.gen(stringType, options);
      }
    }
    static gen(type, options) {
      const alphaLower = "abcdefghijklmnopqrstuvwxyz";
      const alphaUpper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
      const alpha = alphaLower + alphaUpper;
      const digit = "0123456789";
      const specialsChars = " !\"#$%&'()*+,-./:;<=>?@[\\]^_`{|}~";
      const allChars = alpha + digit + specialsChars;
      const stringTypes = {
        string: alpha,
        email: alphaLower,
        password: allChars,
        digit
      };
      const minLength = options.min || 12;
      const maxLength = options.max || 16;
      const randomLength = _Random.genInt(minLength, maxLength);
      options.len = options.len || randomLength;
      options.chars = stringTypes[type];
      let randomString = "";
      if (type === "email") {
        randomString += _Random.genEmail(options);
      } else {
        if (options.chars) {
          randomString += _Random.genString(options);
        }
      }
      return randomString;
    }
    genInputValue(input) {
      let inputValue;
      let type;
      if (input.getAttribute("list") ?? false) type = "datalist";
      else if (input.tagName === "PROGRESS") type = "progress";
      else if (input.tagName === "METER") type = "meter";
      else type = input.type;
      switch (type) {
        case "select-one":
        case "select-multiple":
          inputValue = this.genSelect(input);
          break;
        case "checkbox":
          inputValue = this.genCheckbox(input);
          break;
        case "radio":
          inputValue = this.genRadio(input);
          break;
        case "datalist":
          inputValue = this.genDatalist(input);
          break;
        case "range":
          inputValue = this.genRange(input);
          break;
        case "number":
          inputValue = this.genNumber(input);
          break;
        case "progress":
          inputValue = this.genProgress(input);
          break;
        case "meter":
          inputValue = this.genMeter(input);
          break;
        case "date":
        case "datetime-local":
        case "month":
        case "week":
        case "time":
          inputValue = this.genDate(input, type);
          break;
        case "color":
          inputValue = this.genColor();
          break;
        default:
          break;
      }
      if (this.withPreset) {
        const attributes = _Random.getAttributesByKeyValue(input);
        const preset = this.searchPreset({ type, ...attributes });
        if (preset !== void 0) inputValue = preset;
      }
      if (inputValue === void 0) {
        const stringType = _Random.mapInputTypeStringOption[type] ?? "string";
        const minlength = input.getAttribute("minlength") ? Number.parseInt(input.getAttribute("minlength")) : void 0;
        const maxlength = input.getAttribute("maxlength") ? Number.parseInt(input.getAttribute("maxlength")) : void 0;
        inputValue = _Random.gen(stringType, { min: minlength, max: maxlength });
      }
      return inputValue;
    }
    static getData() {
      return _Random.data;
    }
    initPreset() {
      this.preset = {};
      for (const key in _Random.data) {
        if (key !== "location") {
          this.preset[key] = _Random.getRandomItem(_Random.data[key]);
        } else {
          this.preset = { ...this.preset, ..._Random.getRandomItem(_Random.data.location) };
        }
      }
      this.preset.name = this.preset.firstname;
      this.preset.fullname = `${this.preset.firstname} ${this.preset.lastname}`;
      this.preset.email = this.genPresetEmail();
      this.preset.username = this.genPresetUsername();
      this.preset.nickname = this.preset.username;
      this.preset.password = this.genPresetPassword();
      this.preset.birthdate = this.genPresetBirthdate();
      this.preset.age = this.genPresetAge();
      this.preset.url = this.genPresetUrl();
      this.preset.datetime = this.genPresetDatetime();
      this.preset.date = this.genPresetDate();
      this.preset.month = this.genPresetMonth();
      this.preset.week = this.genPresetWeek();
      this.preset.time = this.genPresetTime();
    }
    genPresetEmail() {
      return `${this.preset.firstname.toLocaleLowerCase()}.${this.preset.lastname.toLocaleLowerCase()}@${this.preset.company.toLocaleLowerCase().replace(/\W/g, "")}.${this.preset.tld}`;
    }
    genPresetUsername() {
      return `${this.preset.firstname}_${this.preset.lastname}`.toLowerCase();
    }
    genPresetPassword() {
      const mapChars = {
        a: "4",
        e: "3",
        g: "9",
        i: "1",
        l: "7",
        s: "5",
        z: "2"
      };
      const base = `${this.preset.username}_isnotasecurepwd`;
      const string = [...base].map((char) => {
        return mapChars[char] ?? char;
      }).map((char) => {
        return _Random.genBool() ? char.toLocaleUpperCase() : char;
      }).join("");
      return string;
    }
    genPresetAge() {
      return Math.floor(
        (Date.now() - new Date(this.preset.birthdate).getTime()) / 315576e5
      ).toString();
    }
    genPresetUrl() {
      return `https://www.${this.preset.company.toLocaleLowerCase().replace(/\W/g, "")}.${this.preset.tld}`;
    }
    genPresetBirthdate() {
      const date = /* @__PURE__ */ new Date();
      const years = date.getFullYear();
      const randomYear = years - _Random.genInt(21, 100);
      const randomMonth = _Random.genInt(0, 11);
      const randomDay = _Random.genInt(1, 31);
      const birthdate = new Date(randomYear, randomMonth, randomDay).toISOString().split("T")[0];
      return birthdate;
    }
    genPresetDatetime() {
      return _Random.getDatetime();
    }
    genPresetDate() {
      return _Random.getDate(this.preset.datetime);
    }
    genPresetMonth() {
      return _Random.getMonth(this.preset.datetime);
    }
    genPresetWeek() {
      return _Random.getWeek(this.preset.datetime);
    }
    genPresetTime() {
      return _Random.getTime(this.preset.datetime);
    }
    searchPreset({ type, ...attrs }) {
      const camelType = toCamelCase(type);
      for (const pKey in this.preset) {
        for (const aKey in attrs) {
          const attrVal = attrs[aKey];
          const reg = new RegExp(`^${attrVal}$`, "i");
          if (attrVal?.length > 0 && reg.test(pKey)) {
            return this.preset[pKey];
          }
        }
      }
      const mappedType = _Random.mapInputTypePreset[camelType];
      if (mappedType) {
        return this.preset[mappedType];
      }
    }
    genSelect(input) {
      const selectType = input.type;
      const options = input.querySelectorAll("option");
      const optionsIndexes = [...options].map((option, index) => option.value.length > 0 ? index : void 0).filter((index) => index !== void 0);
      const optionsIndexesCount = optionsIndexes.length;
      if (selectType === "select-one") {
        return optionsIndexes[_Random.genInt(0, optionsIndexes.length - 1)];
      } else {
        const minOptionToSelect = _Random.genInt(2, optionsIndexesCount);
        let randomOptionsIndexes = [];
        while (randomOptionsIndexes.length < minOptionToSelect) {
          const randomOptionIndex = optionsIndexes[_Random.genInt(0, optionsIndexesCount - 1)];
          if (!randomOptionsIndexes.includes(randomOptionIndex)) {
            randomOptionsIndexes = [...randomOptionsIndexes, randomOptionIndex];
          }
        }
        return randomOptionsIndexes;
      }
    }
    genCheckbox(input) {
      const reg = /\[/g;
      const name = input.getAttribute("name");
      if (name && reg.test(name)) {
        const checkboxesIndexes = [
          ...document.querySelectorAll(`input[name^=${name.split("[")[0]}\\[]`)
        ].map((_, index) => index);
        const minCheckboxToCheck = _Random.genInt(1, checkboxesIndexes.length);
        let randomCheckboxesIndexes = [];
        while (randomCheckboxesIndexes.length < minCheckboxToCheck) {
          const randomCheckboxIndex = checkboxesIndexes[_Random.genInt(0, checkboxesIndexes.length - 1)];
          if (!randomCheckboxesIndexes.includes(randomCheckboxIndex)) {
            randomCheckboxesIndexes = [...randomCheckboxesIndexes, randomCheckboxIndex];
          }
        }
        return randomCheckboxesIndexes;
      } else {
        return _Random.genBool();
      }
    }
    genRadio(input) {
      const name = input.getAttribute("name") ?? "";
      const radios = document.querySelectorAll(`[name^=${name.split("[")[0]}]`);
      if (radios.length > 0) {
        const radioIndexes = [...radios].map((_, index) => index);
        return radioIndexes[_Random.genInt(0, radioIndexes.length - 1)];
      }
    }
    genDatalist(input) {
      const options = document.querySelectorAll(`datalist#${input.getAttribute("list")} option`);
      if (options.length > 0) {
        const optionsIndexes = [...options].map((_, index) => index);
        return optionsIndexes[_Random.genInt(0, optionsIndexes.length - 1)];
      }
    }
    genRange(input) {
      const min = Number.parseInt(input.getAttribute("min") ?? "0");
      const max = Number.parseInt(input.getAttribute("max") ?? "100");
      return _Random.genInt(min, max);
    }
    genNumber(input) {
      const min = Number.parseInt(input.getAttribute("min") ?? "-1000");
      const max = Number.parseInt(input.getAttribute("max") ?? "1000");
      return _Random.genInt(min, max);
    }
    genProgress(input) {
      const max = Number.parseInt(input.getAttribute("max") ?? "100");
      return _Random.genInt(0, max);
    }
    genMeter(input) {
      return this.genNumber(input);
    }
    genDate(input, type = "date") {
      const start = input.getAttribute("min") ?? "1970-01-01";
      const end = input.getAttribute("max") ?? "2099-12-31";
      let date;
      switch (type) {
        case "datetime-local":
          date = _Random.genDatetime(start, end);
          break;
        case "month":
          date = _Random.genMonth(start, end);
          break;
        case "week":
          date = _Random.genWeek(start, end);
          break;
        case "time":
          date = _Random.genTime(start, end);
          break;
        case "date":
          date = _Random.genDate(start, end);
          break;
      }
      return date;
    }
    genColor() {
      return `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, "0")}`;
    }
    static genEmail(options) {
      const length = options?.len !== void 0 && options.len >= 5 ? options.len : 5;
      const tldLength = 2;
      const domainLength = Math.floor(length / 3);
      const usernameLength = length - domainLength + tldLength;
      let randomString = "";
      randomString += _Random.genString({ ...options, len: usernameLength });
      randomString += "@";
      randomString += _Random.genString({ ...options, len: domainLength });
      randomString += ".";
      randomString += _Random.genString({ ...options, len: tldLength });
      return randomString;
    }
    static genString(options) {
      const chars = options.chars;
      const length = options.len ?? 0;
      let randomString = "";
      for (let i = 0; i < length; i++) {
        randomString += chars[Math.floor(Math.random() * chars.length)];
      }
      return randomString;
    }
    static getAttributesByKeyValue(input) {
      const attrNames = ["name", "id", "class"];
      const attributesByKV = attrNames.reduce((acc, key) => {
        const attrValue = input.getAttribute(key);
        if (attrValue !== null) {
          acc[key] = attrValue;
        }
        return acc;
      }, {});
      return attributesByKV;
    }
    static genInt(min, max) {
      return Math.floor(Math.random() * (max - min + 1) + min);
    }
    static genBool() {
      return Math.random() < 0.5;
    }
    static genDateBetween(start, end) {
      const startDate = new Date(start);
      const endDate = new Date(end);
      return new Date(startDate.getTime() + Math.random() * (endDate.getTime() - startDate.getTime()));
    }
    static genDate(start, end) {
      const date = _Random.genDateBetween(start, end);
      const dateFormat = _Random.getDate(_Random.getDatetime(date));
      return dateFormat;
    }
    static genDatetime(start, end) {
      const date = _Random.genDateBetween(start, end);
      return _Random.getDatetime(date);
    }
    static genMonth(start, end) {
      return _Random.getMonth(_Random.genDate(start, end));
    }
    static genWeek(start, end) {
      return _Random.getWeek(_Random.genDate(start, end));
    }
    static genTime(start, end) {
      return _Random.getTime(_Random.genDatetime(start, end));
    }
    static getDatetime(date) {
      if (date === void 0) {
        date = /* @__PURE__ */ new Date();
      }
      const datetime = date.toISOString().split(".")[0];
      return datetime;
    }
    static getDate(datetime) {
      return datetime.split("T")[0];
    }
    static getMonth(datetime) {
      const date = new Date(datetime);
      return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, "0")}`;
    }
    static getWeek(datetime) {
      const date = new Date(datetime);
      return `${date.getFullYear()}-W${_Random.getWeekNumber(date).toString().padStart(2, "0")}`;
    }
    static getTime(datetime) {
      return datetime.split("T")[1];
    }
    static getWeekNumber(date) {
      const startDate = new Date(date.getFullYear(), 0, 1);
      const days = Math.floor((date.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1e3));
      const weekNumber = Math.ceil(days / 7);
      return weekNumber.toString();
    }
    static getRandomItem(array) {
      return array[Math.floor(Math.random() * array.length)];
    }
  };

  // src/js/event.ts
  var isReact15 = (key) => key.startsWith("__reactInternalInstance$");
  var isReact16 = (key) => key.startsWith("__reactProps$") || key.startsWith("__reactEventHandlers$");
  var reactMap = {
    change: "onChange",
    input: "onInput",
    submit: "onSubmit"
  };
  var reactPropKey = (input) => {
    const react16Key = Object.keys(input).find((key) => isReact16(key));
    if (react16Key) return react16Key;
    const react15Key = Object.keys(input).find((key) => isReact15(key));
    return react15Key;
  };
  var getReact15EventHandlers = (input, propKey) => {
    try {
      const internalInstance = input[propKey];
      if (internalInstance && internalInstance._currentElement && internalInstance._currentElement.props) {
        return internalInstance._currentElement.props;
      }
      return void 0;
    } catch {
      return void 0;
    }
  };
  var fireDefault = (input, eventName, options) => {
    input.dispatchEvent(new Event(eventName, options));
  };
  var fireReact = (input, eventName) => {
    const rPropKey = reactPropKey(input);
    const mappedEventName = reactMap[eventName];
    if (!rPropKey || !mappedEventName) return;
    const syntheticEvent = {
      target: input,
      currentTarget: input,
      type: eventName,
      bubbles: true,
      preventDefault: () => {
      },
      stopPropagation: () => {
      }
    };
    if (isReact16(rPropKey)) {
      if (input[rPropKey] && input[rPropKey][mappedEventName]) {
        input[rPropKey][mappedEventName](syntheticEvent);
      }
    } else if (isReact15(rPropKey)) {
      const props = getReact15EventHandlers(input, rPropKey);
      if (props && props[mappedEventName]) {
        props[mappedEventName](syntheticEvent);
      }
    }
  };
  var fireEvent = (input, eventName, options) => {
    const isReactInput = reactPropKey(input) !== void 0;
    options = { cancelable: true, bubbles: false, ...options };
    if (!isReactInput) {
      fireDefault(input, eventName, options);
    } else {
      fireReact(input, eventName);
    }
  };

  // src/js/handlers/handler.ts
  var InputHandler = class {
    constructor(input, configManager, randomInstance, formConfig, formSelector) {
      this.input = input;
      this.configManager = configManager;
      this.randomInstance = randomInstance;
      this.formSelector = formSelector;
      const identifier = this.getInputIdentifier(input, formConfig);
      this.config = this.configManager.getInputConfig(formSelector, identifier);
    }
    config;
    generateInputValue(input, config) {
      let value;
      if (this.configManager.hasFormWithInputs(this.formSelector)) {
        const identifier = this.getInputIdentifier(input, config);
        if (identifier) {
          value = this.getInputValue(identifier, this.formSelector);
          const generationTemplate = this.needsGeneration(value, config);
          if (generationTemplate) {
            value = Random.parse(generationTemplate);
          }
        } else if (config.random) {
          value = this.randomInstance?.genInputValue(input);
        }
      } else {
        value = this.randomInstance?.genInputValue(input);
      }
      return this.validateValueConstraints(input, value, config);
    }
    setInputProperty(input, property, config) {
      this.setProperty(input, property, config);
      config.events.forEach((eventName) => fireEvent(input, eventName));
    }
    needsGeneration(value, config) {
      if (!config.generate || typeof value !== "string") return false;
      const generationPattern = /{{\s(.+?)\s}}/;
      const match = value.match(generationPattern);
      return match && match[1] ? match[1] : false;
    }
    validateValueConstraints(input, value, config) {
      if (typeof value !== "string") return value;
      if (config.validateInputAttributes.includes("minlength")) {
        const minlength = Number.parseInt(input?.getAttribute("minlength") || "-1", 10);
        if (minlength > 0 && value.length < minlength) {
          value += Random.gen("string", { len: minlength - value.length });
        }
      }
      if (config.validateInputAttributes.includes("maxlength")) {
        const maxlength = Number.parseInt(input.getAttribute("maxlength") || "-1", 10);
        if (maxlength > 0 && value.length > maxlength) {
          value = truncate(value, maxlength);
        }
      }
      return value;
    }
    getInputValue(identifier, formSelector) {
      if (!this.configManager.hasFormWithInputs(formSelector) || !identifier) {
        return void 0;
      }
      const inputs = this.configManager.forms[formSelector].inputs;
      const input = inputs[identifier];
      if (isObject(input) && hasProp(input, "value")) {
        return input.value;
      }
      return input;
    }
    getInputIdentifier(input, config) {
      const { inputAttributes } = config;
      if (!inputAttributes || !this.formSelector) return void 0;
      for (const attrName of inputAttributes) {
        const attrValue = input.getAttribute(attrName);
        if (!attrValue) continue;
        const baseKey = attrValue.split("[")[0];
        if (this.getInputValue(baseKey, this.formSelector) !== void 0) {
          return baseKey;
        }
        if (config.camelize) {
          const camelKey = toCamelCase(baseKey);
          if (this.getInputValue(camelKey, this.formSelector) !== void 0) {
            return camelKey;
          }
        }
      }
      return void 0;
    }
    setProperty = (input, property, config) => {
      const { key, value } = property;
      switch (key) {
        case "selected":
          if ("selected" in input) {
            input.selected = Boolean(value);
          }
          break;
        case "checked":
          if ("checked" in input) {
            input.checked = Boolean(value);
          }
          break;
        case "files":
          if ("files" in input) {
            input.files = value;
          }
          break;
        case "value":
          if ("value" in input) {
            input.value = String(value === null ? "" : value);
            if (config.valueAttribute) input.setAttribute("value", input.value);
          }
          break;
      }
    };
  };

  // src/js/handlers/text-handler.ts
  var TextInputHandler = class extends InputHandler {
    handle() {
      const input = this.input;
      const config = this.config;
      const shouldFill = this.config.override || !input.value?.length || input.type === "range" && input.value === "50" || input.type === "color" && input.value === "#000000";
      if (!shouldFill) return;
      const value = this.generateInputValue(input, config);
      if (value !== void 0) {
        this.setInputProperty(input, { key: "value", value }, config);
      }
    }
  };

  // src/js/handlers/select-handler.ts
  var SelectInputHandler = class extends InputHandler {
    handle() {
      const input = this.input;
      const config = this.config;
      const options = [...input.querySelectorAll("option")];
      if (!config.override && options.some((option) => option.selected)) {
        return;
      }
      const values = asArray(this.generateInputValue(input, config));
      values.forEach((value) => {
        if (typeof value === "string") {
          const option = options.find((option2) => option2.value === value);
          if (option) {
            this.setInputProperty(option, { key: "selected", value: true }, config);
          }
        } else if (typeof value === "number" && value >= 0 && value < options.length) {
          this.setInputProperty(options[value], { key: "selected", value: true }, config);
        }
      });
    }
  };

  // src/js/handlers/file-handler.ts
  var FileInputHandler = class extends InputHandler {
    handle() {
      const input = this.input;
      const config = this.config;
      const file = new File(["file content"], "test.txt", { type: "text/plain" });
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);
      this.setInputProperty(input, { key: "files", value: dataTransfer.files }, config);
    }
  };

  // src/js/handlers/checkbox-radio-handler.ts
  var CheckboxRadioInputHandler = class extends InputHandler {
    handle(group) {
      const config = this.config;
      const input = group[0];
      if (!config.override) {
        const anyChecked = group.some((input2) => input2.checked);
        if (anyChecked) return;
      }
      const values = asArray(this.generateInputValue(input, config));
      values.forEach((value, valueIndex) => {
        group.forEach((input2, inputIndex) => {
          let shouldCheck = false;
          if (typeof value === "string" && input2.value === value) {
            shouldCheck = true;
          } else if (typeof value === "number" && inputIndex === value) {
            shouldCheck = true;
          } else if (typeof value === "boolean" && inputIndex === valueIndex) {
            shouldCheck = value;
          }
          if (shouldCheck) {
            this.setInputProperty(input2, { key: "checked", value: true }, config);
          }
        });
      });
    }
  };

  // src/js/handlers/datalist-handler.ts
  var DatalistInputHandler = class extends InputHandler {
    handle() {
      const input = this.input;
      const config = this.config;
      if (!config.override && input.value.length > 0) {
        return;
      }
      const value = this.generateInputValue(input, config);
      if (typeof value === "string") {
        this.setInputProperty(input, { key: "value", value }, config);
      } else if (typeof value === "number") {
        const listId = input.getAttribute("list");
        if (!listId) return;
        const options = document.querySelectorAll(`datalist#${listId} option`);
        if (options.length > value) {
          this.setInputProperty(
            input,
            { key: "value", value: options[value].value },
            config
          );
        }
      }
    }
  };

  // src/js/form-processor.ts
  var FormProcessor = class {
    constructor(configManager, form) {
      this.configManager = configManager;
      this.form = form;
      this.formSelector = this.configManager.findFormSelector(this.form);
      this.config = this.configManager.getFormConfig(this.formSelector);
      this.randomInstance = new Random({
        withPreset: this.config.random ? this.config.randomPreset : true
      });
    }
    formSelector;
    config;
    randomInstance;
    process(inputs) {
      const filteredInputs = this.filterInputs(inputs, this.config);
      this.processAllInputs(filteredInputs, this.config, this.formSelector);
      if (this.config?.autosubmit && this.form !== null) {
        this.submitForm(this.form);
      }
    }
    filterInputs(inputs, config) {
      return inputs.filter(
        (input) => notContainsAttributes(input, config.inputAttributesSkip) && notContainsTypes(input, config.inputTypesSkip)
      );
    }
    submitForm(form, timeout = 1e3) {
      setTimeout(() => fireEvent(form, "submit"), timeout);
    }
    processAllInputs(inputs, config, formSelector) {
      const configManager = this.configManager;
      const randomInstance = this.randomInstance;
      this.getDefaultInputs(inputs).forEach((input) => {
        new TextInputHandler(
          input,
          configManager,
          randomInstance,
          config,
          formSelector
        ).handle();
      });
      this.getSelects(inputs).forEach((input) => {
        new SelectInputHandler(
          input,
          configManager,
          randomInstance,
          config,
          formSelector
        ).handle();
      });
      this.getCheckboxesGroup(inputs).forEach((group) => {
        new CheckboxRadioInputHandler(
          /* @todo rewrite */
          group[0],
          configManager,
          randomInstance,
          config,
          formSelector
        ).handle(group);
      });
      this.getRadios(inputs).forEach((group) => {
        new CheckboxRadioInputHandler(
          group[0],
          configManager,
          randomInstance,
          config,
          formSelector
        ).handle(group);
      });
      this.getDatalists(inputs).forEach((input) => {
        new DatalistInputHandler(
          input,
          configManager,
          randomInstance,
          config,
          formSelector
        ).handle();
      });
      this.getFileInputs(inputs).forEach((input) => {
        new FileInputHandler(
          input,
          configManager,
          randomInstance,
          config,
          formSelector
        ).handle();
      });
    }
    getDefaultInputs(inputs) {
      const excludedInputTypes = ["checkbox", "radio", "file", "reset", "submit", "button"];
      const excludedAttributes = ["list"];
      return inputs.filter((input) => {
        return notContainsTypes(input, excludedInputTypes) && notContainsAttributes(input, excludedAttributes);
      });
    }
    getFileInputs(inputs) {
      return inputs.filter((input) => input.type === "file");
    }
    getCheckboxesGroup(inputs) {
      const nameGroupPattern = /(.+)\[/;
      const checkboxGroups = [];
      const processedInputs = /* @__PURE__ */ new Set();
      for (const input of inputs) {
        if (input.type !== "checkbox" || processedInputs.has(input)) continue;
        const inputName = input.getAttribute("name");
        const nameMatch = inputName?.match(nameGroupPattern);
        if (nameMatch) {
          const groupNamePrefix = nameMatch[1];
          const groupNameRegex = new RegExp(`^${groupNamePrefix}\\[`);
          const checkboxGroup = inputs.filter(
            (input2) => input2.type === "checkbox" && groupNameRegex.test(input2?.getAttribute("name") || "")
          );
          if (checkboxGroup.length > 0) {
            checkboxGroups.push(checkboxGroup);
            checkboxGroup.forEach((input2) => processedInputs.add(input2));
          }
        } else {
          checkboxGroups.push([input]);
          processedInputs.add(input);
        }
      }
      return checkboxGroups;
    }
    getSelects(inputs) {
      return inputs.filter(
        (input) => input.type === "select-one" || input.type === "select-multiple"
      );
    }
    getDatalists(inputs) {
      return inputs.filter(
        (input) => input.getAttribute("list") !== null
      );
    }
    getRadios(inputs) {
      const radioGroups = [];
      const processedNames = /* @__PURE__ */ new Set();
      for (const input of inputs) {
        if (input.type !== "radio") continue;
        const name = input.getAttribute("name");
        if (!name || processedNames.has(name)) continue;
        const radioGroup = inputs.filter(
          (input2) => input2.type === "radio" && input2.getAttribute("name") === name
        );
        if (radioGroup.length > 0) {
          radioGroups.push(radioGroup);
          processedNames.add(name);
        }
      }
      return radioGroups;
    }
  };

  // src/js/autofill.ts
  var Autofill = class {
    constructor(options) {
      this.options = options;
      this.configManager = new ConfigManager(options);
    }
    configManager;
    domForms = [];
    randomInstance;
    get infos() {
      return this.configManager.infos;
    }
    async init() {
      if (!this.configManager.isEnabled) {
        console.warn("Autofill.js is disabled");
        return this;
      }
      const { url } = this.configManager.config;
      if (typeof url === "string" && isValidUrl(url)) {
        await this.configManager.loadFromUrl(url);
      }
      this.initDomForms();
      this.fill();
      if (this.configManager.config.overlay) {
        new Overlay(
          this,
          this.configManager,
          this.domForms
        ).init();
      }
      return this;
    }
    initDomForms() {
      const { inputsSelectors } = this.configManager.config;
      if (!inputsSelectors) return;
      const selector = inputsSelectors.join(",");
      const domInputs = document.querySelectorAll(selector);
      this.domForms = [];
      domInputs.forEach((input) => {
        const form = input.closest("form");
        const existingDomForm = this.domForms.find((domForm) => domForm.form === form);
        if (existingDomForm) {
          existingDomForm.inputs.push(input);
        } else {
          this.domForms.push({ form, inputs: [input] });
        }
      });
    }
    processForm(domForm) {
      const { form, inputs } = domForm;
      const formProcessor = new FormProcessor(this.configManager, form);
      formProcessor.process(inputs);
    }
    fill() {
      if (this.domForms.length === 0) {
        console.log("No input found in the HTML DOM");
        return;
      }
      this.domForms.forEach((domForm) => this.processForm(domForm));
    }
  };
  var autofill = (options) => {
    return new Promise((resolve) => {
      const instance = new Autofill(options);
      if (document.readyState === "complete") {
        resolve(instance.init());
      } else {
        window.addEventListener("load", () => {
          resolve(instance.init());
        });
      }
    });
  };
  window.autofill = autofill;
})();
//# sourceMappingURL=autofill.js.map

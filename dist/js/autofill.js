(() => {
  var __defProp = Object.defineProperty;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __publicField = (obj, key, value) => {
    __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
    return value;
  };

  // src/js/utils.js
  function hasProp(name, obj) {
    return Object.prototype.hasOwnProperty.call(obj, name);
  }
  function asArray(item) {
    return Array.isArray(item) ? item : [item];
  }
  function itemExists(item, array) {
    for (let i = 0; i < array.length; i++) {
      const element = array[i];
      if (item === element) {
        return true;
      } else if (Array.isArray(element) && itemExists(item, element)) {
        return true;
      }
    }
    return false;
  }
  function truncate(string, length) {
    return string.slice(0, Math.max(0, length));
  }
  function toCamelCase(string) {
    if (typeof string !== "undefined") {
      const split = string.split("-").length > 1 ? string.split("-") : string.split("_");
      return split.map((item, index) => {
        if (index > 0) {
          item = item.charAt(0).toUpperCase() + item.slice(1);
        }
        return item;
      }).join("");
    }
    return string;
  }
  function notContainsAttributes(element, attributes) {
    const excludedAttributes = new Set(attributes);
    return element.getAttributeNames().every((attr) => {
      return !excludedAttributes.has(attr);
    });
  }
  function notContainsTypes(input, types) {
    return !types.includes(input.type);
  }

  // src/js/random.js
  var _Random = class {
    constructor({ withPreset }) {
      this.withPreset = withPreset;
      if (this.withPreset) {
        this.initPreset();
      }
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
      return Math.floor((Date.now() - new Date(this.preset.birthdate).getTime()) / 315576e5);
    }
    genPresetUrl() {
      return `https://www.${this.preset.company.toLocaleLowerCase().replace(/\W/g, "")}.${this.preset.tld}`;
    }
    genPresetBirthdate() {
      const date = new Date();
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
      if (_Random.mapInputTypePreset[camelType]) {
        return this.preset[_Random.mapInputTypePreset[camelType]];
      }
    }
    genInputValue(input) {
      let inputValue;
      let type;
      if (input.getAttribute("list")?.length > 0)
        type = "datalist";
      else if (input.tagName === "PROGRESS")
        type = "progress";
      else if (input.tagName === "METER")
        type = "meter";
      else
        type = input.type;
      const stringType = _Random.mapInputTypeStringOption[type] ?? "string";
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
        if (typeof preset !== "undefined")
          inputValue = preset;
      }
      if (typeof inputValue === "undefined") {
        const minlength = input.getAttribute("minlength") ? Number.parseInt(input.getAttribute("minlength")) : false;
        const maxlength = input.getAttribute("maxlength") ? Number.parseInt(input.getAttribute("maxlength")) : false;
        inputValue = _Random.gen(stringType, { min: minlength, max: maxlength });
      }
      return inputValue;
    }
    genSelect(input) {
      const selectType = input.type;
      const options = input.querySelectorAll("option");
      const optionsIndexes = [...options].map((option, index) => option.value.length > 0 ? index : false).filter(Boolean);
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
      if (reg.test(input.getAttribute("name"))) {
        const checkboxesIndexes = [...document.querySelectorAll(`input[name^=${input.getAttribute("name").split("[")[0]}\\[]`)].map((_, index) => index);
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
      const radioIndexes = [...document.querySelectorAll(`[name^=${input.getAttribute("name").split("[")[0]}]`)].map((_, index) => {
        return index;
      });
      return radioIndexes[_Random.genInt(0, radioIndexes.length - 1)];
    }
    genDatalist(input) {
      const options = document.querySelectorAll(`datalist#${input.getAttribute("list")} option`);
      if (options !== null) {
        const optionsIndexes = [...options].map((option, index) => option.value.length > 0 ? index : false).filter(Boolean);
        return optionsIndexes[_Random.genInt(0, optionsIndexes.length - 1)];
      }
    }
    genRange(input) {
      const min = input.getAttribute("min") ?? 0;
      const max = input.getAttribute("max") ?? 100;
      return _Random.genInt(min, max);
    }
    genNumber(input) {
      const min = input.getAttribute("min") ?? -1e3;
      const max = input.getAttribute("max") ?? 1e3;
      return _Random.genInt(min, max);
    }
    genProgress(input) {
      const max = input.getAttribute("max") ?? 100;
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
      return `#${Math.floor(Math.random() * 16777215).toString(16)}`;
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
    static gen(stringType, options) {
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
      options.chars = stringTypes[stringType];
      let randomString = "";
      if (stringType === "email") {
        randomString += _Random.genEmail(options);
      } else {
        if (options.chars) {
          randomString += _Random.genString(options);
        }
      }
      return randomString;
    }
    static genEmail(options) {
      const length = options.len >= 5 ? options.len : 5;
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
      const length = options.len;
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
        if (typeof attrValue !== "undefined") {
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
      start = start instanceof Date ? start : new Date(start);
      end = end instanceof Date ? end : new Date(end);
      return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
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
      if (typeof date === "undefined") {
        date = new Date();
      }
      const datetime = date.toISOString().split(".")[0];
      return datetime;
    }
    static getDate(datetime) {
      return datetime.split("T")[0];
    }
    static getMonth(date) {
      date = date instanceof Date ? date : new Date(date);
      return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, "0")}`;
    }
    static getWeek(date) {
      date = date instanceof Date ? date : new Date(date);
      return `${date.getFullYear()}-W${_Random.getWeekNumber(date).toString().padStart(2, "0")}`;
    }
    static getTime(datetime) {
      return datetime.split("T")[1];
    }
    static getWeekNumber(date) {
      date = date instanceof Date ? date : new Date(date);
      const startDate = new Date(date.getFullYear(), 0, 1);
      const days = Math.floor((date - startDate) / (24 * 60 * 60 * 1e3));
      const weekNumber = Math.ceil(days / 7);
      return weekNumber;
    }
    static getRandomItem(array) {
      return array[Math.floor(Math.random() * array.length)];
    }
  };
  var Random = _Random;
  __publicField(Random, "data", {
    lastname: ["Kent", "Doe", "Bond"],
    firstname: ["Clark", "John", "James"],
    location: [
      {
        country: "United States of America",
        countryCode: 1,
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
        countryCode: 33,
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
  });
  __publicField(Random, "mapInputTypePreset", {
    tel: "phoneNumber",
    email: "email",
    color: "colorHex",
    datetimeLocal: "datetime",
    time: "time",
    date: "date"
  });
  __publicField(Random, "mapInputTypeStringOption", {
    text: "string",
    textarea: "string",
    email: "email",
    password: "password"
  });

  // src/js/overlay.js
  var Overlay = class {
    constructor(autofillInstance) {
      this.autofill = autofillInstance;
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
          <button type="button" class="js-btn-infos">${Overlay.icon("information-circle-outline")}</button>
          <button type="button" class="js-btn-autofill">${Overlay.icon("play-outline")}</button>
          <button type="button" class="js-btn-reset">${Overlay.icon("reload-outline")}</button>
        </div>
        <div class="autofill-overlay-links">
          <a class="npm" href="${autofill2.infos.npm}" title="NPM package">${Overlay.icon("npm")}</a>
          <a class="github" href="${autofill2.infos.github}" title="Github repository">${Overlay.icon("github")}</a>
        </div>
      </div>
      `;
      document.body.insertAdjacentHTML("beforeend", html);
      document.querySelector(".js-btn-reset").addEventListener("click", () => {
        this.autofill.domForms.forEach((domForm) => {
          domForm.form.reset();
          domForm.inputs.forEach((input) => {
            input.checked = false;
          });
        });
      });
      document.querySelector(".js-btn-autofill").addEventListener("click", () => {
        this.autofill.fill();
      });
      document.querySelector(".js-btn-infos").addEventListener("click", () => {
        const config = { ...this.autofill.config };
        const forms = { ...this.autofill.forms };
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
        for (const key in { ...this.autofill.autofillConfig }) {
          const value = this.autofill.autofillConfig[key];
          console.log(`%c${key}`, consoleLogKeyStyle, value);
        }
        console.groupEnd();
        console.groupCollapsed("%cConstructor", configTitleStyle);
        for (const key in this.autofill.options) {
          const value = this.autofill.options[key];
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
    static icon(name) {
      const icons = {
        npm: `<svg xmlns="http://www.w3.org/2000/svg" class="icon icon-${name}" viewBox="0 0 512 512"><title>NPM package</title><path fill="currentColor" d="M227.6 213.1H256v57.1h-28.4z"/><path fill="currentColor" d="M0 156v171.4h142.2V356H256v-28.6h256V156zm142.2 142.9h-28.4v-85.7H85.3v85.7H28.4V184.6h113.8zm142.2 0h-56.9v28.6h-56.9V184.6h113.8zm199.2 0h-28.4v-85.7h-28.4v85.7h-28.4v-85.7H370v85.7h-56.9V184.6h170.7v114.3z"/></svg>`,
        github: `<svg xmlns="http://www.w3.org/2000/svg" class="icon icon-${name}" viewBox="0 0 512 512"><title>Github repository</title><path fill="currentColor" d="M256 32C132.3 32 32 134.9 32 261.7c0 101.5 64.2 187.5 153.2 217.9a17.56 17.56 0 003.8.4c8.3 0 11.5-6.1 11.5-11.4 0-5.5-.2-19.9-.3-39.1a102.4 102.4 0 01-22.6 2.7c-43.1 0-52.9-33.5-52.9-33.5-10.2-26.5-24.9-33.6-24.9-33.6-19.5-13.7-.1-14.1 1.4-14.1h.1c22.5 2 34.3 23.8 34.3 23.8 11.2 19.6 26.2 25.1 39.6 25.1a63 63 0 0025.6-6c2-14.8 7.8-24.9 14.2-30.7-49.7-5.8-102-25.5-102-113.5 0-25.1 8.7-45.6 23-61.6-2.3-5.8-10-29.2 2.2-60.8a18.64 18.64 0 015-.5c8.1 0 26.4 3.1 56.6 24.1a208.21 208.21 0 01112.2 0c30.2-21 48.5-24.1 56.6-24.1a18.64 18.64 0 015 .5c12.2 31.6 4.5 55 2.2 60.8 14.3 16.1 23 36.6 23 61.6 0 88.2-52.4 107.6-102.3 113.3 8 7.1 15.2 21.1 15.2 42.5 0 30.7-.3 55.5-.3 63 0 5.4 3.1 11.5 11.4 11.5a19.35 19.35 0 004-.4C415.9 449.2 480 363.1 480 261.7 480 134.9 379.7 32 256 32z"/></svg>`,
        "information-circle-outline": `<svg xmlns="http://www.w3.org/2000/svg"  class="icon icon-${name}" viewBox="0 0 512 512"><title>Infos (checkout developer tools console)</title><path d="M248 64C146.39 64 64 146.39 64 248s82.39 184 184 184 184-82.39 184-184S349.61 64 248 64z" fill="none" stroke="currentColor" stroke-miterlimit="10" stroke-width="32"/><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="32" d="M220 220h32v116"/><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-miterlimit="10" stroke-width="32" d="M208 340h88"/><path fill="currentColor" d="M248 130a26 26 0 1026 26 26 26 0 00-26-26z"/></svg>`,
        "play-outline": `<svg xmlns="http://www.w3.org/2000/svg" class="icon icon-${name}" viewBox="0 0 512 512"><title>Fill forms</title><path d="M112 111v290c0 17.44 17 28.52 31 20.16l247.9-148.37c12.12-7.25 12.12-26.33 0-33.58L143 90.84c-14-8.36-31 2.72-31 20.16z" fill="none" stroke="currentColor" stroke-miterlimit="10" stroke-width="32"/></svg>`,
        "reload-outline": `<svg xmlns="http://www.w3.org/2000/svg" class="icon icon-${name}" viewBox="0 0 512 512"><title>Reset forms</title><path d="M400 148l-21.12-24.57A191.43 191.43 0 00240 64C134 64 48 150 48 256s86 192 192 192a192.09 192.09 0 00181.07-128" fill="none" stroke="currentColor" stroke-linecap="round" stroke-miterlimit="10" stroke-width="32"/><path fill="currentColor" d="M464 97.42V208a16 16 0 01-16 16H337.42c-14.26 0-21.4-17.23-11.32-27.31L436.69 86.1C446.77 76 464 83.16 464 97.42z"/></svg>`
      };
      return icons[name];
    }
  };

  // src/js/autofill.js
  var Autofill = class {
    autofillInfos = {
      author: "0kyn",
      version: "1.2.2",
      name: "Autofill.js",
      github: "https://github.com/0kyn/autofill-js",
      npm: "https://www.npmjs.com/package/autofill-js"
    };
    autofillConfig = {
      autofill: true,
      autosubmit: false,
      camelize: false,
      events: [],
      generate: false,
      inputAttributes: ["data-autofill", "name", "id", "class"],
      inputAttributesSkip: [],
      inputTypesSkip: [],
      formsSelectors: ["form"],
      inputsSelectors: ["input", "textarea", "select", "progress", "meter"],
      maxlength: false,
      minlength: false,
      overlay: false,
      override: true,
      random: false,
      randomPreset: false,
      url: false
    };
    constructor(formsSelectors, options) {
      this.infos = { ...this.autofillInfos };
      this.config = { ...this.autofillConfig };
      this.initOptions(formsSelectors, options);
      if (this.hasOptions()) {
        this.initFormsOptions();
        this.initConfig();
      }
    }
    async init() {
      if (this.config.url) {
        const configFile = await this.loadFromJson(this.config.url);
        const jsonFormsOptions = { forms: configFile.forms };
        const formsSelectors = Object.keys(configFile.forms);
        this.config = { ...this.autofillConfig, ...configFile.config, ...this.options };
        this.config.formsSelectors = formsSelectors;
        this.formsOptions = this.mergeJsonFormsOptions(jsonFormsOptions, this.formsOptions);
      }
      if (this.hasFormsOptions()) {
        this.initForms();
      }
      this.initDomForms();
      if (this.config.autofill) {
        this.fill();
      }
      if (this.config.overlay) {
        const overlay = new Overlay(this);
        overlay.show();
      }
      return this;
    }
    async loadFromJson(url) {
      const response = await fetch(url);
      const string = await response.text();
      try {
        const object = JSON.parse(string);
        return object;
      } catch (error) {
        console.error(error);
      }
    }
    mergeJsonFormsOptions(...args) {
      const target = {};
      const merger = (obj) => {
        for (const prop in obj) {
          if (hasProp(prop, obj)) {
            if (Object.prototype.toString.call(obj[prop]) === "[object Object]") {
              target[prop] = this.mergeJsonFormsOptions(target[prop], obj[prop]);
            } else {
              target[prop] = obj[prop];
            }
          }
        }
      };
      for (let i = 0; i < args.length; i++) {
        merger(args[i]);
      }
      return target;
    }
    initOptions(formsSelectors, options) {
      if (typeof formsSelectors === "object") {
        this.options = formsSelectors;
      } else {
        this.options = options ?? {};
      }
      this.initFormsSelectors(formsSelectors);
    }
    initFormsSelectors(options) {
      if (typeof options !== "undefined") {
        if (typeof options === "string") {
          this.options.formsSelectors = options.split(",").map((item) => item.trim());
        } else if (Array.isArray(options)) {
          this.options.formsSelectors = options;
        } else if (options.forms) {
          this.options.formsSelectors = Object.keys(options.forms);
        } else if (options.formsSelectors) {
          this.initFormsSelectors(options.formsSelectors);
        }
      }
    }
    initConfig() {
      for (const key in this.options) {
        const option = this.options[key];
        if (hasProp(key, this.autofillConfig)) {
          this.config[key] = option;
        }
      }
    }
    initFormsOptions() {
      const formsOptions = {};
      for (const key in this.options) {
        const option = this.options[key];
        if (!hasProp(key, this.autofillConfig)) {
          formsOptions[key] = option;
        }
      }
      if (Object.keys(formsOptions).length > 0) {
        this.formsOptions = formsOptions;
      }
    }
    initDomForms() {
      const domInputs = document.querySelectorAll(this.config.inputsSelectors);
      let lastForm;
      this.domForms = [];
      let i = -1;
      domInputs.forEach((input) => {
        const form = input.closest("form");
        const condHasForm = form !== null && lastForm !== form;
        const condOrphan = form === null && lastForm !== null;
        if (condHasForm || condOrphan) {
          i++;
          this.domForms[i] = { form, inputs: [] };
        }
        lastForm = form;
        this.domForms[i].inputs = [...this.domForms[i].inputs, input];
      });
    }
    initForms() {
      const forms = {};
      this.config.formsSelectors.forEach((formsSelector) => {
        let inputs = {};
        if (this.formsOptions.inputs) {
          inputs = this.formsOptions.inputs;
        } else if (!this.formsOptions.forms) {
          inputs = this.formsOptions;
        } else if (this.formsOptions.forms[formsSelector]) {
          const form = this.formsOptions.forms[formsSelector];
          forms[formsSelector] = form;
          inputs = form.inputs ?? form;
        }
        forms[formsSelector] = { ...forms[formsSelector], inputs };
      });
      this.forms = forms;
    }
    getFormConfig(formSelector) {
      const config = { ...this.forms[formSelector], formSelector };
      const formConfig = { ...this.config, ...config };
      delete formConfig.inputs;
      return formConfig;
    }
    submit(form, timeout = 1e3) {
      setTimeout(() => {
        const event = new CustomEvent("submit", { cancelable: true });
        form.dispatchEvent(event);
      }, timeout);
    }
    fill() {
      if (Object.keys(this.domForms).length === 0) {
        console.log("No forms found in the HTML DOM");
        console.log("Handle inputs");
        this.handleForm(document);
      } else {
        this.domForms.forEach((dForm) => this.handleForm(dForm));
      }
    }
    handleForm(dForm) {
      let { form, inputs } = dForm;
      const formSelector = this.getFormSelector(form);
      let config = this.config;
      if (this.hasFormsOptions()) {
        if (typeof formSelector === "undefined") {
          return false;
        }
        config = this.getFormConfig(formSelector);
        if (config.random) {
          this.randomInstance = new Random({ withPreset: config.randomPreset });
        }
      } else {
        this.randomInstance = new Random({ withPreset: true });
      }
      inputs = this.inputsConfigFilter(inputs, config);
      const defaultInputs = this.getDefaultInputs(inputs);
      const fileInputs = this.getFileInputs(inputs);
      const checkboxesGroup = this.getCheckboxesGroup(inputs);
      const radiosGroup = this.getRadios(inputs);
      const selects = this.getSelects(inputs);
      const datalists = this.getDatalists(inputs);
      defaultInputs.forEach((input) => this.handleDefaultInput(input, config));
      fileInputs.forEach((input) => this.handleFileInput(input, config));
      checkboxesGroup.forEach((group) => this.handleCheckboxGroup(group, config));
      radiosGroup.forEach((group) => this.handleRadioGroup(group, config));
      selects.forEach((input) => this.handleSelect(input, config));
      datalists.forEach((input) => this.handleDatalist(input, config));
      if (config?.autosubmit) {
        this.submit(form);
      }
    }
    getAfConfigByInput(input, config) {
      if (this.hasFormsOptions() && this.hasFormAndInputs(config)) {
        const afKey = this.getAfKey(input, config);
        if (typeof afKey !== "undefined")
          return this.forms[config.formSelector].inputs[afKey];
      }
      return [];
    }
    getAfValue(afKey, config) {
      const afInput = this.forms[config.formSelector].inputs[afKey];
      if (typeof afInput === "object" && hasProp("value", afInput))
        return afInput.value;
      return afInput;
    }
    getAfKey(input, config) {
      for (let i = 0; i < this.config.inputAttributes.length; i++) {
        const inputAttrName = this.config.inputAttributes[i];
        const inputAttrValue = input.getAttribute(inputAttrName) ?? void 0;
        if (typeof inputAttrValue !== "undefined") {
          const afKey = inputAttrValue.split("[")[0];
          if (typeof this.getAfValue(afKey, config) !== "undefined") {
            return afKey;
          } else if (config.camelize) {
            const camelKey = toCamelCase(afKey);
            if (typeof this.getAfValue(camelKey, config) !== "undefined") {
              return camelKey;
            }
          }
        }
      }
    }
    getInputAfValue(input, config) {
      let value;
      if (this.hasFormsOptions() && this.hasFormAndInputs(config)) {
        const afKey = this.getAfKey(input, config);
        if (typeof afKey !== "undefined") {
          value = this.getAfValue(afKey, config);
          const stringToGen = this.needToGenerate(value, config);
          if (stringToGen) {
            value = Random.parse(stringToGen);
          }
        } else {
          if (config.random) {
            value = this.randomInstance.genInputValue(input);
          }
        }
      } else {
        value = this.randomInstance.genInputValue(input);
      }
      if (config.minlength) {
        const minlength = Number.parseInt(input.getAttribute("minlength"));
        if (!Number.isNaN(minlength) && value.length < minlength) {
          value += Random.gen("string", { len: minlength - value.length });
        }
      }
      if (config.maxlength) {
        const maxlength = Number.parseInt(input.getAttribute("maxlength"));
        if (!Number.isNaN(maxlength) && value.length > maxlength) {
          value = truncate(value, maxlength);
        }
      }
      return value;
    }
    handleDefaultInput(input, config) {
      if (config.override || input.value.length === 0) {
        const value = this.getInputAfValue(input, config);
        if (typeof value !== "undefined") {
          this.setInputProp(input, { key: "value", value }, config);
        }
      }
    }
    handleFileInput(input) {
      console.log(input, "I can't handle you for now...");
    }
    handleCheckboxGroup(group, config) {
      this.handleCheckboxOrRadioGroups(group, config);
    }
    handleRadioGroup(group, config) {
      this.handleCheckboxOrRadioGroups(group, config);
    }
    handleCheckboxOrRadioGroups(group, config) {
      const input = group[0];
      if (!config.override) {
        const groupHasInputChecked = typeof group.find((input2) => input2.checked) !== "undefined";
        if (groupHasInputChecked)
          return;
      }
      const values = asArray(this.getInputAfValue(input, config));
      values.forEach((value, vIndex) => {
        group.forEach((input2, index) => {
          if (typeof value === "string" && input2.value === value) {
            this.setInputProp(input2, { key: "checked", value: true }, config);
          } else if (typeof value === "number" && index === value) {
            this.setInputProp(input2, { key: "checked", value: true }, config);
          } else if (typeof value === "boolean" && index === vIndex) {
            this.setInputProp(input2, { key: "checked", value }, config);
          }
        });
      });
    }
    handleSelect(input, config) {
      const options = input.querySelectorAll("option");
      if (!config.override) {
        const optionsHasSelected = typeof [...options].find((option) => option.selected) !== "undefined";
        if (optionsHasSelected)
          return;
      }
      const values = asArray(this.getInputAfValue(input, config));
      values.forEach((value) => {
        if (typeof value === "string") {
          const option = [...options].find((option2) => this.setInputProp(option2, { key: "selected", value: option2.value }));
          if (typeof option !== "undefined") {
            this.setInputProp(option, { key: "selected", value: true });
          }
        } else if (typeof value === "number") {
          this.setInputProp(options[value], { key: "selected", value: true });
        }
      });
      this.dispatchInputEvents(input, config);
    }
    handleDatalist(input, config) {
      if (config.override || input.value.length === 0) {
        const value = this.getInputAfValue(input, config);
        if (typeof value === "string") {
          this.setInputProp(input, { key: "value", value }, config);
        } else if (typeof value === "number") {
          const options = document.querySelectorAll(`datalist#${input.getAttribute("list")} option`);
          if (options !== null) {
            this.setInputProp(input, { key: "value", value: options[value].value }, config);
          }
        }
      }
    }
    needToGenerate(value, config) {
      const reg = /{{\s(.+?)\s}}/;
      if (config.generate && typeof value === "string" && reg.test(value)) {
        return value.match(reg)[1];
      }
      return false;
    }
    getFormSelector(form) {
      const formsSelectors = this.config.formsSelectors;
      for (let i = 0; i < formsSelectors.length; i++) {
        const formSelector = formsSelectors[i];
        const formSelectored = document.querySelector(formSelector);
        if (form === formSelectored)
          return formSelector;
      }
      for (let i = 0; i < formsSelectors.length; i++) {
        const formSelector = formsSelectors[i];
        const formsSelectored = document.querySelectorAll(formSelector);
        for (let j = 0; j < formsSelectored.length; j++) {
          const formSelectored = formsSelectored[j];
          if (form === formSelectored)
            return formSelector;
        }
      }
    }
    getDefaultInputs(inputs) {
      return inputs.filter((input) => {
        const excludedInputTypes = ["checkbox", "radio", "file", "reset", "submit", "button"];
        const excludedAttributes = ["list"];
        const condType = !excludedInputTypes.includes(input.type);
        const condAttr = notContainsAttributes(input, excludedAttributes);
        return condType && condAttr;
      });
    }
    getFileInputs(inputs) {
      return inputs.filter((input) => input.type === "file");
    }
    getCheckboxesGroup(inputs) {
      const reg = /(.+)\[/;
      let checkboxesGroup = [];
      for (let i = 0; i < inputs.length; i++) {
        const input = inputs[i];
        if (input.type !== "checkbox")
          continue;
        const attrValue = input.getAttribute("name");
        if (attrValue?.match(reg)) {
          const inputExists = itemExists(input, checkboxesGroup);
          if (!inputExists) {
            const reg2 = new RegExp(`^${attrValue.match(reg)[1]}\\[`);
            const checkboxGroup = inputs.filter((input2) => input2.type === "checkbox" && reg2.test(input2.getAttribute("name")));
            if (checkboxGroup.length > 0) {
              checkboxesGroup = [...checkboxesGroup, [...checkboxGroup]];
            }
          }
        } else {
          checkboxesGroup = [...checkboxesGroup, [input]];
        }
      }
      return checkboxesGroup;
    }
    getSelects(inputs) {
      return inputs.filter((input) => ["select-one", "select-multiple"].includes(input.type));
    }
    getDatalists(inputs) {
      return inputs.filter((input) => input.getAttribute("list") !== null);
    }
    getRadios(inputs) {
      let radios = [];
      for (let i = 0; i < inputs.length; i++) {
        const input = inputs[i];
        const attrValue = input.getAttribute("name");
        const inputExists = itemExists(input, radios);
        if (!inputExists) {
          const radioGroup = inputs.filter((input2) => input2.type === "radio" && input2.getAttribute("name") === attrValue);
          if (radioGroup.length > 0) {
            radios = [...radios, [...radioGroup]];
          }
        }
      }
      return radios;
    }
    hasOptions() {
      return typeof this.options !== "undefined" && Object.keys(this.options).length > 0;
    }
    hasFormsOptions() {
      return typeof this.formsOptions !== "undefined";
    }
    hasFormAndInputs(formConfig) {
      return formConfig && this.forms[formConfig.formSelector] && this.forms[formConfig.formSelector].inputs;
    }
    inputsConfigFilter(inputs, config) {
      return inputs.filter((input) => {
        const condAttrs = notContainsAttributes(input, config.inputAttributesSkip);
        const condTypes = notContainsTypes(input, config.inputTypesSkip);
        const cond = condAttrs && condTypes;
        return cond;
      });
    }
    dispatchInputEvents(input, config) {
      const inputEvents = this.getAfConfigByInput(input, config)?.events ?? [];
      const events = inputEvents.length > 0 ? inputEvents : config.events;
      events.forEach((event) => input.dispatchEvent(new Event(event, { cancelable: true })));
    }
    setInputProp(input, { key, value }, config) {
      input[key] = value;
      if (typeof config !== "undefined") {
        this.dispatchInputEvents(input, config);
      }
    }
  };
  var autofill = (formsSelectors, options) => {
    return new Promise((resolve) => {
      const af = new Autofill(formsSelectors, options);
      if (document.readyState === "complete") {
        resolve(af.init());
      } else {
        window.addEventListener("load", () => {
          resolve(af.init());
        });
      }
    });
  };
  window.autofill = autofill;
})();
//# sourceMappingURL=autofill.js.map

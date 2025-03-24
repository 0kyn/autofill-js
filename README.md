# Autofill.js

Autofill.js is a tiny JavaScript library that autofills forms inputs with specific or random values. It might help you during development and form testing.

## Quickest start

If you already have a HTML form you just need to add the snippet below

```html
<script src="https://cdn.jsdelivr.net/npm/autofill-js@2.0.0/dist/js/autofill.min.js"></script>
<script>autofill()</script>
```

[Zero Config example](https://0kyn.github.io/autofill-js/examples/zero-config/index.html)

## Quick Start

1. Include script from jsDelivr CDN

```html
<script src="https://cdn.jsdelivr.net/npm/autofill-js@2.0.0/dist/js/autofill.min.js"></script>
```

2. Get a simple HTML form

```html
<form>
  <input type="text" name="username">
  <input type="email" name="email">
  <input type="password" name="password">

  <select name="selectMultiple" multiple>
    <option value="">Choose locations</option>
    <option value="UKNW">Unknown</option>
    <option value="OCN">Ocean</option>
    <option value="MTN">Mountain</option>
    <option value="PLCE">Place</option>
  </select>

  <input type="checkbox" name="checkboxes[opt1]" value="option1">
  <input type="checkbox" name="checkboxes[opt2]" value="option2">
  <input type="checkbox" name="checkboxes[opt3]" value="option3">
</form>
```

3. Init Autofill.js

This should generates random or/and preset value for every form(s) inputs present in the HTML DOM

```html
<script>
  (async() => {
    await autofill()

    console.log('form inputs filled')
  })()
</script>
```

You might also specify arbitrary values

```javascript
autofill({
  inputs: {
    email: 'john@doe.com',
    // username: 'jdoe', // input is not defined so it lets it empty
    selectMultiple: ['UKNW', 'PLCE'],
    checkboxes: ['option1', 'option2'],
    // as for selectMultiple you can check inputs by values
    checkboxes: [0, 1],
    // or by index position (result is the same as above)
  }
})
```
## Configuration

Below the default Autofill.js config

```javascript
defaultConfig = {
  // enable autofill
  enable: true,

  // display an overlay with config infos & reset/autofill buttons
  overlay: false,

  // JSON config file url
  url: false,

  // form query selector
  formsSelectors: ['form'],

  // generated value must be valid according to inputs attributes ['type', 'minlength',
  validateInputAttributes: ['minlength', 'maxlength'],

  // emit submit event after form's inputs filling
  autosubmit: false,

  // e.g. allow input property 'inputName' to handle 'input-name' or 'input_name'
  camelize: false,

  // trigger events after value set
  events: ['input', 'change'],

  // generate random value where an input's value is formatted as follow {{ password|len?:16 }}
  generate: false,

  // input key attributes targets ordered from the highest priority to the lowest
  inputAttributes: ['data-autofill', 'name', 'id', 'class'],

  // skip autofilling when input has specific attribute. e.g. 'disabled' or 'readonly',
  inputAttributesSkip: [],

  // skip autofilling when input has specific type
  inputTypesSkip: [],

  // inputs support
  inputsSelectors: ['input', 'textarea', 'select', 'progress', 'meter'],

  // override already defined input value
  override: false,

  // if an input value is not defined it fills with a random value
  random: false,

  // if random === true && randomPreset === true then it tries to find a significant preset
  randomPreset: false,

  // handle value in html attribute
  valueAttribute: true,
}
```

> If you need to set specific value (e.g. old input error handling), you might switch `override` to `false`


## Examples

- Handle specific forms

```js
autofill({
  // display an overlay with config infos & reset/autofill buttons
  overlay: true,

  // will generate random values for every undefined input
  random: true,

  // generate string based on definition {{ password|len:16 }} => w{Ck.-FcUvg5!,-@
  generate: true,
  forms: {
    'form#formId, form.formClasses': {
      inputs: {
        email: 'john@doe.com',
        password: '{{ password|len:16 }}'
      }
    }
  }
})

```

- Multiple forms independently

```js
autofill({
  generate: true,
  forms: {
    '#formId': {
      autosubmit: true, // it will autosubmit this form after autofilling
      generate: false,
      inputs: {
        email: 'john@doe.com',
        password: '{{ password|len:16 }}' // display raw text as generate === false for this specific form
      },
    },
    'form.formClasses': {
      email: 'john@do3.com',
      password: '{{ password|len:100 }}' // generates a password
    }
  }
})

```

- Events dispatch

```js
autofill({
  events: ['change', 'input'],
  // dispatch events once input value set
  inputs: {
    username: 'jdoe', // trigger 'change' & 'input'
    email: {
      events: ['click'],
      value: 'john@doe.com' // trigger only 'click'
    },
    password: 'S3cUrEd', // trigger 'change' & 'input'
  }
})

```

- JSON Configuration

```js
autofill({ url: 'https://link.to/file.json' })

```
[JSON Config example](https://0kyn.github.io/autofill-js/examples/json/index.html)

## Sandbox

You can try out Autofill.js on [CodePen](https://codepen.io/0kyn/pen/ZExroMb)

## License

[MIT](https://choosealicense.com/licenses/mit/)

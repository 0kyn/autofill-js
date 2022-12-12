# Autofill.js

Autofill.js is a tiny JavaScript library that autofills forms inputs with specific or random values. It might help you during development and form testing.

## Quickest start

If you already have a HTML form you just need to add the snippet below

```html
<script src="https://cdn.jsdelivr.net/npm/autofill-js@1.2.3/dist/js/autofill.min.js"></script>
<script>autofill()</script>
```

[Zero Config example](https://0kyn.github.io/autofill-js/examples/zero-config/index.html)

## Quick Start

1. Include script from jsDelivr CDN

```html
<script src="https://cdn.jsdelivr.net/npm/autofill-js@1.2.3/dist/js/autofill.min.js"></script>
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

You might also set specify arbitrary values

```javascript
autofill({
  email: 'john@doe.com',
  // username: 'jdoe', // input is not defined so it lets it empty
  selectMultiple: ['UKNW', 'PLCE'],
  checkboxes: ['option1', 'option2'],
  // as for selectMultiple you can check inputs by values
  checkboxes: [0, 1],
  // or by index position (result is the same as above)
})
```
## Configuration

Below the default Autofill.js config

```javascript
autofillConfig = {
  autofill: true, // enable autofill
  autosubmit: false, // emit submit event after form's inputs filling
  camelize: false, // e.g. allow input property 'inputName' to handle 'input-name' or 'input_name'
  generate: false, // generate random value where an input's value is formatted as follow {{ password|len:16 }}
  inputAttributes: ['data-autofill', 'name', 'id', 'class'], // input key attributes targets ordered from the highest priority to the lowest
  inputAttributesSkip: [], // skip autofilling when input has specific attribute. e.g. 'disabled' or 'readonly',
  inputTypesSkip: [], // skip autofilling when input has specific type
  formsSelectors: ['form'], // default form query selector
  inputsSelectors: ['input', 'textarea', 'select', 'progress', 'meter'], // default inputs support
  maxlength: false, // truncate if value length > maxlength attribute
  minlength: false, // fill with random char if value length < minlength attribute
  overlay: false, // display an overlay with config infos & reset/autofill buttons
  override: true, // override already defined input value
  random: false, // if an input value is not defined it fills with a random value
  randomPreset: false, // if random === true && randomPreset === true then it tries to find a significant preset
  url: false // JSON config file url
}
```
> If you need to set specific value (e.g. old input error handling), you might switch `override` to `false`

> When setting `overlay: true`, you'll have to import the CSS
>```html
><link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/autofill-js@1.2.3/dist/css/autofill.min.css">
>```

## Examples

- Handle specific forms

```js
// first arg is a query selector string
// second arg is the config
autofill('form#formId, form.formClasses', {
  overlay: true,
  // display an overlay with config infos & reset/autofill buttons

  random: true,
  // will generate random values for every undefined input

  generate: true,
  // generate string based on definition {{ password|len:16 }} => w{Ck.-FcUvg5!,-@

  inputs: {
    email: 'john@doe.com',
    password: '{{ password|len:16 }}'
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

- JSON Configuration

```js
autofill({ url: 'https://link.to/file.json' })

```
[JSON Config example](https://0kyn.github.io/autofill-js/examples/json/index.html)

## Sandbox

You can try out Autofill.js on [CodePen](https://codepen.io/0kyn/pen/ZExroMb)

## License

[MIT](https://choosealicense.com/licenses/mit/)

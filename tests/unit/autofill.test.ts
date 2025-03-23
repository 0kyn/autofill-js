import { Autofill } from '../../src/js/autofill'

const autofill = new Autofill()

describe('Zero config', () => {
  test('returns an instance of Autofill', () => {
    expect(autofill).toBeInstanceOf(Autofill)
  })
})

import { AutofillInput } from './types/autofill.types'

interface SyntheticEvent {
  target: Element
  currentTarget: Element
  type: string
  bubbles: boolean
  preventDefault: () => void
  stopPropagation: () => void
}

type ReactEventHandler = (event: SyntheticEvent) => void

type Element = AutofillInput | HTMLOptionElement | HTMLFormElement

interface ReactProps {
  onChange?: ReactEventHandler
  onInput?: ReactEventHandler
  onSubmit?: ReactEventHandler
  [key: string]: any
}

interface ReactElement {
  [key: string]: ReactProps | any
}

const isReact15 = (key: string): boolean => key.startsWith('__reactInternalInstance$')
const isReact16 = (key: string): boolean =>
  key.startsWith('__reactProps$') || key.startsWith('__reactEventHandlers$')

const reactMap: Record<string, string> = {
  change: 'onChange',
  input: 'onInput',
  submit: 'onSubmit',
}

const reactPropKey = (
  input: Element,
): string | undefined => {
  const react16Key = Object.keys(input as ReactElement).find(key => isReact16(key))

  if (react16Key) return react16Key

  const react15Key = Object.keys(input as ReactElement).find(key => isReact15(key))

  return react15Key
}

const getReact15EventHandlers = (
  input: Element,
  propKey: string,
): ReactProps | undefined => {
  try {
    const internalInstance = (input as ReactElement)[propKey]

    if (
      internalInstance
      && internalInstance._currentElement
      && internalInstance._currentElement.props
    ) {
      return internalInstance._currentElement.props
    }

    return undefined
  } catch {
    return undefined
  }
}

const fireDefault = (
  input: Element,
  eventName: string,
  options: Record<string, boolean>,
): void => {
  input.dispatchEvent(new Event(eventName, options))
}

const fireReact = (input: Element, eventName: string): void => {
  const rPropKey = reactPropKey(input)
  const mappedEventName = reactMap[eventName]

  if (!rPropKey || !mappedEventName) return

  const syntheticEvent: SyntheticEvent = {
    target: input,
    currentTarget: input,
    type: eventName,
    bubbles: true,
    preventDefault: () => {},
    stopPropagation: () => {},
  }

  if (isReact16(rPropKey)) {
    if (
      (input as ReactElement)[rPropKey]
      && (input as ReactElement)[rPropKey][mappedEventName]
    ) {
      (input as ReactElement)[rPropKey][mappedEventName](syntheticEvent)
    }
  } else if (isReact15(rPropKey)) {
    const props = getReact15EventHandlers(input, rPropKey)
    if (props && props[mappedEventName]) {
      props[mappedEventName](syntheticEvent)
    }
  }
}

export const fireEvent = (
  input: Element,
  eventName: string,
  options?: Record<string, boolean>,
): void => {
  const isReactInput = reactPropKey(input) !== undefined
  options = { cancelable: true, bubbles: false, ...options }

  if (!isReactInput) {
    fireDefault(input, eventName, options)
  } else {
    fireReact(input, eventName)
  }
}

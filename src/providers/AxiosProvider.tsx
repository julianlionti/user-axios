import useDidUpdate from '@rooks/use-did-update'
import React, { createContext, memo, useContext, useReducer } from 'react'
import { ErrorType } from '../services/requests'

type ContextType<T extends unknown> = [FullState<T>, React.Dispatch<Action>]

const intialState: FullState = { headers: {}, urls: {} }
export const AxiosContext = createContext<ContextType<unknown>>([intialState, () => {}])
export const useAxiosContext = <T,>(): ContextType<T> => useContext(AxiosContext) as ContextType<T>

export type HeadersType = Record<string, unknown> | null
type ProviderPros = React.PropsWithChildren<{
  headers?: HeadersType
}>

type UrlState<T> = { data: T; loading: boolean; error?: ErrorType; status?: number }
type FullState<T = unknown> = { headers: HeadersType; urls: Record<string, UrlState<T>> }

type Action =
  | { type: 'FETCH'; key: string }
  | { type: 'FINISH'; key: string; data: unknown; status: number }
  | { type: 'ERROR'; key: string; error: ErrorType }
  | { type: 'CLEAN'; key: string }
  | { type: 'UPDATE_HEADERS'; headers?: HeadersType }

const fullState = (state: FullState, key: string, update: UrlState<unknown>) => ({
  ...state,
  urls: { ...state.urls, [key]: update },
})

const reducer = (state: FullState, action: Action): FullState => {
  switch (action.type) {
    case 'FETCH':
      return fullState(state, action.key, { data: null, loading: true })
    case 'FINISH': {
      const { data, key, status } = action
      return fullState(state, key, { data, loading: false, status })
    }
    case 'ERROR': {
      const { error, key } = action
      return fullState(state, key, { data: null, loading: false, error })
    }
    case 'CLEAN': {
      return fullState(state, action.key, { data: null, loading: false, error: undefined })
    }
    case 'UPDATE_HEADERS': {
      return { ...state, headers: action.headers || null }
    }
    default:
      return state
  }
}

export const AxiosProvider = memo(
  (props: ProviderPros): JSX.Element => {
    const { children, headers } = props
    const [state, dispatch] = useReducer(reducer, { ...intialState, headers: headers || {} })

    useDidUpdate(() => {
      dispatch({ type: 'UPDATE_HEADERS', headers })
    }, [headers])

    return <AxiosContext.Provider value={[state, dispatch]}>{children}</AxiosContext.Provider>
  },
)

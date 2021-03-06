import { AxiosRequestConfig } from 'axios'
import { useCallback, useEffect, useRef } from 'react'
import { useAxiosContext } from '../providers/AxiosProvider'
import { ErrorState, ErrorType, makeRequest } from '../services/requests'

type UseAxios<T> = [
  T | null, // RESPONSE
  boolean, // LOADING
  (config?: AxiosConfig) => Promise<void>, //CALL
  () => void, // CLEAN
  number | undefined, // STATUS
  ErrorType | undefined, // ERRORE
]

export type AxiosConfig = Omit<AxiosRequestConfig, 'url'>
interface Props {
  onInit?: AxiosConfig
  onError?: (error: ErrorState) => void
}

export const useAxios = <T extends unknown>(url: string, config?: Props): UseAxios<T> => {
  const onInitRef = useRef(false)
  const lastCallRef = useRef<AxiosRequestConfig>({ url, method: 'GET' })
  const [state, dispatch] = useAxiosContext<T>()
  const { headers, urls } = state
  const actual = (urls && urls[url]) || { data: null, loading: false }

  const { onError, onInit } = config || {}

  const call = useCallback(
    async (config?: AxiosConfig) => {
      dispatch({ type: 'FETCH', key: url })
      let finalConfig: AxiosRequestConfig = !config ? lastCallRef.current : { url, ...config }

      if (headers && finalConfig.headers === undefined) {
        finalConfig = { ...finalConfig, headers }
      } else if (headers && finalConfig.headers) {
        finalConfig = { ...finalConfig, headers: { ...headers, ...finalConfig.headers } }
      }

      const { data, status, error } = (await makeRequest(finalConfig)) || {}
      if (data && status) {
        lastCallRef.current = finalConfig
        dispatch({ type: 'FINISH', key: url, data, status })
      } else if (error) {
        dispatch({ type: 'ERROR', key: url, error })
        
        if (onError)
          switch (error.type) {
            default:
            case 'single':
              onError(error.error)
              break
            case 'multiple':
              error.errors.forEach((err) => onError(err))
              break
          }
      }
    },
    [dispatch, headers, url, onError],
  )

  const clean = useCallback(() => {
    dispatch({ type: 'CLEAN', key: url })
  }, [url, dispatch])

  useEffect(() => {
    if (onInit && !onInitRef.current) {
      onInitRef.current = true
      call(onInit)
    }
  }, [onInit, call])

  return [actual.data, actual.loading, call, clean, actual.status, actual.error]
}

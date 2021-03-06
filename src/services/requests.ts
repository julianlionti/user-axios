import axios, { AxiosError, AxiosRequestConfig } from 'axios'

export type ErrorState = { message: string; code: number }
export type ErrorType = { error: ErrorState; type: 'single' } | { errors: ErrorState[]; type: 'multiple' }

interface RequestReturn<T extends unknown> {
  data?: T
  status?: number
  error?: ErrorType
}

export const makeRequest = async <T extends unknown>(
  config: AxiosRequestConfig,
): Promise<RequestReturn<T>> => {
  try {
    const { data, status } = await axios(config)
    return { data, status }
  } catch (ex) {
    const { response } = ex as AxiosError
    if (response?.status === 500) {
      const { data } = response || {}
      return {
        error: {
          error: { code: data?.statusCode || 500, message: data?.code || 'Server error' },
          type: 'single',
        },
      }
    }
    if (response?.data) return response.data

    return { error: { error: { message: 'Network Error', code: 501 }, type: 'single' } }
  }
}

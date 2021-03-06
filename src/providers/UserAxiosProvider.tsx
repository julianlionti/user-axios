import React, {
  createContext,
  Dispatch,
  PropsWithChildren,
  SetStateAction,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react'
import { AxiosProvider, HeadersType } from './AxiosProvider'

export type UserType<T> = T | null
type ContextType<T> = [UserType<T>, Dispatch<SetStateAction<UserType<T>>>]

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const UserContext = createContext<ContextType<UserType<any>>>([null, () => {}])
export const useUserContext = <T,>(): ContextType<T> => useContext(UserContext)

type ProviderPros<T> = PropsWithChildren<{
  headers?: HeadersType
  user: UserType<T>
  onUser: (user: UserType<T>) => void
}>

export const UserAxiosProvider = <T,>(props: ProviderPros<T>): JSX.Element => {
  const firstUpdate = useRef(true)
  const { children, user, onUser, headers } = props
  const [state, setState] = useState<UserType<T>>(user)

  useEffect(() => {
    if (firstUpdate.current) {
      firstUpdate.current = false
      return
    }

    onUser(state)
  }, [onUser, state])

  return (
    <UserContext.Provider value={[state, setState]}>
      <AxiosProvider headers={headers}>{children}</AxiosProvider>
    </UserContext.Provider>
  )
}

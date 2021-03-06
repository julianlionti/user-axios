// import React from 'react'

import { Dispatch, SetStateAction } from 'react'
import { UserType, useUserContext } from '../providers/UserAxiosProvider'

interface UseUserReturn<T> {
  user: UserType<T>
  setUser: Dispatch<SetStateAction<T | null>>
}

export const useUser = <T,>(): UseUserReturn<T> => {
  const [user, setUser] = useUserContext<T>()
  return { user, setUser }
}

// import React from 'react'

interface UseUserReturn {
  prueba: string
}

export const useUser = (prueba: string): UseUserReturn => {
  return { prueba }
}

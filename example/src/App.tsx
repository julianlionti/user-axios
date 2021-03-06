import React from 'react'
import { useState } from 'react'
import { useUser, UserAxiosProvider, makeRequest, useAxios } from 'user-axios'
import './App.css'

interface UserProps {
  token: string
  name: string
}

interface WSReponse {
  alpha3Code: string
  borders: string[]
  capital: string
  flag: string
  name: string
  population: number
  region: string
  subregion: string
}

const Urls = {
  paises: 'https://restcountries.eu/rest/v2/name/argentina',
}

const InnerComponent = () => {
  const { user, setUser } = useUser<UserProps>()
  const [response, loading, call] = useAxios<WSReponse[]>(Urls.paises, {
    onInit: {},
    onError: (err) => console.log(err),
  })

  const [first] = response || []

  return (
    <div className={'container'}>
      {loading && <p>Cargando</p>}
      <p>User - Axios</p>
      <p>{`${user ? 'Usuario:' + user.name : 'No hay usuario'}`}</p>
      <p id="headers"></p>

      <div>
        <button onClick={() => setUser((e) => (e ? null : { name: 'sada', token: 'sarrea' }))}>
          {user ? 'Log out' : 'Login'}
        </button>
        <button onClick={() => call()}>Buscar Info</button>
      </div>
      {first && (
        <div>
          <img src={first.flag} alt={first.name} />
          <div>{first.alpha3Code}</div>
          <div>{first.capital}</div>
          <div>{first.name}</div>
        </div>
      )}
    </div>
  )
}

interface UserPops {
  user: string
  token: string
}

const userKey = 'UserAxios-USER'
const App = () => {
  const [user, setUser] = useState(() => {
    const userFromStorage = localStorage.getItem(userKey)
    if (!userFromStorage) return null
    return JSON.parse(userFromStorage) as UserProps
  })

  return (
    <UserAxiosProvider
      user={user}
      headers={user && { Authorization: user.token }}
      onUser={(user) => {
        setUser(user)
        if (user) localStorage.setItem(userKey, JSON.stringify(user))
        else localStorage.removeItem(userKey)
      }}>
      <InnerComponent />
    </UserAxiosProvider>
  )
}

export default App

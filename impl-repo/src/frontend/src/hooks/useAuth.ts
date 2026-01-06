/**
 * 認証フック
 * JWT認証とユーザー状態管理
 */

import { useState, useEffect, useCallback } from 'react'
import axios from 'axios'

interface User {
  id: number
  username: string
  display_name: string | null
  role: string
  venue_id: number | null
}

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
}

const TOKEN_KEY = 'urawacup_token'
const USER_KEY = 'urawacup_user'

// Axiosデフォルト設定
axios.defaults.baseURL = import.meta.env.VITE_API_URL || ''

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: true,
  })

  // 初期化：ローカルストレージから復元
  useEffect(() => {
    const storedToken = localStorage.getItem(TOKEN_KEY)
    const storedUser = localStorage.getItem(USER_KEY)

    if (storedToken && storedUser) {
      try {
        const user = JSON.parse(storedUser)
        axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`
        setState({
          user,
          token: storedToken,
          isAuthenticated: true,
          isLoading: false,
        })
      } catch {
        localStorage.removeItem(TOKEN_KEY)
        localStorage.removeItem(USER_KEY)
        setState(prev => ({ ...prev, isLoading: false }))
      }
    } else {
      setState(prev => ({ ...prev, isLoading: false }))
    }
  }, [])

  // ログイン
  const login = useCallback(async (username: string, password: string) => {
    const formData = new FormData()
    formData.append('username', username)
    formData.append('password', password)

    const response = await axios.post('/api/auth/login', formData)
    const { access_token, user } = response.data

    localStorage.setItem(TOKEN_KEY, access_token)
    localStorage.setItem(USER_KEY, JSON.stringify(user))
    axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`

    setState({
      user,
      token: access_token,
      isAuthenticated: true,
      isLoading: false,
    })

    return user
  }, [])

  // ログアウト
  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    delete axios.defaults.headers.common['Authorization']

    setState({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
    })
  }, [])

  // 権限チェック
  const hasRole = useCallback((roles: string | string[]) => {
    if (!state.user) return false
    const roleArray = Array.isArray(roles) ? roles : [roles]
    return roleArray.includes(state.user.role)
  }, [state.user])

  return {
    ...state,
    login,
    logout,
    hasRole,
  }
}

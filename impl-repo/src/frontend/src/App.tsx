/**
 * メインアプリケーション
 * ルーティング設定
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'

// Layouts
import { AuthLayout } from './layouts/AuthLayout'
import { AdminLayout } from './layouts/AdminLayout'

// 公開ページ（認証不要）
import { PublicStandings } from './pages/PublicStandings'
import { PublicMatches } from './pages/PublicMatches'

// 認証ページ
import { Login } from './pages/Login'

// 管理ページ（認証必要）
import { Dashboard } from './pages/Dashboard'
import { Tournaments } from './pages/Tournaments'
import { Teams } from './pages/Teams'
import { Venues } from './pages/Venues'
import { Matches } from './pages/Matches'
import { MatchEntry } from './pages/MatchEntry'
import { Standings } from './pages/Standings'
import { Scorers } from './pages/Scorers'
import { FinalDay } from './pages/FinalDay'
import { Reports } from './pages/Reports'
import { Approvals } from './pages/Approvals'
import { Users } from './pages/Users'
import { Settings } from './pages/Settings'

// Store
import { useAppStore } from './store/appStore'
import { useEffect, useState } from 'react'
import axios from 'axios'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60, // 1分
      retry: 1,
    },
  },
})

// 認証が必要なルートのラッパー
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, setUser } = useAppStore()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
      // トークンからユーザー情報を復元
      axios.get('/api/auth/me')
        .then(res => {
          setUser(res.data)
        })
        .catch(() => {
          localStorage.removeItem('token')
        })
        .finally(() => {
          setIsLoading(false)
        })
    } else {
      setIsLoading(false)
    }
  }, [setUser])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* 公開ページ（認証不要） */}
          <Route path="/public">
            <Route path="standings" element={<PublicStandings />} />
            <Route path="matches" element={<PublicMatches />} />
          </Route>

          {/* 認証ページ */}
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<Login />} />
          </Route>

          {/* 管理ページ（認証必要） */}
          <Route
            element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/" element={<Dashboard />} />
            <Route path="/tournaments" element={<Tournaments />} />
            <Route path="/teams" element={<Teams />} />
            <Route path="/venues" element={<Venues />} />
            <Route path="/matches" element={<Matches />} />
            <Route path="/matches/:matchId/entry" element={<MatchEntry />} />
            <Route path="/standings" element={<Standings />} />
            <Route path="/scorers" element={<Scorers />} />
            <Route path="/final-day" element={<FinalDay />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/approvals" element={<Approvals />} />
            <Route path="/users" element={<Users />} />
            <Route path="/settings" element={<Settings />} />
          </Route>

          {/* 404 - 公開順位表へリダイレクト */}
          <Route path="*" element={<Navigate to="/public/standings" replace />} />
        </Routes>
      </BrowserRouter>
      <Toaster position="top-right" />
    </QueryClientProvider>
  )
}

export default App

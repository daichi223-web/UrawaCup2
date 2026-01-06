/**
 * 管理画面用レイアウト
 * サイドバー + メインコンテンツ
 */

import { useState } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAppStore } from '../store/appStore'

const navItems = [
  { path: '/', label: 'ダッシュボード', icon: '📊' },
  { path: '/tournaments', label: '大会管理', icon: '🏆' },
  { path: '/teams', label: 'チーム管理', icon: '👥' },
  { path: '/venues', label: '会場管理', icon: '🏟️' },
  { path: '/matches', label: '試合管理', icon: '⚽' },
  { path: '/standings', label: '順位表', icon: '📋' },
  { path: '/scorers', label: '得点ランキング', icon: '🥇' },
  { path: '/final-day', label: '最終日設定', icon: '📅' },
  { path: '/reports', label: '帳票出力', icon: '📄' },
  { path: '/approvals', label: '承認管理', icon: '✅' },
  { path: '/users', label: 'ユーザー管理', icon: '👤' },
  { path: '/settings', label: '設定', icon: '⚙️' },
]

export function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { user, logout } = useAppStore()
  const navigate = useNavigate()

  const handleLogout = () => {
    localStorage.removeItem('token')
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* モバイルヘッダー */}
      <header className="lg:hidden bg-red-600 text-white p-4 flex justify-between items-center">
        <button
          onClick={() => setSidebarOpen(true)}
          className="p-2 hover:bg-red-700 rounded"
        >
          ☰
        </button>
        <h1 className="font-bold">浦和カップ</h1>
        <div className="w-10"></div>
      </header>

      {/* モバイルサイドバーオーバーレイ */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* サイドバー */}
      <aside
        className={`
          fixed top-0 left-0 h-full w-64 bg-gray-800 text-white z-50
          transform transition-transform duration-300
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0
        `}
      >
        {/* ロゴ */}
        <div className="p-4 border-b border-gray-700">
          <h1 className="text-xl font-bold">浦和カップ</h1>
          <p className="text-sm text-gray-400">トーナメント管理</p>
        </div>

        {/* ナビゲーション */}
        <nav className="p-4 space-y-1 overflow-y-auto max-h-[calc(100vh-200px)]">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded transition ${
                  isActive
                    ? 'bg-red-600 text-white'
                    : 'text-gray-300 hover:bg-gray-700'
                }`
              }
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* ユーザー情報 */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">{user?.displayName || user?.username}</p>
              <p className="text-xs text-gray-400">{user?.role}</p>
            </div>
            <button
              onClick={handleLogout}
              className="px-3 py-1 text-sm bg-gray-700 hover:bg-gray-600 rounded"
            >
              ログアウト
            </button>
          </div>
        </div>
      </aside>

      {/* メインコンテンツ */}
      <main className="lg:ml-64 min-h-screen">
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  )
}

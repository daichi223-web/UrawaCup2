/**
 * Supabase接続テスト用ページ
 */

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function SupabaseTest() {
  const [tournament, setTournament] = useState<any>(null)
  const [groups, setGroups] = useState<any[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [debugInfo, setDebugInfo] = useState<any>({})

  useEffect(() => {
    async function fetchData() {
      // デバッグ情報を収集
      const debug: any = {
        supabaseUrl: import.meta.env.VITE_SUPABASE_URL || 'NOT SET',
        hasAnonKey: !!import.meta.env.VITE_SUPABASE_ANON_KEY,
        anonKeyPrefix: import.meta.env.VITE_SUPABASE_ANON_KEY?.substring(0, 20) || 'NOT SET',
      }
      setDebugInfo(debug)

      try {
        console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL)
        console.log('Anon Key exists:', !!import.meta.env.VITE_SUPABASE_ANON_KEY)

        // 大会データを取得
        console.log('Fetching tournaments...')
        const { data: tournamentData, error: tError } = await supabase
          .from('tournaments')
          .select('*')
          .eq('id', 1)
          .single()

        console.log('Tournament response:', { data: tournamentData, error: tError })

        if (tError) {
          console.error('Tournament error:', tError)
          throw new Error(`Tournament: ${tError.message} (${tError.code})`)
        }
        setTournament(tournamentData)

        // グループデータを取得
        console.log('Fetching groups...')
        const { data: groupsData, error: gError } = await supabase
          .from('groups')
          .select('*')
          .eq('tournament_id', 1)
          .order('id')

        console.log('Groups response:', { data: groupsData, error: gError })

        if (gError) {
          console.error('Groups error:', gError)
          throw new Error(`Groups: ${gError.message} (${gError.code})`)
        }
        setGroups(groupsData || [])

      } catch (err: any) {
        console.error('Catch error:', err)
        const errorMessage = err?.message || err?.toString() || JSON.stringify(err) || '不明なエラー'
        setError(errorMessage)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-lg">Supabase接続中...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <strong>エラー:</strong> {error}
        </div>
        <div className="bg-gray-100 border border-gray-400 text-gray-700 px-4 py-3 rounded">
          <strong>デバッグ情報:</strong>
          <pre className="mt-2 text-sm">{JSON.stringify(debugInfo, null, 2)}</pre>
          <p className="mt-2 text-sm">ブラウザのコンソール (F12) も確認してください</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-green-600">
        ✅ Supabase接続成功！
      </h1>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-bold mb-4">大会情報</h2>
        {tournament && (
          <dl className="space-y-2">
            <div className="flex">
              <dt className="font-medium w-24">ID:</dt>
              <dd>{tournament.id}</dd>
            </div>
            <div className="flex">
              <dt className="font-medium w-24">大会名:</dt>
              <dd>{tournament.name}</dd>
            </div>
            <div className="flex">
              <dt className="font-medium w-24">略称:</dt>
              <dd>{tournament.short_name}</dd>
            </div>
            <div className="flex">
              <dt className="font-medium w-24">開催年:</dt>
              <dd>{tournament.year}</dd>
            </div>
            <div className="flex">
              <dt className="font-medium w-24">期間:</dt>
              <dd>{tournament.start_date} 〜 {tournament.end_date}</dd>
            </div>
          </dl>
        )}
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-bold mb-4">グループ一覧</h2>
        <div className="grid grid-cols-2 gap-4">
          {groups.map(group => (
            <div key={group.id} className="bg-gray-100 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-primary-600">{group.id}</div>
              <div className="text-sm text-gray-600">{group.name}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 text-center text-gray-500 text-sm">
        Supabase URL: {import.meta.env.VITE_SUPABASE_URL}
      </div>
    </div>
  )
}

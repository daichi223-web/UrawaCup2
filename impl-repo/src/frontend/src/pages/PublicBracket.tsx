/**
 * 公開組み合わせ表画面（認証不要）
 * F-92: 一般公開用トーナメント組み合わせ
 */

import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'

interface Team {
  id: number
  name: string
  short_name: string | null
}

interface Match {
  id: number
  match_date: string | null
  match_time: string | null
  group_id: string | null
  stage: string | null
  status: string | null
  venue: string | null
  home_team: Team | null
  away_team: Team | null
  home_score: number | null
  away_score: number | null
}

interface ScheduleData {
  tournament_id: number
  dates: string[]
  matches_by_date: Record<string, Match[]>
}

interface Tournament {
  id: number
  name: string
  year: number
  edition: number
  start_date: string | null
  end_date: string | null
}

export function PublicBracket() {
  const [tournamentId, setTournamentId] = useState<number | null>(null)
  const [selectedDate, setSelectedDate] = useState<string>('all')

  // 大会一覧を取得
  const { data: tournaments = [] } = useQuery<Tournament[]>({
    queryKey: ['public-tournaments'],
    queryFn: async () => {
      const res = await axios.get('/api/public/tournaments')
      return res.data
    },
  })

  // 最新の大会を自動選択
  useEffect(() => {
    if (tournaments.length > 0 && !tournamentId) {
      setTournamentId(tournaments[0].id)
    }
  }, [tournaments, tournamentId])

  // 日程別試合一覧を取得
  const { data: scheduleData, isLoading } = useQuery<ScheduleData>({
    queryKey: ['public-schedule', tournamentId],
    queryFn: async () => {
      const res = await axios.get(`/api/public/tournaments/${tournamentId}/schedule`)
      return res.data
    },
    enabled: !!tournamentId,
    refetchInterval: 60000,
  })

  const currentTournament = tournaments.find(t => t.id === tournamentId)

  const getStageLabel = (stage: string | null) => {
    const labels: Record<string, string> = {
      preliminary: '予選リーグ',
      semifinal: '準決勝',
      third_place: '3位決定戦',
      final: '決勝',
      training: '研修試合',
    }
    return stage ? labels[stage] || stage : ''
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    const month = date.getMonth() + 1
    const day = date.getDate()
    const weekdays = ['日', '月', '火', '水', '木', '金', '土']
    const weekday = weekdays[date.getDay()]
    return `${month}/${day}(${weekday})`
  }

  const renderMatchRow = (match: Match) => (
    <tr key={match.id} className="border-b hover:bg-gray-50">
      <td className="px-3 py-2 text-center text-sm">{match.match_time || '-'}</td>
      <td className="px-3 py-2 text-center text-sm">{match.venue || '-'}</td>
      <td className="px-3 py-2 text-right font-medium">
        {match.home_team?.short_name || match.home_team?.name || 'TBD'}
      </td>
      <td className="px-3 py-2 text-center">
        {match.status === 'completed' ? (
          <span className="font-bold">{match.home_score} - {match.away_score}</span>
        ) : match.status === 'in_progress' ? (
          <span className="font-bold text-red-600">{match.home_score ?? 0} - {match.away_score ?? 0}</span>
        ) : (
          <span className="text-gray-400">vs</span>
        )}
      </td>
      <td className="px-3 py-2 text-left font-medium">
        {match.away_team?.short_name || match.away_team?.name || 'TBD'}
      </td>
      <td className="px-3 py-2 text-center">
        {match.group_id && (
          <span className="px-2 py-0.5 bg-red-50 text-red-700 text-xs rounded">
            {match.stage === 'preliminary' ? `G${match.group_id}` : getStageLabel(match.stage)}
          </span>
        )}
        {!match.group_id && match.stage && (
          <span className="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs rounded">
            {getStageLabel(match.stage)}
          </span>
        )}
      </td>
    </tr>
  )

  const renderDateSection = (dateStr: string, matches: Match[]) => {
    // グループごとに分類
    const groupedMatches: Record<string, Match[]> = {}
    matches.forEach(m => {
      const key = m.group_id ? `グループ${m.group_id}` : getStageLabel(m.stage) || 'その他'
      if (!groupedMatches[key]) groupedMatches[key] = []
      groupedMatches[key].push(m)
    })

    return (
      <div key={dateStr} className="mb-8">
        <h3 className="text-lg font-bold mb-3 text-gray-800 flex items-center gap-2">
          <span className="bg-red-600 text-white px-3 py-1 rounded">
            {formatDate(dateStr)}
          </span>
        </h3>

        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-3 py-2 text-center text-sm font-medium text-gray-600 w-20">時間</th>
                <th className="px-3 py-2 text-center text-sm font-medium text-gray-600 w-24">会場</th>
                <th className="px-3 py-2 text-right text-sm font-medium text-gray-600">ホーム</th>
                <th className="px-3 py-2 text-center text-sm font-medium text-gray-600 w-20">スコア</th>
                <th className="px-3 py-2 text-left text-sm font-medium text-gray-600">アウェイ</th>
                <th className="px-3 py-2 text-center text-sm font-medium text-gray-600 w-24">区分</th>
              </tr>
            </thead>
            <tbody>
              {matches
                .sort((a, b) => (a.match_time || '').localeCompare(b.match_time || ''))
                .map(renderMatchRow)}
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* ヘッダー */}
      <header className="bg-red-600 text-white py-4 px-4 shadow-lg">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-xl font-bold">📋 浦和カップ 組み合わせ表</h1>
          {currentTournament && (
            <p className="text-sm opacity-90 mt-1">
              第{currentTournament.edition}回 {currentTournament.name}
            </p>
          )}
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6">
        {/* 日程フィルター */}
        {scheduleData && scheduleData.dates.length > 0 && (
          <div className="mb-6 flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedDate('all')}
              className={`px-4 py-2 rounded-full font-medium transition ${
                selectedDate === 'all'
                  ? 'bg-red-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              全日程
            </button>
            {scheduleData.dates.map((date, idx) => (
              <button
                key={date}
                onClick={() => setSelectedDate(date)}
                className={`px-4 py-2 rounded-full font-medium transition ${
                  selectedDate === date
                    ? 'bg-red-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                Day{idx + 1}
              </button>
            ))}
          </div>
        )}

        {/* ナビゲーション */}
        <div className="mb-6 flex gap-2">
          <a
            href="/public/standings"
            className="px-4 py-2 bg-white text-gray-700 rounded-lg shadow hover:bg-gray-50 transition"
          >
            順位表
          </a>
          <a
            href="/public/matches"
            className="px-4 py-2 bg-white text-gray-700 rounded-lg shadow hover:bg-gray-50 transition"
          >
            試合結果
          </a>
        </div>

        {/* 試合一覧 */}
        {isLoading ? (
          <div className="text-center py-12 text-gray-500">
            <div className="animate-spin inline-block w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full mb-4"></div>
            <p>読み込み中...</p>
          </div>
        ) : scheduleData && scheduleData.dates.length > 0 ? (
          <>
            {selectedDate === 'all'
              ? scheduleData.dates.map(date =>
                  renderDateSection(date, scheduleData.matches_by_date[date] || [])
                )
              : scheduleData.matches_by_date[selectedDate] &&
                renderDateSection(selectedDate, scheduleData.matches_by_date[selectedDate])}
          </>
        ) : (
          <div className="text-center py-12 text-gray-500">
            試合データがありません
          </div>
        )}
      </main>

      {/* フッター */}
      <footer className="bg-gray-800 text-white py-4 px-4 mt-8">
        <div className="max-w-5xl mx-auto text-center text-sm">
          <p>さいたま市招待高校サッカーフェスティバル</p>
          <p className="opacity-70 mt-1">浦和カップ運営事務局</p>
        </div>
      </footer>
    </div>
  )
}

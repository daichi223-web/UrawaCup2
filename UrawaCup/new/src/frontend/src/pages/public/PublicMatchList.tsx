import { useState, useEffect } from 'react';
import { matchesApi } from '@/lib/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { MapPin, Clock } from 'lucide-react';

// Supabaseから取得するデータの型
interface MatchData {
    id: number;
    match_date: string;
    match_time: string;
    status: string;
    home_score_total: number | null;
    away_score_total: number | null;
    home_pk: number | null;
    away_pk: number | null;
    home_team: { id: number; name: string } | null;
    away_team: { id: number; name: string } | null;
    venue: { id: number; name: string } | null;
}

export default function PublicMatchList() {
    const [matches, setMatches] = useState<MatchData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const tournamentId = 1;

    useEffect(() => {
        const fetchMatches = async () => {
            try {
                setLoading(true);
                setError(null);
                const data = await matchesApi.getAll(tournamentId);
                // Sort by date and time
                const sorted = (data.matches as MatchData[]).sort((a, b) => {
                    const aTime = `${a.match_date} ${a.match_time}`;
                    const bTime = `${b.match_date} ${b.match_time}`;
                    return new Date(aTime).getTime() - new Date(bTime).getTime();
                });
                setMatches(sorted);
            } catch (err) {
                console.error("Failed to load matches", err);
                setError("試合データの読み込みに失敗しました");
            } finally {
                setLoading(false);
            }
        };
        fetchMatches();
    }, [tournamentId]);

    if (loading) return <div className="flex justify-center py-10"><LoadingSpinner /></div>;

    if (error) {
        return (
            <div className="text-center py-10 text-red-600">
                {error}
            </div>
        );
    }

    if (matches.length === 0) {
        return (
            <div className="text-center py-10 text-gray-500">
                試合データがありません
            </div>
        );
    }

    // Group by Date for cleaner UI
    const groupedMatches = matches.reduce((acc, match) => {
        const dateStr = match.match_date || '';
        const date = format(new Date(dateStr), 'M月d日(E)', { locale: ja });
        if (!acc[date]) acc[date] = [];
        acc[date].push(match);
        return acc;
    }, {} as Record<string, MatchData[]>);

    return (
        <div className="space-y-6 pb-20">
            {Object.entries(groupedMatches).map(([date, dayMatches]) => (
                <div key={date}>
                    <h2 className="text-sm font-bold text-gray-500 mb-3 px-1 sticky top-0 bg-gray-50 py-2 z-10">
                        {date}
                    </h2>
                    <div className="space-y-3">
                        {dayMatches.map(match => (
                            <PublicMatchCard key={match.id} match={match} />
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}

function PublicMatchCard({ match }: { match: MatchData }) {
    const isFinished = match.status === 'completed';
    const isLive = match.status === 'in_progress';

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Header: Time & Venue */}
            <div className="bg-gray-50 px-4 py-2 flex justify-between items-center text-xs text-gray-500">
                <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {match.match_time || '--:--'}
                    {isLive && <span className="ml-2 text-red-600 font-bold animate-pulse">● LIVE</span>}
                    {isFinished && <span className="ml-2 font-medium text-gray-400">終了</span>}
                </div>
                <div className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {match.venue?.name || '未定'}
                </div>
            </div>

            {/* Score Board */}
            <div className="p-4">
                <div className="flex items-center justify-between">
                    {/* Home Team */}
                    <div className="flex-1 flex flex-col items-center gap-1">
                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-700 text-xs">
                            {match.home_team?.name?.slice(0, 1) || '?'}
                        </div>
                        <span className="font-bold text-sm text-center leading-tight">
                            {match.home_team?.name || 'TBD'}
                        </span>
                    </div>

                    {/* Score */}
                    <div className="px-4 flex flex-col items-center">
                        <div className="text-3xl font-black font-mono tracking-widest text-gray-800">
                            {isFinished || isLive ? (
                                <>
                                    {match.home_score_total ?? '-'} <span className="text-gray-300 text-xl">-</span> {match.away_score_total ?? '-'}
                                </>
                            ) : (
                                <span className="text-xl text-gray-400">vs</span>
                            )}
                        </div>
                        {(match.home_pk != null || match.away_pk != null) && (
                            <span className="text-xs text-gray-500 mt-1">
                                (PK: {match.home_pk}-{match.away_pk})
                            </span>
                        )}
                    </div>

                    {/* Away Team */}
                    <div className="flex-1 flex flex-col items-center gap-1">
                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-700 text-xs">
                            {match.away_team?.name?.slice(0, 1) || '?'}
                        </div>
                        <span className="font-bold text-sm text-center leading-tight">
                            {match.away_team?.name || 'TBD'}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}

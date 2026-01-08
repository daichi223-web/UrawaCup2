import { useState, useEffect } from 'react';
import { AlertCircle } from 'lucide-react';
import { standingApi, type GroupStandings } from '@/features/standings';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export default function PublicStandings() {
    const [groupStandings, setGroupStandings] = useState<GroupStandings[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchStandings = async () => {
            try {
                setLoading(true);
                setError(null);
                // Hardcoded tournament ID
                const data = await standingApi.getStandingsByGroup(1);
                setGroupStandings(data);
            } catch (err) {
                console.error("Failed to load standings", err);
                setError("順位表の取得に失敗しました");
            } finally {
                setLoading(false);
            }
        };
        fetchStandings();
    }, []);

    if (loading) {
        return <div className="flex justify-center py-10"><LoadingSpinner /></div>;
    }

    if (error) {
        return (
            <div className="text-center py-8">
                <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <p className="text-red-500">{error}</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-20">
            <div>
                <h1 className="text-xl font-bold text-gray-900">予選リーグ順位表</h1>
                <p className="text-gray-600 text-sm mt-1">
                    各グループの順位を確認できます
                </p>
            </div>

            {/* グループ別順位表 */}
            <div className="grid grid-cols-1 gap-6">
                {groupStandings.map((groupData) => (
                    <div key={groupData.groupId} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="bg-gray-50 px-4 py-3 border-b border-gray-100">
                            <h3 className="text-lg font-semibold text-gray-800">{groupData.groupId}グループ</h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="text-xs uppercase bg-gray-50 border-b">
                                        <th className="px-3 py-2.5 text-left font-medium text-gray-500 w-10">順位</th>
                                        <th className="px-3 py-2.5 text-left font-medium text-gray-500">チーム</th>
                                        <th className="px-2 py-2.5 text-center font-medium text-gray-500 w-8">試</th>
                                        <th className="px-2 py-2.5 text-center font-medium text-gray-500 w-8">勝</th>
                                        <th className="px-2 py-2.5 text-center font-medium text-gray-500 w-8">分</th>
                                        <th className="px-2 py-2.5 text-center font-medium text-gray-500 w-8">敗</th>
                                        <th className="px-2 py-2.5 text-center font-medium text-gray-500 w-8">得</th>
                                        <th className="px-2 py-2.5 text-center font-medium text-gray-500 w-8">失</th>
                                        <th className="px-2 py-2.5 text-center font-medium text-gray-500 w-8">差</th>
                                        <th className="px-3 py-2.5 text-center font-bold text-gray-700 w-10 bg-gray-100">点</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {groupData.standings.map((standing, index) => (
                                        <tr
                                            key={standing.teamId}
                                            className={`hover:bg-gray-50 transition-colors ${
                                                index < 2 ? 'bg-green-50/50' : ''
                                            }`}
                                        >
                                            <td className="px-3 py-2.5 font-semibold text-gray-900 border-r border-gray-100">
                                                <span className={`${
                                                    standing.rank === 1 ? 'text-yellow-600' :
                                                    standing.rank === 2 ? 'text-gray-500' : ''
                                                }`}>
                                                    {standing.rank}
                                                </span>
                                            </td>
                                            <td className="px-3 py-2.5 text-gray-900 font-medium">
                                                {standing.team?.name ?? `Team ${standing.teamId}`}
                                            </td>
                                            <td className="px-2 py-2.5 text-center text-gray-600">{standing.played}</td>
                                            <td className="px-2 py-2.5 text-center text-gray-600">{standing.won}</td>
                                            <td className="px-2 py-2.5 text-center text-gray-600">{standing.drawn}</td>
                                            <td className="px-2 py-2.5 text-center text-gray-600">{standing.lost}</td>
                                            <td className="px-2 py-2.5 text-center text-gray-600">{standing.goalsFor}</td>
                                            <td className="px-2 py-2.5 text-center text-gray-600">{standing.goalsAgainst}</td>
                                            <td className="px-2 py-2.5 text-center font-medium text-gray-900">
                                                {standing.goalDifference > 0 ? `+${standing.goalDifference}` : standing.goalDifference}
                                            </td>
                                            <td className="px-3 py-2.5 text-center font-bold text-blue-600 bg-blue-50">
                                                {standing.points}
                                            </td>
                                        </tr>
                                    ))}
                                    {groupData.standings.length === 0 && (
                                        <tr>
                                            <td colSpan={10} className="text-center py-8 text-gray-400">
                                                データがありません
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ))}
            </div>

            {/* 順位決定ルール説明 */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="bg-gray-50 px-4 py-3 border-b border-gray-100">
                    <h3 className="text-base font-semibold text-gray-800">順位決定ルール</h3>
                </div>
                <div className="p-4">
                    <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600">
                        <li>勝点（勝利=3点、引分=1点、敗北=0点）</li>
                        <li>得失点差（ゴールディファレンス）</li>
                        <li>総得点</li>
                        <li>当該チーム間の対戦成績</li>
                        <li>抽選</li>
                    </ol>
                    <p className="mt-3 text-xs text-gray-500">
                        ※ 各グループ上位2チームが決勝トーナメントに進出します
                    </p>
                </div>
            </div>
        </div>
    );
}

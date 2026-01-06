// src/features/players/api.ts
// 選手API呼び出し - Supabase版
import { playersApi } from '@/lib/api';
import { supabase } from '@/lib/supabase';
import type {
  Player,
  CreatePlayerInput,
  UpdatePlayerInput,
  PlayerSuggestion,
  ImportPreviewResult,
  ImportResult,
} from './types';

interface PlayerListResponse {
  players: Player[];
  total: number;
}

export const playerApi = {
  // チームの選手一覧
  getByTeam: async (teamId: number): Promise<Player[]> => {
    const data = await playersApi.getByTeam(teamId);
    return data as Player[];
  },

  // 単一選手取得
  getById: async (id: number): Promise<Player> => {
    const { data, error } = await supabase
      .from('players')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data as Player;
  },

  // 選手作成
  create: async (data: CreatePlayerInput): Promise<Player> => {
    const player = await playersApi.create({
      team_id: data.teamId,
      number: data.number,
      name: data.name,
      position: data.position,
    });
    return player as Player;
  },

  // 選手更新
  update: async (id: number, data: UpdatePlayerInput): Promise<Player> => {
    const updateData: Record<string, unknown> = {};
    if (data.number !== undefined) updateData.number = data.number;
    if (data.name !== undefined) updateData.name = data.name;
    if (data.position !== undefined) updateData.position = data.position;

    const { data: player, error } = await supabase
      .from('players')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return player as Player;
  },

  // 選手削除
  delete: async (id: number): Promise<void> => {
    const { error } = await supabase
      .from('players')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },

  // 選手サジェスト（得点者入力用）
  suggest: async (teamId: number, query: string): Promise<PlayerSuggestion[]> => {
    const { data, error } = await supabase
      .from('players')
      .select('id, number, name')
      .eq('team_id', teamId)
      .ilike('name', `%${query}%`)
      .limit(10);

    if (error) throw error;
    return (data || []).map(p => ({
      id: p.id,
      number: p.number,
      name: p.name,
    }));
  },

  // CSVインポート
  importCsv: async (
    teamId: number,
    file: File,
    replaceExisting: boolean = false
  ): Promise<PlayerListResponse> => {
    if (replaceExisting) {
      // 既存選手を削除
      await supabase.from('players').delete().eq('team_id', teamId);
    }

    const text = await file.text();
    const lines = text.trim().split('\n');
    const header = lines[0].toLowerCase();
    const dataLines = header.includes('name') || header.includes('番号') ? lines.slice(1) : lines;

    const players: Player[] = [];
    for (const line of dataLines) {
      const parts = line.split(',').map(s => s.trim());
      if (parts.length >= 2) {
        const [numberStr, name, position] = parts;
        const number = parseInt(numberStr);

        const { data, error } = await supabase
          .from('players')
          .insert({
            team_id: teamId,
            number: isNaN(number) ? 0 : number,
            name,
            position: position || null,
          })
          .select()
          .single();

        if (!error && data) {
          players.push(data as Player);
        }
      }
    }

    return { players, total: players.length };
  },

  // CSVエクスポート
  exportCsv: async (teamId: number): Promise<Blob> => {
    const { data: players, error } = await supabase
      .from('players')
      .select('*')
      .eq('team_id', teamId)
      .order('number');

    if (error) throw error;

    const csvRows = ['番号,氏名,ポジション'];
    for (const player of players || []) {
      csvRows.push(`${player.number},${player.name},${player.position || ''}`);
    }

    return new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8' });
  },

  // Excelインポートプレビュー（Supabaseでは簡易実装）
  previewExcelImport: async (teamId: number, file: File): Promise<ImportPreviewResult> => {
    console.warn('Excel preview requires xlsx library');
    return {
      players: [],
      staff: [],
      warnings: ['Excel import preview not implemented'],
      errors: [],
    };
  },

  // Excelインポート実行（Supabaseでは簡易実装）
  importExcel: async (
    teamId: number,
    file: File,
    options: {
      replaceExisting?: boolean;
      importStaff?: boolean;
      importUniforms?: boolean;
      skipWarnings?: boolean;
    } = {}
  ): Promise<ImportResult> => {
    console.warn('Excel import requires xlsx library');
    return {
      playersImported: 0,
      staffImported: 0,
      warnings: ['Excel import not implemented'],
    };
  },
};

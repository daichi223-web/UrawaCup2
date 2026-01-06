// src/features/reports/api.ts
// 報告書API呼び出し - Supabase版
// 注意: PDFやExcel生成はSupabase Edge Functionが必要
import { supabase } from '@/lib/supabase';
import type { ReportGenerateInput, ReportJob, ReportRecipient, SenderSettings, SenderSettingsUpdate } from './types';

export const reportApi = {
  // 報告書生成開始（Supabase Edge Functionが必要）
  generate: async (data: ReportGenerateInput): Promise<{ jobId: string }> => {
    console.warn('Report generation requires Supabase Edge Function');
    return { jobId: 'not-implemented' };
  },

  // 生成ジョブ状態確認
  getJobStatus: async (jobId: string): Promise<ReportJob> => {
    return {
      id: jobId,
      status: 'completed',
      progress: 100,
      createdAt: new Date().toISOString(),
    };
  },

  // 報告書ダウンロード（Supabase Edge Functionが必要）
  download: async (jobId: string): Promise<Blob> => {
    console.warn('Report download requires Supabase Edge Function');
    return new Blob(['Report generation not implemented'], { type: 'text/plain' });
  },

  // 後方互換: PDFダウンロード（Supabase Edge Functionが必要）
  downloadPdf: async (params: { tournamentId: number; date: string; venueId?: number; format?: string }): Promise<Blob> => {
    console.warn('PDF download requires Supabase Edge Function');
    return new Blob(['PDF generation not implemented'], { type: 'text/plain' });
  },

  // 後方互換: Excelダウンロード（Supabase Edge Functionが必要）
  downloadExcel: async (params: { tournamentId: number; date: string; venueId?: number; format?: string }): Promise<Blob> => {
    console.warn('Excel download requires Supabase Edge Function');
    return new Blob(['Excel generation not implemented'], { type: 'text/plain' });
  },

  // 送信先一覧
  getRecipients: async (tournamentId: number): Promise<ReportRecipient[]> => {
    const { data, error } = await supabase
      .from('report_recipients')
      .select('*')
      .eq('tournament_id', tournamentId)
      .order('name');
    if (error) throw error;
    return (data || []) as ReportRecipient[];
  },

  // 送信先追加
  addRecipient: async (data: Omit<ReportRecipient, 'id'>): Promise<ReportRecipient> => {
    const { data: recipient, error } = await supabase
      .from('report_recipients')
      .insert({
        tournament_id: data.tournamentId,
        name: data.name,
        email: data.email,
        role: data.role,
        is_active: data.isActive ?? true,
      })
      .select()
      .single();
    if (error) throw error;
    return recipient as ReportRecipient;
  },

  // 送信先更新
  updateRecipient: async (id: number, data: Partial<ReportRecipient>): Promise<ReportRecipient> => {
    const updateData: Record<string, unknown> = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.email !== undefined) updateData.email = data.email;
    if (data.role !== undefined) updateData.role = data.role;
    if (data.isActive !== undefined) updateData.is_active = data.isActive;

    const { data: recipient, error } = await supabase
      .from('report_recipients')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return recipient as ReportRecipient;
  },

  // 送信先削除
  deleteRecipient: async (id: number): Promise<void> => {
    const { error } = await supabase
      .from('report_recipients')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },

  // 最終日組み合わせ表PDFダウンロード（Supabase Edge Functionが必要）
  downloadFinalDaySchedule: async (params: { tournamentId: number; date: string }): Promise<Blob> => {
    console.warn('PDF download requires Supabase Edge Function');
    return new Blob(['PDF generation not implemented'], { type: 'text/plain' });
  },

  // 最終結果報告書PDFダウンロード（Supabase Edge Functionが必要）
  downloadFinalResult: async (tournamentId: number): Promise<Blob> => {
    console.warn('PDF download requires Supabase Edge Function');
    return new Blob(['PDF generation not implemented'], { type: 'text/plain' });
  },

  // グループ順位表PDFダウンロード（Supabase Edge Functionが必要）
  downloadGroupStandings: async (params: { tournamentId: number; groupId?: string }): Promise<Blob> => {
    console.warn('PDF download requires Supabase Edge Function');
    return new Blob(['PDF generation not implemented'], { type: 'text/plain' });
  },

  // グループ順位表Excelダウンロード（Supabase Edge Functionが必要）
  downloadGroupStandingsExcel: async (params: { tournamentId: number; groupId?: string }): Promise<Blob> => {
    console.warn('Excel download requires Supabase Edge Function');
    return new Blob(['Excel generation not implemented'], { type: 'text/plain' });
  },

  // 最終日組み合わせ表Excelダウンロード（Supabase Edge Functionが必要）
  downloadFinalDayScheduleExcel: async (params: { tournamentId: number; date: string }): Promise<Blob> => {
    console.warn('Excel download requires Supabase Edge Function');
    return new Blob(['Excel generation not implemented'], { type: 'text/plain' });
  },

  // 最終結果報告書Excelダウンロード（Supabase Edge Functionが必要）
  downloadFinalResultExcel: async (tournamentId: number): Promise<Blob> => {
    console.warn('Excel download requires Supabase Edge Function');
    return new Blob(['Excel generation not implemented'], { type: 'text/plain' });
  },

  // 発信元設定取得
  getSenderSettings: async (tournamentId: number): Promise<SenderSettings> => {
    const { data, error } = await supabase
      .from('sender_settings')
      .select('*')
      .eq('tournament_id', tournamentId)
      .single();

    if (error) {
      // デフォルト値を返す
      return {
        tournamentId,
        senderName: '',
        senderTitle: '',
        senderOrganization: '',
      };
    }
    return data as SenderSettings;
  },

  // 発信元設定更新
  updateSenderSettings: async (tournamentId: number, data: SenderSettingsUpdate): Promise<SenderSettings> => {
    const { data: settings, error } = await supabase
      .from('sender_settings')
      .upsert({
        tournament_id: tournamentId,
        sender_name: data.senderName,
        sender_title: data.senderTitle,
        sender_organization: data.senderOrganization,
      })
      .select()
      .single();

    if (error) throw error;
    return settings as SenderSettings;
  },
};

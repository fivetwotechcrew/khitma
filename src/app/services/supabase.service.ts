import { Injectable } from '@angular/core';
import { AuthChangeEvent, createClient, Session, SupabaseClient } from '@supabase/supabase-js'
import { environment } from '../../environments/environment'

@Injectable({
  providedIn: 'root',
})
export class SupabaseService {
  private supabase: SupabaseClient

  constructor() {
    this.supabase = createClient(environment.supabaseUrl, environment.supabasePublishableKey)
  }

  async createNewKhitma(roomId: number) {
    const currentDateTimeInDbFormat = new Date().toISOString().slice(0, 19).replace('T', ' ');

    return this.supabase
      .from('khitma')
      .insert({
        'RoomId': roomId,
        'DateTimeStarted': currentDateTimeInDbFormat,
        'DateTimeLastUpdated': currentDateTimeInDbFormat
      })
      .select();
  }

  async createNewPageAssignment(khitmaId: number, pageNum: number) {
    const currentDateTimeInDbFormat = new Date().toISOString().slice(0, 19).replace('T', ' ');

    return this.supabase
      .from('page_assignment')
      .insert({
        'KhitmaId': khitmaId,
        'PageNum': pageNum,
        'DateTimeStarted': currentDateTimeInDbFormat
      })
      .select();
  }

  async getRoomByCode(code: string) {
    return this.supabase
      .from('room')
      .select('*')
      .eq('Code', code);
  }

  async getActiveKhitmaByRoomId(roomId: number) {
    return this.supabase
      .from('khitma')
      .select('*')
      // .eq('IsCompleted', false)
      .eq('RoomId', roomId)
      .order('Id', { ascending: false })
      .limit(1);
  }

  async getKhitmasByRoomId(roomId: number) {
    return this.supabase
      .from('khitma')
      .select('*')
      .eq('RoomId', roomId);
  }

  async getPagesReadByKhitma(khitmaId: number) {
    return this.supabase
      .from('page_assignment')
      .select('*')
      .eq('KhitmaId', khitmaId)
      .eq('IsCompleted', true);
  }

  async getLatestPageAssignment(khitmaId: number) {
    return this.supabase
      .from('page_assignment')
      .select('*')
      .eq('KhitmaId', khitmaId)
      .order('PageNum', { ascending: false })
      .limit(1);
  }

  async getNotCompletedPageAssignment(khitmaId: number) {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    return this.supabase
      .from('page_assignment')
      .select('*')
      .eq('KhitmaId', khitmaId)
      .eq('IsCompleted', false)
      .lt('DateTimeStarted', oneHourAgo)
      .order('PageNum', { ascending: true })
      .limit(1);
  }

  async getLatestGift() {
    return this.supabase
      .from('gift')
      .select('*')
      .order('Id', { ascending: false })
      .limit(1);
  }

  async getGift(id: number) {
    return this.supabase
      .from('gift')
      .select('*')
      .eq('Id', id);
  }

  async updateKhitma(khitmaId: number, pagesCompleted: number, isCompleted: boolean) {
    const currentDateTimeInDbFormat = new Date().toISOString().slice(0, 19).replace('T', ' ');

    return isCompleted ?
      this.supabase
        .from('khitma')
        .update({
          'PagesCompleted': pagesCompleted,
          'IsCompleted': isCompleted,
          'DateTimeLastUpdated': currentDateTimeInDbFormat,
          'DateTimeCompleted': currentDateTimeInDbFormat
        })
        .eq('Id', khitmaId) :
      this.supabase
        .from('khitma')
        .update({
          'PagesCompleted': pagesCompleted,
          'DateTimeLastUpdated': currentDateTimeInDbFormat
        })
        .eq('Id', khitmaId);
  }

  async updatePageAssignment(khitmaId: number, pageNum: number) {
    const currentDateTimeInDbFormat = new Date().toISOString().slice(0, 19).replace('T', ' ');

    return this.supabase
      .from('page_assignment')
      .update({
        'IsCompleted': true,
        'DateTimeCompleted': currentDateTimeInDbFormat
      })
      .eq('KhitmaId', khitmaId)
      .eq('PageNum', pageNum);
  }

  async getFeedbacks() {
    return this.supabase
      .from('feedbacks')
      .select('*')
      .order('Id', { ascending: false });
  }
}

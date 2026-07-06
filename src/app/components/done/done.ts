import { Component, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { SupabaseService } from '../../services/supabase.service'

@Component({
  selector: 'app-done',
  imports: [],
  templateUrl: './done.html',
  styleUrl: './done.css',
})
export class Done implements OnInit {
  private router = inject(Router);
  roomId = 0;
  roomCode = '';
  khitmaId = 0;
  khitmaCount = 0;
  pagesReadThisSession: Array<string> = [];
  numberOfPagesReadThisSession = 0;
  totalPagesRead = 0;
  progress = 0;
  largestGiftId = 50;
  giftUrl: string | null = null;

  totalPagesReadSignal = signal<number>(this.totalPagesRead);
  progressSignal = signal<number>(this.progress);
  khitmaCountSignal = signal<number>(this.khitmaCount);

  constructor(
    private readonly supabaseService: SupabaseService,
  ) { }

  ngOnInit() {
    this.roomId = parseInt(localStorage.getItem('RoomId')!.toString());
    this.roomCode = localStorage.getItem('RoomCode')!.toString();
    this.khitmaId = parseInt(localStorage.getItem('KhitmaID')!.toString());
    this.pagesReadThisSession = localStorage.getItem('PagesReadThisSession')!.toString().split(',');
    this.pagesReadThisSession = [...new Set(this.pagesReadThisSession)];
    this.numberOfPagesReadThisSession = this.pagesReadThisSession.length;
    console.log(this.pagesReadThisSession)
    console.log(this.numberOfPagesReadThisSession)
    this.getSummary();
    this.getKhitmaCount();
    this.getLargestGiftId();
  }

  async getSummary() {
    const { data, error } = await this.supabaseService.getPagesReadByKhitma(this.khitmaId);
    this.totalPagesRead = data && data.length > 0 ? data.length : 0;
    this.totalPagesReadSignal.set(this.totalPagesRead);
    this.progress = this.totalPagesRead / 604 * 100;
    this.progressSignal.set(this.progress);
  }

  async getKhitmaCount() {
    const { data, error } = await this.supabaseService.getKhitmasByRoomId(this.roomId);
    this.khitmaCount = data && data.length > 0 ? data.length : 0;
    this.khitmaCountSignal.set(this.khitmaCount);
  }

  async getLargestGiftId() {
    const { data, error } = await this.supabaseService.getLatestGift();
    this.largestGiftId = data && data.length > 0 ? data[0].Id : 50;
  }

  restart() {
    this.router.navigate(['/room', this.roomCode]);
  }

  async getGift() {
    const randomNumber = Math.floor(Math.random() * this.largestGiftId) + 1;
    const { data, error } = await this.supabaseService.getGift(randomNumber);
    let gift = data && data.length > 0 ? data[0] : 0;
    window.open("https://quran.com/" + gift.SurahAyat + "?readingMode=verse-by-verse&translations=131", '_blank');
  }

  redirect(event: MouseEvent, page: string) {
    event.preventDefault();
    switch (page) {
      case 'feedbacks':
        this.router.navigate(['/feedbacks']);
        break;
      default:
        break;
    }
  }
}

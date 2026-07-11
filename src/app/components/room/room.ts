import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SupabaseService } from '../../services/supabase.service'
import { NgClass } from "@angular/common";

@Component({
  selector: 'app-room',
  imports: [NgClass],
  templateUrl: './room.html',
  styleUrl: './room.css',
})
export class Room implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  khitma: any = null;
  pageToRead = 0;
  room: any = null;
  roomName: string | null = null;
  roomCode: string | null = null;
  uncheckedPng = "checkbox-unchecked.png";
  checkedPng = "checkbox-checked.png";
  checkPng1 = this.uncheckedPng;
  checkPng2 = this.uncheckedPng;
  checkPng3 = this.uncheckedPng;
  checkPng4 = this.uncheckedPng;
  allChecked = false;
  clicked = false;

  roomCodeSignal = signal<string | null>(this.roomCode);
  roomNameSignal = signal<string | null>(this.roomName);
  checkPngSignal1 = signal<string | null>(this.checkPng1);
  checkPngSignal2 = signal<string | null>(this.checkPng2);
  checkPngSignal3 = signal<string | null>(this.checkPng3);
  checkPngSignal4 = signal<string | null>(this.checkPng4);
  allCheckedSignal = signal<boolean>(this.allChecked);
  clickedSignal = signal<boolean>(this.clicked);

  constructor(
    private readonly supabaseService: SupabaseService,
  ) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.roomCode = params.get('code');
      this.roomCodeSignal.set(this.roomCode);
      this.getRoomDetails();
    });
  }

  async getRoomDetails() {
    const { data, error } = await this.supabaseService.getRoomByCode(this.roomCode!);
    this.room = data && data.length > 0 ? data[0] : null;
    this.roomName = this.room.Name;
    this.roomNameSignal.set(this.roomName);
    localStorage.setItem('RoomId', this.room.Id);
    localStorage.setItem('RoomCode', this.room.Code);
  }

  async startSession() {
    this.clicked = true;
    this.clickedSignal.set(true);
    if (this.allChecked) {
      try {
        // get current active khitma
        const { data, error } = await this.supabaseService.getActiveKhitmaByRoomId(this.room.Id);
        this.khitma = data && data.length > 0 ? data[0] : null;

        if (this.khitma) { // active khitma exists, continue existing khitma
          // save khitma ID in cache
          localStorage.setItem('KhitmaID', this.khitma.Id);
          localStorage.setItem('PagesReadThisSession', '0');

          // get page assignment
          await this.assignPage();

          localStorage.setItem('PageToRead', this.pageToRead.toString());
          this.router.navigate(['/read']);
        }
        else { // active khitma does not exist, start new khitma and page assignment
          const { data, error } = await this.supabaseService.createNewKhitma(this.room.Id);
          this.khitma = data && data.length > 0 ? data[0] : null;

          if (this.khitma) {
            this.pageToRead = 1
            localStorage.setItem('PageToRead', this.pageToRead.toString());
            localStorage.setItem('KhitmaID', this.khitma.Id);
            localStorage.setItem('PagesReadThisSession', '0');
            await this.supabaseService.createNewPageAssignment(this.khitma.Id, this.pageToRead);

            this.router.navigate(['/read']);
          }
          else {
            console.error('Failed to start session.');
          }
        }
      }
      catch (e) {
        console.error('Failed to start session.');
      }
    }
  }

  async assignPage() {
    // first, check not completed page assignment
    let notCompletedAssignmentPageNumber = await this.checkForNotCompletedPageAssignment();
    if (notCompletedAssignmentPageNumber == -1) {
      // no not completed page assignment, assign new page
      const { data, error } = await this.supabaseService.getLatestPageAssignment(this.khitma.Id);
      let lastAssignment = data && data.length > 0 ? data[0] : null;
      if (lastAssignment) { // get latest page assignment
        if (lastAssignment.PageNum == 604) { // start new khitma, last khitma is done
          const { data, error } = await this.supabaseService.createNewKhitma(this.room.Id);
          this.khitma = data && data.length > 0 ? data[0] : null;

          if (this.khitma) {
            this.pageToRead = 1
            localStorage.setItem('PageToRead', this.pageToRead.toString());
            localStorage.setItem('KhitmaID', this.khitma.Id);
            localStorage.setItem('PagesReadThisSession', '0');
            await this.supabaseService.createNewPageAssignment(this.khitma.Id, this.pageToRead);

            this.router.navigate(['/read']);
          }
          else {
            console.error('Failed to start session.');
          }
        }
        else { // continue current khitma
          this.pageToRead = lastAssignment.PageNum + 1;
          await this.supabaseService.createNewPageAssignment(this.khitma.Id, this.pageToRead);
        }
      }
      else { // no pages read for this khitma, start with page 1
        this.pageToRead = 1;
        await this.supabaseService.createNewPageAssignment(this.khitma.Id, this.pageToRead);
      }
    }
    else {
      // assign not completed page
      this.pageToRead = notCompletedAssignmentPageNumber;
    }
  }

  async checkForNotCompletedPageAssignment(): Promise<number> {
    const { data, error } = await this.supabaseService.getNotCompletedPageAssignment(this.khitma.Id);
    let notCompletedAssignment = data && data.length > 0 ? data[0] : null;
    if (notCompletedAssignment) return notCompletedAssignment.PageNum;
    else return -1;
  }

  toggleCheck(checkLabel: string) {
    switch (checkLabel) {
      case "1":
        if (this.checkPng1 == this.uncheckedPng) this.checkPng1 = this.checkedPng;
        else if (this.checkPng1 == this.checkedPng) this.checkPng1 = this.uncheckedPng;
        this.checkPngSignal1.set(this.checkPng1);
        break;
      case "2":
        if (this.checkPng2 == this.uncheckedPng) this.checkPng2 = this.checkedPng;
        else if (this.checkPng2 == this.checkedPng) this.checkPng2 = this.uncheckedPng;
        this.checkPngSignal2.set(this.checkPng2);
        break;
      case "3":
        if (this.checkPng3 == this.uncheckedPng) this.checkPng3 = this.checkedPng;
        else if (this.checkPng3 == this.checkedPng) this.checkPng3 = this.uncheckedPng;
        this.checkPngSignal3.set(this.checkPng3);
        break;
      case "4":
        if (this.checkPng4 == this.uncheckedPng) this.checkPng4 = this.checkedPng;
        else if (this.checkPng4 == this.checkedPng) this.checkPng4 = this.uncheckedPng;
        this.checkPngSignal4.set(this.checkPng4);
        break;
      default:
        break;
    }

    if (this.roomCode == 'khitmaforkemi') {
      if (this.checkPng1 == this.checkedPng && this.checkPng3 == this.checkedPng && this.checkPng4 == this.checkedPng) this.allChecked = true;
      else this.allChecked = false;
      this.allCheckedSignal.set(this.allChecked);
    }
    else {
      if (this.checkPng1 == this.checkedPng && this.checkPng2 == this.checkedPng && this.checkPng3 == this.checkedPng) this.allChecked = true;
      else this.allChecked = false;
      this.allCheckedSignal.set(this.allChecked);
    }
  }
}

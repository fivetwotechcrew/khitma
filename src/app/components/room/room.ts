import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SupabaseService } from '../../services/supabase.service'

@Component({
  selector: 'app-room',
  imports: [],
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

  roomNameSignal = signal<string | null>(this.roomName);

  constructor(
    private readonly supabaseService: SupabaseService,
  ) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.roomCode = params.get('code');
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
    try {
      // get current active khitma
      const { data, error } = await this.supabaseService.getActiveKhitmaByRoomId(this.room.Id);
      this.khitma = data && data.length > 0 ? data[0] : null;

      if (this.khitma) { // active khitma exists, continue existing khitma
        // save khitma ID in cache
        localStorage.setItem('KhitmaID', this.khitma.Id);
        localStorage.setItem('PagesReadThisSession', '0');

        // get latest page assignment
        const { data, error } = await this.supabaseService.getLatestPageAssignment(this.khitma.Id);
        let lastAssignment = data && data.length > 0 ? data[0] : null;
        if (lastAssignment) { // get latest page assignment
          if (lastAssignment.PageNum == 604) { // start new khitma, last khitma is done
            const { data, error } = await this.supabaseService.createNewKhitma(this.room.Id);
            this.khitma = data && data.length > 0 ? data[0] : null;
            console.log(this.khitma);

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

        localStorage.setItem('PageToRead', this.pageToRead.toString());
        this.router.navigate(['/read']);
      }
      else { // active khitma does not exist, start new khitma and page assignment
        const { data, error } = await this.supabaseService.createNewKhitma(this.room.Id);
        this.khitma = data && data.length > 0 ? data[0] : null;
        console.log(this.khitma);

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

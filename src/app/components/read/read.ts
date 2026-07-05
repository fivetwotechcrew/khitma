import { Component, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { SupabaseService } from '../../services/supabase.service'

@Component({
  selector: 'app-read',
  imports: [],
  templateUrl: './read.html',
  styleUrl: './read.css',
})
export class Read implements OnInit {
  private router = inject(Router);
  khitmaId = 0;
  pagesReadThisSession = 0;
  pageToRead = 0;
  continueDisabled = false;
  showLoader = true;

  pageToReadSignal = signal<number>(this.pageToRead);
  continueDisabledSignal = signal<boolean>(this.continueDisabled);
  showLoaderSignal = signal<boolean>(this.showLoader);

  constructor(
    private readonly supabaseService: SupabaseService,
  ) { }

  ngOnInit(): void {
    this.pageToRead = parseInt(localStorage.getItem('PageToRead')!.toString());
    this.khitmaId = parseInt(localStorage.getItem('KhitmaID')!.toString());
    this.pagesReadThisSession = parseInt(localStorage.getItem('PagesReadThisSession')!.toString());

    if (this.pageToRead == 604) {
      this.continueDisabled = true;
      this.continueDisabledSignal.set(this.continueDisabled);
    }
    this.pageToReadSignal.set(this.pageToRead);
  }

  async continue() {
    this.showLoader = true;
    this.showLoaderSignal.set(this.showLoader);

    this.pagesReadThisSession++;
    localStorage.setItem('PagesReadThisSession', this.pagesReadThisSession.toString());

    // update page assignment completion status
    await this.supabaseService.updatePageAssignment(this.khitmaId, this.pageToRead);

    // update pages completed in khitma
    const { data, error } = await this.supabaseService.getPagesReadByKhitma(this.khitmaId);
    let totalPagesRead = data && data.length > 0 ? data.length : 0;
    await this.supabaseService.updateKhitma(this.khitmaId, totalPagesRead, false);

    // get page assignment
    await this.assignPage();
  }

  async end() {
    this.showLoader = true;
    this.showLoaderSignal.set(this.showLoader);

    this.pagesReadThisSession++;
    localStorage.setItem('PagesReadThisSession', this.pagesReadThisSession.toString());

    // update page assignment completion status
    await this.supabaseService.updatePageAssignment(this.khitmaId, this.pageToRead);

    // update pages completed in khitma
    // if page is 604, set khitma completion status to completed
    const { data, error } = await this.supabaseService.getPagesReadByKhitma(this.khitmaId);
    let totalPagesRead = data && data.length > 0 ? data.length : 0;
    await this.supabaseService.updateKhitma(this.khitmaId, totalPagesRead, totalPagesRead == 604 ? true : false);

    this.router.navigate(['/done']);
  }

  async assignPage() {
    // first, check not completed page assignment
    let notCompletedAssignmentPageNumber = await this.checkForNotCompletedPageAssignment();
    if (notCompletedAssignmentPageNumber == -1) {
      // no not completed page assignment, assign new page
      const { data, error } = await this.supabaseService.getLatestPageAssignment(this.khitmaId);
      let lastAssignment = data && data.length > 0 ? data[0] : null;
      if (lastAssignment) { // get latest page assignment
        this.pageToRead = lastAssignment.PageNum + 1;
        this.pageToReadSignal.set(this.pageToRead);
        if (this.pageToRead == 604) {
          this.continueDisabled = true;
          this.continueDisabledSignal.set(this.continueDisabled);
        }
        await this.supabaseService.createNewPageAssignment(this.khitmaId, this.pageToRead);
        localStorage.setItem('PageToRead', this.pageToRead.toString());
      }
      else { // no pages read for this khitma, start with page 1
        this.pageToRead = 1;
        await this.supabaseService.createNewPageAssignment(this.khitmaId, this.pageToRead);
        localStorage.setItem('PageToRead', this.pageToRead.toString());
      }
    }
    else {
      // assign not completed page
      this.pageToRead = notCompletedAssignmentPageNumber;
      this.pageToReadSignal.set(this.pageToRead);
      localStorage.setItem('PageToRead', this.pageToRead.toString());
    }
  }

  async checkForNotCompletedPageAssignment(): Promise<number> {
    const { data, error } = await this.supabaseService.getNotCompletedPageAssignment(this.khitmaId);
    let notCompletedAssignment = data && data.length > 0 ? data[0] : null;
    if (notCompletedAssignment) return notCompletedAssignment.PageNum;
    else return -1;
  }

  onImageLoad() {
    this.showLoader = false;
    this.showLoaderSignal.set(this.showLoader);
    console.log('Image is fully loaded!')
  }

  onImageError() {
    this.showLoader = false;
    this.showLoaderSignal.set(this.showLoader);
    console.log('Image failed to load.')
  }

}

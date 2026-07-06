import { Component, OnInit, signal } from "@angular/core";
import { SupabaseService } from '../../services/supabase.service';
import { DatePipe, NgClass } from "@angular/common";

@Component({
  selector: "app-feedbacks",
  imports: [DatePipe, NgClass],
  templateUrl: "./feedbacks.html",
  styleUrl: "./feedbacks.css",
})
export class Feedbacks implements OnInit {
  feedbacks: Array<any> = [];
  feedbacksSignal = signal<Array<any>>(this.feedbacks);

  constructor(
    private readonly supabaseService: SupabaseService,
  ) { }


  ngOnInit(): void {
    this.getFeedbacks();
  }

  async getFeedbacks() {
    const { data, error } = await this.supabaseService.getFeedbacks();
    this.feedbacks = data && data.length > 0 ? data : [];
    this.feedbacksSignal.set(this.feedbacks);
    console.log(this.feedbacks)
  }
}

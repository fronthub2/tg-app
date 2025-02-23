import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FeedbackComponent } from '../feedback/feedback.component';
import { SidebarComponent } from '../sidebar/sidebar.component';

@Component({
  selector: 'app-backlog',
  imports: [SidebarComponent, FeedbackComponent,RouterOutlet],
  templateUrl: './backlog.component.html',
  styleUrl: './backlog.component.scss'
})
export class BacklogComponent {

}

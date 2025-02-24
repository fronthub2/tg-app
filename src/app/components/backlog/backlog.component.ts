import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FooterMenuComponent } from "../footer-menu/footer-menu.component";

@Component({
  selector: 'app-backlog',
  imports: [RouterOutlet, FooterMenuComponent],
  templateUrl: './backlog.component.html',
  styleUrl: './backlog.component.scss'
})
export class BacklogComponent {

}

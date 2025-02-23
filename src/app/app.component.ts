import { Component } from '@angular/core';
import { BacklogComponent } from "./components/backlog/backlog.component";
import { NavMenuComponent } from "./components/nav-menu/nav-menu.component";

@Component({
  selector: 'app-root',
  imports: [NavMenuComponent, BacklogComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'tg-app';
}

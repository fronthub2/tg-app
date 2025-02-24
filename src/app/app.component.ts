import { Component } from '@angular/core';
import { BacklogComponent } from "./components/backlog/backlog.component";
import { NavMenuComponent } from "./components/nav-menu/nav-menu.component";
import { FooterMenuComponent } from "./components/footer-menu/footer-menu.component";
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [NavMenuComponent, RouterOutlet, FooterMenuComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'tg-app';
}

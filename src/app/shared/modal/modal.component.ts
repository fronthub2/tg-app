import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-modal',
  imports: [],
  templateUrl: './modal.component.html',
  styleUrl: './modal.component.scss',
})
export class ModalComponent {
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  goCashIn() {
    this.router.navigate(['/cash-in'], {
      relativeTo: this.route,
    });
  }
}

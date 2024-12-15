import { Component } from '@angular/core';
import { ActivatedRoute, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app-root.component.html',
  styleUrl: './app-root.component.scss',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterLinkActive,
    RouterLink
  ]
})
export class AppRootComponent {

  constructor( public route: ActivatedRoute ) {
  }

}

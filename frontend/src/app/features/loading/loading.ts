import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-loading',
  imports: [],
  templateUrl: './loading.html',
  styleUrl: './loading.scss',
})
export class Loading implements OnInit {
  constructor(private readonly router: Router) {}

  ngOnInit(): void {
    // Temporalmente simulamos la espera.
    // Después conectaremos aquí AdventureService.
  }

  goToAdventure(): void {
    this.router.navigate(['/adventure']);
  }
}
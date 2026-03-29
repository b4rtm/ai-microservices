import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-admin-panel',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './admin-panel.component.html',
  styleUrl: './admin-panel.component.scss'
})
export class AdminPanelComponent implements OnInit {
    users: any[] = [{ id: 1, email: 'user1@example.com', role: 'user', blocked: false }, { id: 2, email: 'user2@example.com', role: 'admin', blocked: false }, { id: 3, email: 'user3@example.com', role: 'user', blocked: true }];
  constructor() {}

  ngOnInit(): void {
    
  }
}

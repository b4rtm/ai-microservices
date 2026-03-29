import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../services/admin.service';

@Component({
  selector: 'app-admin-panel',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './admin-panel-2.component.html',
  styleUrl: './admin-panel-2.component.scss',
})
export class AdminPanel2Component implements OnInit {
  users: any[] = [
    { id: 1, email: 'user1@example.com', role: 'user', blocked: false },
    { id: 2, email: 'user2@example.com', role: 'admin', blocked: false },
    { id: 3, email: 'user3@example.com', role: 'user', blocked: true },
  ];

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {}
}

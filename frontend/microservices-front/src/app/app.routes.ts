import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { AdminPanelComponent } from './pages/admin-panel/admin-panel.component';
import { AdminPanel2Component } from './pages/admin-panel-2/admin-panel-2.component';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'login' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'home', component: HomeComponent },
  { path: 'admin', component: AdminPanelComponent },
  { path: 'admin-2', component: AdminPanel2Component },
  { path: '**', redirectTo: 'login' },
];

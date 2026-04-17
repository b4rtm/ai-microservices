import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { AdminPanel2Component } from './pages/admin-panel-2/admin-panel-2.component';
import { authGuard } from './guards/auth.guard';
import { adminRoleGuard } from './guards/admin-role.guard';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'login' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'home', component: HomeComponent, canActivate: [authGuard] },
  { path: 'admin', component: AdminPanel2Component, canActivate: [authGuard, adminRoleGuard] },
  { path: '**', redirectTo: 'login' },
];

import { Routes } from '@angular/router';
import { HomeComponent } from './home/home';
import { LoginComponent } from './login/login';
import { AdminComponent } from './admin/admin';
import { ProgramadorComponent } from './programador/programador';
import { AsesoriasComponent } from './asesorias/asesorias';
import { DashboardComponent } from './dashboard/dashboard';
import { authGuard, adminGuard, programadorGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'inicio', component: HomeComponent, canActivate: [authGuard] },
  { path: 'portafolios', component: HomeComponent, canActivate: [authGuard] },
  { path: 'admin', component: AdminComponent, canActivate: [adminGuard] },
  { path: 'programador', component: ProgramadorComponent, canActivate: [authGuard] },
  { path: 'mi-portafolio', redirectTo: '/programador', pathMatch: 'full' },
  { path: 'asesorias', component: AsesoriasComponent, canActivate: [authGuard] },
  { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard] },
];

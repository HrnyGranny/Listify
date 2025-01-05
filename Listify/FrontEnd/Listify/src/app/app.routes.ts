import { Routes } from '@angular/router';
import { LandingComponent } from './landing/landing.component';
import { RegisterShareComponent } from './register-share/register-share.component';


export const routes: Routes = [
  { path: '', component: LandingComponent }, // Ruta para la landing page
  { path: 'register', component: RegisterShareComponent }, // Ruta para el registro de usuarios

  // Lazy-loaded modules
  { path: 'user', loadChildren: () => import('./user/user.module').then(m => m.UserModule) },
  { path: 'userpremium', loadChildren: () => import('./userpremium/userpremium.module').then(m => m.UserPremiumModule) },
  { path: 'admin', loadChildren: () => import('./admin/admin.module').then(m => m.AdminModule) },

  // Ruta por defecto o no encontrada
  { path: '**', redirectTo: '' },
];

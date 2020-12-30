import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from '@auth0/auth0-angular';
import { HomePageComponent } from './pages/home-page/home-page.component'


const routes: Routes = [
  { path: 'home', component: HomePageComponent },
  { path: 'chat', loadChildren: () => import('./pages/chat-page/chat-page.module').then(m => m.ChatPageModule), canActivate: [AuthGuard] },
  { path: '**', redirectTo: '/home'},
  //{ path: 'home', component: HeaderCompComponent },
  //{ path: '', redirectTo: '/home', pathMatch: 'full' },
];
@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomePageComponent } from './pages/home-page/home-page.component'
import { AngularFireAuthGuard, redirectUnauthorizedTo } from '@angular/fire/auth-guard';
import { ChatPageComponent } from './pages/chat-page/chat-page.component';


const routes: Routes = [
  { path: 'home', component: HomePageComponent },
  { path: 'chat', component: ChatPageComponent/* loadChildren: () => import('./pages/chat-page/chat-page.module').then(m => m.ChatPageModule)*/,
    canActivate: [AngularFireAuthGuard],
    data: { authGuardPipe: () => redirectUnauthorizedTo(['home']) }},
  { path: '**', redirectTo: '/home'},
  //{ path: 'home', component: HeaderCompComponent },
  //{ path: '', redirectTo: '/home', pathMatch: 'full' },
];
@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

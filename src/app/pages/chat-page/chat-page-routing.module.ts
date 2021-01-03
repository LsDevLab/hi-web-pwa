import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ChatCoreService } from 'src/app/services/chat-core.service';
import { ChatPageComponent } from './chat-page.component'


const routes: Routes = [
  { path: '', component: ChatPageComponent }
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: [ChatCoreService]
})
export class ChatPageRoutingModule { }

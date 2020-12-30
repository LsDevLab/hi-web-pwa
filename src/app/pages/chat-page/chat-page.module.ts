import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChatPageComponent } from './chat-page.component';
import { ChatFormComponent } from '../../components/chat-form/chat-form.component';
import { ContactsListComponent } from '../../components/contacts-list/contacts-list.component';
import { GraphQLModule } from '../../graphql.module';
import { NbThemeModule, NbLayoutModule, NbChatModule, NbCardModule, NbListModule, 
  NbUserModule, NbDatepickerModule, NbInputModule, NbBadgeModule, NbSelectModule, 
  NbButtonModule, NbMenuModule, NbContextMenuModule, } from '@nebular/theme';
import { ChatPageRoutingModule } from './chat-page-routing.module'
import { ChatCoreService } from 'src/app/services/chat-core.service';

@NgModule({
  declarations: [
    ChatPageComponent,
    ChatFormComponent,
    ContactsListComponent
  ],
  imports: [
    ChatPageRoutingModule,
    CommonModule,
    GraphQLModule,
    NbThemeModule,
    NbLayoutModule,
    NbChatModule,
    NbListModule,
    NbCardModule,
    NbUserModule, NbDatepickerModule, NbInputModule, NbBadgeModule, NbSelectModule, 
    NbButtonModule, NbMenuModule, NbContextMenuModule, 
  ],
  exports: [
    ChatPageComponent
  ],
  providers: [
    ChatCoreService
  ]
})
export class ChatPageModule { }

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChatPageComponent } from './chat-page.component';
import { ChatFormComponent } from '../../components/chat-form/chat-form.component';
import { ContactsListComponent } from '../../components/contacts-list/contacts-list.component';
import { DialogAddChatComponent } from '../../components/dialog-add-chat/dialog-add-chat.component';
import { GraphQLModule } from '../../graphql.module';
import { NbThemeModule, NbLayoutModule, NbChatModule, NbCardModule, NbListModule, 
  NbUserModule, NbDatepickerModule, NbInputModule, NbBadgeModule, NbSelectModule, 
  NbButtonModule, NbMenuModule, NbContextMenuModule, NbIconModule, NbFormFieldModule, NbDialogModule} from '@nebular/theme';
import { ChatPageRoutingModule } from './chat-page-routing.module';
import { ChatCoreService } from 'src/app/services/chat-core.service';
import { ChatLoggerComponent } from '../../components/chat-logger/chat-logger.component';
import { ChatUserInfoComponent } from '../../components/chat-user-info/chat-user-info.component';
import { ChatNotificationsService } from 'src/app/services/chat-notifications.service';

@NgModule({
  declarations: [
    ChatPageComponent,
    ChatFormComponent,
    ContactsListComponent,
    DialogAddChatComponent,
    ChatLoggerComponent,
    ChatUserInfoComponent,
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
    NbButtonModule, NbMenuModule, NbContextMenuModule, NbIconModule, NbFormFieldModule,
    NbDialogModule.forChild(),
  ],
  exports: [
    ChatPageComponent
  ],
  providers: [
    ChatCoreService,
  ]
})
export class ChatPageModule { }

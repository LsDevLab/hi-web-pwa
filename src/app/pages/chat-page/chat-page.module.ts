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

@NgModule({
  declarations: [
    ChatPageComponent,
    ChatFormComponent,
    ContactsListComponent,
    DialogAddChatComponent,
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
    ChatCoreService
  ]
})
export class ChatPageModule { }

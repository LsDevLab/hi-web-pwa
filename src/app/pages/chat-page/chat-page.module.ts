import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChatPageComponent } from './chat-page.component';
import { ChatFormComponent } from '../../components/chat-form/chat-form.component';
import { ContactsListComponent } from '../../components/contacts-list/contacts-list.component';
import { DialogAddChatComponent } from '../../components/dialog-add-chat/dialog-add-chat.component';
import { GraphQLModule } from '../../graphql.module';
import {
  NbThemeModule, NbLayoutModule, NbChatModule, NbCardModule, NbListModule,
  NbUserModule, NbDatepickerModule, NbInputModule, NbBadgeModule, NbSelectModule,
  NbButtonModule, NbMenuModule, NbContextMenuModule, NbIconModule, NbFormFieldModule, NbDialogModule, NbTabsetModule, NbProgressBarModule
} from '@nebular/theme';
import { ChatPageRoutingModule } from './chat-page-routing.module';
import { ChatCoreService } from 'src/app/services/chat-core.service';
import { ChatLoggerComponent } from '../../components/chat-logger/chat-logger.component';
import { ChatUserInfoComponent } from '../../components/chat-user-info/chat-user-info.component';
import { ChatNotificationsService } from 'src/app/services/chat-notifications.service';
import {DialogLoadingComponent} from '../../components/dialog-loading/dialog-loading.component';
import {ChatHeaderComponent} from '../../components/chat-header/chat-header.component';
import {DialogEditProfileComponent} from '../../components/dialog-edit-profile/dialog-edit-profile.component';
import { DialogTargetInfoComponent } from '../../components/dialog-target-info/dialog-target-info.component';
import { DialogAboutComponent } from '../../components/dialog-about/dialog-about.component';
import { DialogTokenExpiredComponent } from '../../components/dialog-token-expired/dialog-token-expired.component';
import {CircleProgressComponent} from '../../components/circle-progress-bar/circle-progress-bar.component';
import { DialogSettingsComponent } from '../../components/dialog-settings/dialog-settings.component';
import {ChatUiService} from '../../services/chat-ui.service';

@NgModule({
  declarations: [
    ChatPageComponent,
    ChatFormComponent,
    ContactsListComponent,
    DialogAddChatComponent,
    DialogLoadingComponent,
    //ChatLoggerComponent,
    ChatUserInfoComponent,
    ChatHeaderComponent,
    //ChatLoggerLargeComponent,
    ChatLoggerComponent,
    DialogEditProfileComponent,
    DialogTargetInfoComponent,
    DialogAboutComponent,
    DialogTokenExpiredComponent,
    DialogSettingsComponent,
  ],
  imports: [
    ChatPageRoutingModule,
    CommonModule,
    NbThemeModule,
    NbLayoutModule,
    NbChatModule,
    NbListModule,
    NbCardModule,
    NbUserModule, NbDatepickerModule, NbInputModule, NbBadgeModule, NbSelectModule,
    NbButtonModule, NbMenuModule, NbContextMenuModule, NbIconModule, NbFormFieldModule,
    NbDialogModule.forChild(),
    NbTabsetModule,
    NbProgressBarModule,
  ],
  exports: [
    ChatPageComponent
  ],
  providers: [
    ChatCoreService,
    ChatUiService
  ]
})
export class ChatPageModule { }

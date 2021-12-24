import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChatPageComponent } from './chat-page.component';
import { ChatFormComponent } from '../../components/chat-form/chat-form.component';
import { ContactsListComponent } from '../../components/contacts-list/contacts-list.component';
import { DialogAddChatComponent } from '../../components/dialog-add-chat/dialog-add-chat.component';
import {
  NbThemeModule, NbLayoutModule, NbChatModule, NbCardModule, NbListModule,
  NbUserModule, NbDatepickerModule, NbInputModule, NbBadgeModule, NbSelectModule,
  NbButtonModule, NbMenuModule, NbContextMenuModule, NbIconModule, NbFormFieldModule,
  NbDialogModule, NbTabsetModule, NbProgressBarModule } from '@nebular/theme';
import { ChatPageRoutingModule } from './chat-page-routing.module';
import { ChatCoreService } from 'src/app/services/chat-core.service';
import { ChatLoggerComponent } from '../../components/chat-logger/chat-logger.component';
import { ChatUserInfoComponent } from '../../components/chat-user-info/chat-user-info.component';
import { ChatHeaderComponent } from '../../components/chat-header/chat-header.component';
import { DialogEditProfileComponent } from '../../components/dialog-edit-profile/dialog-edit-profile.component';
import { DialogTargetInfoComponent } from '../../components/dialog-target-info/dialog-target-info.component';
import { DialogAboutComponent } from '../../components/dialog-about/dialog-about.component';
import { DialogSettingsComponent } from '../../components/dialog-settings/dialog-settings.component';
import { ChatUiService } from '../../services/chat-ui.service';
import { ChatLoadingComponent } from '../../components/chat-loading/chat-loading.component';
import { NgxHowlerService } from 'ngx-howler';
import { HomePageModule } from '../home-page/home-page.module';

@NgModule({
  declarations: [
    ChatPageComponent,
    ChatFormComponent,
    ContactsListComponent,
    DialogAddChatComponent,
    ChatUserInfoComponent,
    ChatHeaderComponent,
    ChatLoggerComponent,
    DialogEditProfileComponent,
    DialogTargetInfoComponent,
    DialogAboutComponent,
    DialogSettingsComponent,
    ChatLoadingComponent
  ],
    imports: [
        ChatPageRoutingModule,
        CommonModule,
        NbThemeModule,
        NbLayoutModule,
        NbChatModule,
        NbListModule,
        NbCardModule,
        NbUserModule,
        NbDatepickerModule,
        NbInputModule,
        NbBadgeModule,
        NbSelectModule,
        NbButtonModule,
        NbMenuModule,
        NbContextMenuModule,
        NbIconModule,
        NbFormFieldModule,
        NbDialogModule.forChild(),
        NbTabsetModule,
        NbProgressBarModule,
        HomePageModule,
    ],
  exports: [
    ChatPageComponent
  ],
  providers: [
    ChatUiService,
    NgxHowlerService
  ]
})
export class ChatPageModule {
  constructor(
    ngxHowlerService: NgxHowlerService
  ) {
    ngxHowlerService.loadScript('https://cdnjs.cloudflare.com/ajax/libs/howler/2.2.0/howler.min.js');
  }
}

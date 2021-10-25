import {Component, OnDestroy, OnInit} from '@angular/core';
import { NbDialogService, NbMenuService } from '@nebular/theme';
import { Subscription } from 'apollo-client/util/Observable';
import { DialogEditProfileComponent } from '../../components/dialog-edit-profile/dialog-edit-profile.component';
import { DialogAboutComponent } from '../../components/dialog-about/dialog-about.component';
import { DialogSettingsComponent } from '../../components/dialog-settings/dialog-settings.component';
import { ChatUiService } from '../../services/chat-ui.service';


@Component({
  selector: 'app-chat-page',
  templateUrl: './chat-page.component.html',
  styleUrls: ['./chat-page.component.css']
})
export class ChatPageComponent implements OnInit, OnDestroy {

  userContextMenuItems = [
    {
      title: 'Home',
      icon: 'home-outline',
      link: '/home'
    },
    {
      title: 'Chat',
      icon: 'message-square-outline',
      link: '/chat',
    },
    {
      title: 'Edit profile',
      icon: 'person-outline',
    },
    {
      title: 'Settings',
      icon: 'settings-outline'
    },
    {
      title: 'About...',
      icon: 'info-outline'
    },
  ];

  menuSub: Subscription;

  constructor(private dialogService: NbDialogService, private nbMenuService: NbMenuService,
              public chatUiService: ChatUiService) {
  }

  ngOnInit(): void {
    this.menuSub = this.nbMenuService.onItemClick().subscribe(menu => {
      if (menu.tag === 'user-context-menu-small') {
        switch (menu.item.title) {
          case 'Edit profile':
            this.dialogService.open(DialogEditProfileComponent);
            break;
          case 'About...':
            this.dialogService.open(DialogAboutComponent);
            break;
          case 'Settings':
            this.dialogService.open(DialogSettingsComponent);
            break;
        }
      }
    });
    if (!this.chatUiService.isInitialized)
      this.chatUiService.initializeService();
  }

  ngOnDestroy(): void{
    this.menuSub.unsubscribe();
  }


}

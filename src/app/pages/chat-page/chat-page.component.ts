import { Component, ElementRef, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { AuthService } from '@auth0/auth0-angular';
import { ChatCoreService } from 'src/app/services/chat-core.service';
import {BreakpointObserver} from '@angular/cdk/layout';
import {NbDialogService, NbMenuService, NbRevealCardComponent, NbToastrConfig, NbToastrService} from '@nebular/theme';
import {DialogLoadingComponent} from '../../components/dialog-loading/dialog-loading.component';
import {Subscription} from 'apollo-client/util/Observable';
import {DialogEditProfileComponent} from '../../components/dialog-edit-profile/dialog-edit-profile.component';
import {DialogAboutComponent} from '../../components/dialog-about/dialog-about.component';
import { JwtHelperService } from "@auth0/angular-jwt";
import {DialogTokenExpiredComponent} from '../../components/dialog-token-expired/dialog-token-expired.component';
import {DialogSettingsComponent} from '../../components/dialog-settings/dialog-settings.component';
import {AngularFireAuth} from '@angular/fire/auth';
import {Router} from '@angular/router';
import {ChatNotificationsService} from '../../services/chat-notifications.service';
import {ChatUiService} from '../../services/chat-ui.service';


@Component({
  selector: 'app-chat-page',
  templateUrl: './chat-page.component.html',
  styleUrls: ['./chat-page.component.css']
})
export class ChatPageComponent implements OnInit {

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

  constructor(private breakpointObserver: BreakpointObserver, private chatCoreService: ChatCoreService,
              private dialogService: NbDialogService, private nbMenuService: NbMenuService,
              private afAuth: AngularFireAuth, private toastrService: NbToastrService,
              public router: Router, private chatNotificationsService: ChatNotificationsService,
              public chatUiService: ChatUiService) {
  }

  ngOnInit(): void {

    this.menuSub = this.nbMenuService.onItemClick().subscribe(menu => {
      if(menu.tag === 'user-context-menu-small') {
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

    this.chatUiService.initializeService();

  }

  ngOnDestroy(){
    this.menuSub.unsubscribe();
  }


}

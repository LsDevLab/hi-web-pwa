import { Component, OnInit } from '@angular/core';
import { ChatNotificationsService } from 'src/app/services/chat-notifications.service';
import { NbDialogService, NbMenuService } from '@nebular/theme';
import { BreakpointObserver } from '@angular/cdk/layout';
import { Subscription } from 'apollo-client/util/Observable';
import { DialogEditProfileComponent } from '../dialog-edit-profile/dialog-edit-profile.component';
import { DialogAboutComponent } from '../dialog-about/dialog-about.component';
import { DialogSettingsComponent } from '../dialog-settings/dialog-settings.component';
import { AngularFireAuth } from '@angular/fire/auth';
import { ChatUiService } from '../../services/chat-ui.service';

@Component({
  selector: 'app-chat-logger',
  templateUrl: './chat-logger.component.html',
  styleUrls: ['./chat-logger.component.css']
})
export class ChatLoggerComponent implements OnInit {

  screenIsSmall: boolean;
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

  constructor(public afAuth: AngularFireAuth, private chatNotificationsService: ChatNotificationsService,
              private breakpointObserver: BreakpointObserver, private nbMenuService: NbMenuService,
              private dialogService: NbDialogService, public chatUiService: ChatUiService) { }

  ngOnInit(): void {
    this.breakpointObserver.observe('(max-width: 992px)').subscribe(r => {
      this.screenIsSmall = r.matches;
    });
    this.menuSub = this.nbMenuService.onItemClick().subscribe(menu => {
      if(menu.tag === 'user-context-menu') {
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
  }

  logOut(){
    this.chatNotificationsService.unsubscribeToMessagesPushNotifications();
    localStorage.setItem('isAuth', "false");
    localStorage.removeItem('currentToken');
    this.afAuth.signOut().then(_ => window.location.reload());
  }

  ngOnDestroy(){
    this.menuSub.unsubscribe();
  }


}

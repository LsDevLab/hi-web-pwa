import {Component, Inject, OnInit} from '@angular/core';
import { AuthService } from '@auth0/auth0-angular';
import { ChatNotificationsService } from 'src/app/services/chat-notifications.service';
import { filter, map } from 'rxjs/operators';
import {NB_WINDOW, NbDialogService, NbMenuService} from '@nebular/theme';
import {BreakpointObserver} from '@angular/cdk/layout';
import {Subscription} from 'apollo-client/util/Observable';
import {DialogAddChatComponent} from '../dialog-add-chat/dialog-add-chat.component';
import {DialogEditProfileComponent} from '../dialog-edit-profile/dialog-edit-profile.component';
import {ChatCoreService} from '../../services/chat-core.service';


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
      title: 'About...',
      icon: 'info-outline'
    },
  ];
  menuSub: Subscription;
  currentUserData: any = {
    name: 'name',
    surname: 'surname',
    username: 'username'
  };

  constructor(public auth: AuthService, private chatNotificationsService: ChatNotificationsService,
              private breakpointObserver: BreakpointObserver, private nbMenuService: NbMenuService,
              private dialogService: NbDialogService, private chatCoreService: ChatCoreService) { }

  ngOnInit(): void {
    this.breakpointObserver.observe('(max-width: 992px)').subscribe(r => {
      this.screenIsSmall = r.matches;
    });
    this.menuSub = this.nbMenuService.onItemClick().subscribe(menu => {
      if(menu.tag === 'user-context-menu') {
        switch (menu.item.title) {
          case 'Edit profile':
            console.log("EDIT PROFILE");
            this.dialogService.open(DialogEditProfileComponent);
            break;
          case 'About...':
            console.log("ABOUT");
            break;
        }
      }
    });
    this.chatCoreService.currentUserDataObservable.subscribe(userData => this.currentUserData = userData ? userData : this.currentUserData);
  }

  logOut(){

    this.chatNotificationsService.unsubscribeToMessagesPushNotifications();

    //console.log(localStorage.getItem('currentToken'));
    localStorage.setItem('isAuth', "false");
    localStorage.removeItem('currentToken');
    this.auth.logout({ returnTo: document.location.origin });

  }

  ngOnDestroy(){
    this.menuSub.unsubscribe();
  }


}

import {Component, Inject, OnInit} from '@angular/core';
import { AuthService } from '@auth0/auth0-angular';
import { ChatNotificationsService } from 'src/app/services/chat-notifications.service';
import {filter, first, map} from 'rxjs/operators';
import {NB_WINDOW, NbDialogService, NbMenuService} from '@nebular/theme';
import {BreakpointObserver} from '@angular/cdk/layout';
import {Subscription} from 'apollo-client/util/Observable';
import {DialogAddChatComponent} from '../dialog-add-chat/dialog-add-chat.component';
import {DialogEditProfileComponent} from '../dialog-edit-profile/dialog-edit-profile.component';
import {ChatCoreService} from '../../services/chat-core.service';
import {DialogAboutComponent} from '../dialog-about/dialog-about.component';


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
    name: '',
    surname: '',
    username: ''
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
            this.dialogService.open(DialogEditProfileComponent);
            break;
          case 'About...':
            this.dialogService.open(DialogAboutComponent);
            break;
        }
      }
    });
    this.chatCoreService.currentUsernameObservable.subscribe(currentUsername => {
      if (currentUsername) {
        this.chatCoreService.getUsers.pipe(first(val => val)).subscribe(users => {
          const userData = users.find(u => u.username === currentUsername);
          this.currentUserData = userData ? userData : this.currentUserData;
          if (userData && this.currentUserData.name === ''){
            this.dialogService.open(DialogEditProfileComponent);
          }
        });
        this.chatCoreService.userChanged.subscribe(user => {
          if (user.username === currentUsername) {
            this.currentUserData = user;
            if (user && this.currentUserData.name === '') {
              this.dialogService.open(DialogEditProfileComponent);
            }
          }
        });
      }
    });
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

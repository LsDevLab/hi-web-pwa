import {Component, Inject, OnInit} from '@angular/core';
import { AuthService } from '@auth0/auth0-angular';
import { ChatNotificationsService } from 'src/app/services/chat-notifications.service';
import { filter, map } from 'rxjs/operators';
import { NB_WINDOW, NbMenuService } from '@nebular/theme';
import {BreakpointObserver} from '@angular/cdk/layout';


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

  constructor(public auth: AuthService, private chatNotificationsService: ChatNotificationsService,
              private breakpointObserver: BreakpointObserver, private nbMenuService: NbMenuService) { }

  ngOnInit(): void {
    this.breakpointObserver.observe('(max-width: 992px)').subscribe(r => {
      this.screenIsSmall = r.matches;
    });
    this.nbMenuService.onItemClick().subscribe(menu => {
      if(menu.tag === 'user-context-menu') {
        switch (menu.item.title) {
          case 'Edit profile':
            console.log("EDIT PROFILE");
            break;
          case 'About...':
            console.log("ABOUT");
            break;
        }
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


}

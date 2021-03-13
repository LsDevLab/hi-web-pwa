import {Component, Inject, OnInit} from '@angular/core';
import { AuthService } from '@auth0/auth0-angular';
import { ChatNotificationsService } from 'src/app/services/chat-notifications.service';
import {BreakpointObserver} from '@angular/cdk/layout';
import {NB_WINDOW, NbMenuService} from '@nebular/theme';
import {filter, map} from 'rxjs/operators';
import {ChatCoreService} from '../../services/chat-core.service';
import {ProfileDataService} from '../../services/profile-data.service';


@Component({
  selector: 'app-chat-logger-large',
  templateUrl: './chat-logger-large.component.html',
  styleUrls: ['./chat-logger-large.component.css']
})
export class ChatLoggerLargeComponent implements OnInit {

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
              private breakpointObserver: BreakpointObserver, private nbMenuService: NbMenuService,
              private profileDataService: ProfileDataService) {
    this.breakpointObserver.observe('(max-width: 992px)').subscribe(r => {
      this.screenIsSmall = r.matches;
    });


  }

  ngOnInit(): void {
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

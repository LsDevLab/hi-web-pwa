import { Component, OnInit } from '@angular/core';
import { AuthService } from '@auth0/auth0-angular';
import { ChatNotificationsService } from 'src/app/services/chat-notifications.service';


@Component({
  selector: 'app-chat-logger',
  templateUrl: './chat-logger.component.html',
  styleUrls: ['./chat-logger.component.css']
})
export class ChatLoggerComponent implements OnInit {

  constructor(public auth: AuthService, private chatNotificationsService: ChatNotificationsService) { }

  ngOnInit(): void {
  }

  logOut(){

    this.chatNotificationsService.unsubscribeToMessagesPushNotifications();

    localStorage.setItem('isAuth', "false");
    localStorage.removeItem('currentToken'); 
    //console.log(localStorage.getItem('currentToken'));
    this.auth.logout({ returnTo: document.location.origin });
  }


}

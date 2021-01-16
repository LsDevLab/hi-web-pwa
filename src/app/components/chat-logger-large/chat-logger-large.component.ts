import { Component, OnInit } from '@angular/core';
import { AuthService } from '@auth0/auth0-angular';
import { ChatNotificationsService } from 'src/app/services/chat-notifications.service';


@Component({
  selector: 'app-chat-logger-large',
  templateUrl: './chat-logger-large.component.html',
  styleUrls: ['./chat-logger-large.component.css']
})
export class ChatLoggerLargeComponent implements OnInit {

  constructor(public auth: AuthService, private chatNotificationsService: ChatNotificationsService) { }

  ngOnInit(): void {
  }

  logOut(){

    this.chatNotificationsService.unsubscribeToMessagesPushNotifications();
     
    //console.log(localStorage.getItem('currentToken'));
    localStorage.setItem('isAuth', "false");
    localStorage.removeItem('currentToken');
    this.auth.logout({ returnTo: document.location.origin });
   
  }

}

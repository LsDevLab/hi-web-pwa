import { BreakpointObserver } from '@angular/cdk/layout';
import { DOCUMENT } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { AuthService } from '@auth0/auth0-angular';
import {ChatNotificationsService} from '../../services/chat-notifications.service';
import {Router} from '@angular/router';

@Component({
  selector: 'unlogged-app-header',
  templateUrl: './home-header.component.html',
  styleUrls: ['./home-header.component.css']
})
export class HomeHeaderComponent implements OnInit {

  constructor(public auth: AuthService, private chatNotificationsService: ChatNotificationsService,
              public router: Router) { }

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

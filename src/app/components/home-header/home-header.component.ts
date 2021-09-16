import { BreakpointObserver } from '@angular/cdk/layout';
import { DOCUMENT } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { AuthService } from '@auth0/auth0-angular';
import {ChatNotificationsService} from '../../services/chat-notifications.service';
import {Router} from '@angular/router';
import firebase from 'firebase';
import {AngularFireAuth} from '@angular/fire/auth';

@Component({
  selector: 'unlogged-app-header',
  templateUrl: './home-header.component.html',
  styleUrls: ['./home-header.component.css']
})
export class HomeHeaderComponent implements OnInit {

  constructor(private chatNotificationsService: ChatNotificationsService,
              public router: Router, public afAuth: AngularFireAuth) { }

  ngOnInit(): void {
    this.afAuth.user.subscribe(user => console.log('Logged In User: ', user))
  }

  logOut(){

    this.chatNotificationsService.unsubscribeToMessagesPushNotifications();

    //console.log(localStorage.getItem('currentToken'));
    localStorage.setItem('isAuth', "false");
    localStorage.removeItem('currentToken');
    //this.auth.logout({ returnTo: document.location.origin });
    this.afAuth.signOut()
  }

  signIn() {
    const provider = new firebase.auth.GoogleAuthProvider()
    //TODO: To handle the case in which the login does not success
    this.afAuth.signInWithPopup(provider).then(res => this.router.navigateByUrl('/chat'));
  }

}

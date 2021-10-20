import { Component, OnInit } from '@angular/core';
import { ChatNotificationsService } from '../../services/chat-notifications.service';
import { Router} from '@angular/router';
import firebase from 'firebase';
import { AngularFireAuth } from '@angular/fire/auth';

@Component({
  selector: 'unlogged-app-header',
  templateUrl: './home-header.component.html',
  styleUrls: ['./home-header.component.css']
})
export class HomeHeaderComponent implements OnInit {

  isAuthenticated = (localStorage.getItem('isAuth') === 'true');

  constructor(private chatNotificationsService: ChatNotificationsService, public router: Router,
              public afAuth: AngularFireAuth) {
  }

  ngOnInit(): void {
    this.afAuth.user.subscribe(usr => this.isAuthenticated = usr ? true : false);
  }

  logOut(){
    this.chatNotificationsService.unsubscribeToMessagesPushNotifications();
    localStorage.setItem('isAuth', "false");
    localStorage.removeItem('currentToken');
    this.afAuth.signOut().then(_ => window.location.reload())
  }

  signIn() {
    const provider = new firebase.auth.GoogleAuthProvider()
    this.afAuth.signInWithPopup(provider).then(_ => this.router.navigateByUrl('/chat'))
      .catch(error => console.log('HHC Authentication failed with error: ', error));
  }

}

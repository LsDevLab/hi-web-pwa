import { Component, OnInit } from '@angular/core';
import { BreakpointObserver } from '@angular/cdk/layout';
import { Router } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/auth';
import firebase from 'firebase';
import {environment} from '../../../environments/environment';

@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.css']
})
export class HomePageComponent implements OnInit {

  screenIsSmall = false;
  nameOfUser: string = '';
  appName = environment.appName;

  constructor(private breakpointObserver: BreakpointObserver, public router: Router,
              public afAuth: AngularFireAuth) {
  }

  ngOnInit(): void {
    this.breakpointObserver.observe('(max-width: 992px)').subscribe(r => {
      this.screenIsSmall = r.matches;
    });
    this.afAuth.user.subscribe(usr => {
      if(usr)
        this.nameOfUser = usr.displayName;
    });
  }

  signIn() {
    const provider = new firebase.auth.GoogleAuthProvider()
    this.afAuth.signInWithPopup(provider).then(_ => this.router.navigateByUrl('/chat'));
  }

}

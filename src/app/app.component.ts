import {Component, OnInit} from '@angular/core';
import { Router } from '@angular/router';
import { BreakpointObserver } from '@angular/cdk/layout';
import { AngularFireAuth } from '@angular/fire/auth';
import { environment } from '../environments/environment';
import { Title } from '@angular/platform-browser';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit{

  screenIsSmall: boolean;
  appName = environment.appName;

  constructor(public afAuth: AngularFireAuth, public router: Router,
              private breakpointObserver: BreakpointObserver, private titleService: Title) { }

  ngOnInit(): void{
    this.titleService.setTitle(this.appName);
    this.breakpointObserver.observe('(max-width: 992px)').subscribe(r => {
      this.screenIsSmall = r.matches;
    });
    this.afAuth.user.subscribe(isAuth => {
      if (isAuth)
        this.afAuth.idToken.subscribe(t => {
          if (t){
            localStorage.setItem('isAuth', 'true');
            localStorage.setItem('currentToken', t);
            console.log('AC: Session authenticated with token', [localStorage.getItem('currentToken')]);
            // this.router.navigateByUrl('/chat');
            const appSettingsString = localStorage.getItem('appSettings');
            if (!appSettingsString)
              localStorage.setItem('appSettings', JSON.stringify({maxNumOfChatMessages: 60, dateFormat: 12}));
          }
        });
    });



  }



}

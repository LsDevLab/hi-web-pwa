import { Component } from '@angular/core';
import { AuthService } from '@auth0/auth0-angular';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { ChatCoreService } from './services/chat-core.service';
import { BreakpointObserver } from '@angular/cdk/layout';
import {NbDialogService} from '@nebular/theme';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'project-hi';
  screenIsSmall: boolean;

  constructor(public auth: AuthService, private router: Router, private breakpointObserver: BreakpointObserver,
              ) { }

  ngOnInit(){

    this.breakpointObserver.observe('(max-width: 992px)').subscribe(r => {
      this.screenIsSmall = r.matches;
    });

    this.auth.isAuthenticated$.subscribe(isAuth => {
      if (isAuth)
        this.auth.idTokenClaims$.subscribe(t => {
          if (t){
            localStorage.setItem('isAuth', "true");
            localStorage.setItem('currentToken', t.__raw);
            console.log("AC: Session authenticated with token", [localStorage.getItem('currentToken')]);
            this.router.navigateByUrl('/chat');
          }
        });
    });



  }



}

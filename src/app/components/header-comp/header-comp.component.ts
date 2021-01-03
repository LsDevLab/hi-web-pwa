import { Component, OnInit, Inject } from '@angular/core';
import { AuthService } from '@auth0/auth0-angular';
import { DOCUMENT } from '@angular/common';
import {BreakpointObserver} from '@angular/cdk/layout';


@Component({
  selector: 'app-header-comp',
  templateUrl: './header-comp.component.html',
  styleUrls: ['./header-comp.component.css']
})
export class HeaderCompComponent implements OnInit {

  thisUser: string;
  screenIsSmall = false;

  constructor(@Inject(DOCUMENT) public document: Document, public auth: AuthService, private breakpointObserver: BreakpointObserver) { }

  ngOnInit(): void {
    this.breakpointObserver.observe('(max-width: 992px)').subscribe(r => {
      this.screenIsSmall = r.matches;
    });
  }

  logOut(){
    localStorage.setItem('isAuth', "false");
    localStorage.removeItem('currentToken'); 
    //console.log(localStorage.getItem('currentToken'));
    this.auth.logout({ returnTo: document.location.origin });
  }

  /*
  changeUser(user) {
    if(user != this.thisUser){
      this.chatCoreService.setUsers(user, "jaki@gmail.com");
    }
  }*/
}

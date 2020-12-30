import { Component, OnInit, Inject } from '@angular/core';
import { AuthService } from '@auth0/auth0-angular';
import { DOCUMENT } from '@angular/common';

@Component({
  selector: 'app-header-comp',
  templateUrl: './header-comp.component.html',
  styleUrls: ['./header-comp.component.css']
})
export class HeaderCompComponent implements OnInit {

  thisUser: string;

  constructor(@Inject(DOCUMENT) public document: Document, public auth: AuthService) { }

  ngOnInit(): void {
    
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

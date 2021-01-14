import { Component, OnInit } from '@angular/core';
import { AuthService } from '@auth0/auth0-angular';

@Component({
  selector: 'app-chat-logger',
  templateUrl: './chat-logger.component.html',
  styleUrls: ['./chat-logger.component.css']
})
export class ChatLoggerComponent implements OnInit {

  constructor(public auth: AuthService) { }

  ngOnInit(): void {
  }

  logOut(){
    localStorage.setItem('isAuth', "false");
    localStorage.removeItem('currentToken'); 
    //console.log(localStorage.getItem('currentToken'));
    this.auth.logout({ returnTo: document.location.origin });
  }

}

import { Component, OnInit } from '@angular/core';
import { AuthService } from '@auth0/auth0-angular';

@Component({
  selector: 'app-chat-logger-large',
  templateUrl: './chat-logger-large.component.html',
  styleUrls: ['./chat-logger-large.component.css']
})
export class ChatLoggerLargeComponent implements OnInit {

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

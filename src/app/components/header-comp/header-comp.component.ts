import { Component, OnInit, Inject } from '@angular/core';
import { ChatCoreService } from '../../services/chat-core.service';
import { AuthService } from '@auth0/auth0-angular';
import { DOCUMENT } from '@angular/common';

@Component({
  selector: 'app-header-comp',
  templateUrl: './header-comp.component.html',
  styleUrls: ['./header-comp.component.css']
})
export class HeaderCompComponent implements OnInit {

  thisUser: string;

  constructor(@Inject(DOCUMENT) public document: Document,private chatCoreService: ChatCoreService, public auth: AuthService) { }

  ngOnInit(): void {
    this.chatCoreService.currentUsernameObservable.subscribe(c => this.thisUser = c);
  }

  changeUser(user) {
    if(user != this.thisUser){
      this.chatCoreService.setUsers(user, "jaki@gmail.com");
    }
  }
}

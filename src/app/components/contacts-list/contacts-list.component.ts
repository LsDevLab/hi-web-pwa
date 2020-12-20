import { Component, OnInit } from '@angular/core';
import { ChatCoreService } from '../../services/chat-core.service';
import { AuthService } from '@auth0/auth0-angular';

@Component({
  selector: 'app-contacts-list',
  templateUrl: './contacts-list.component.html',
  styleUrls: ['./contacts-list.component.css']
})
export class ContactsListComponent implements OnInit {
  

  //@Output() userSelectedEvent = new EventEmitter<any>();

  users: { name: string, email: string, unreaded: number}[] = [
    { name: 'jaki', email: 'jaki@gmail.com', unreaded: 0 }
  ];
  targetUsers: any = [];
  thisUser: string;
  otherUser: string;

  constructor(private chatCoreService: ChatCoreService, public auth: AuthService) {
    
   }

  ngOnInit(): void {
    this.chatCoreService.currentUsernameObservable.subscribe(c => this.thisUser = c);
    this.chatCoreService.targetUsernameObservable.subscribe(t => this.otherUser = t);
    this.auth.user$.subscribe(u => this.chatCoreService.setUsers("luigisc98.junk@gmail.com", 'jaki@gmail.com'));
    //this.auth.user$.subscribe(u => this.chatCoreService.setUsers(u.email, this.users[0].email));
  }

  selectUser(user) {
    if (user.name != this.otherUser){
      this.otherUser = user.name;
      this.chatCoreService.setUsers(this.thisUser, user.email);
    }
  }

}

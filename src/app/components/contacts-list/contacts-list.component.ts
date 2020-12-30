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


  targetUsers: any = [];
  thisUser: string;
  thisName: string;
  otherUser: string;

  constructor(private chatCoreService: ChatCoreService, public auth: AuthService) {
    
   }

  ngOnInit(): void {
    this.chatCoreService.currentUsernameObservable.subscribe(c => this.thisUser = c);
    this.chatCoreService.targetUsernameObservable.subscribe(t => this.otherUser = t);
    this.chatCoreService.targetUsersObservable.subscribe(tu => this.targetUsers = tu)
    this.auth.user$.subscribe(u => {
      this.thisName = u.name;
      this.chatCoreService.setUsers(u.email, u.name, "none");
      });
    //this.auth.user$.subscribe(u => this.chatCoreService.setUsers(u.email, this.users[0].email));
  }

  selectUser(user) {
    if (user.name != this.otherUser){
      this.otherUser = user.name;
      this.chatCoreService.setUsers(this.thisUser, this.thisName, user.username);
    }
  }

}

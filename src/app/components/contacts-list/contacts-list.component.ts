import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { ChatCoreService } from '../../services/chat-core.service';

@Component({
  selector: 'app-contacts-list',
  templateUrl: './contacts-list.component.html',
  styleUrls: ['./contacts-list.component.css']
})
export class ContactsListComponent implements OnInit {
  

  //@Output() userSelectedEvent = new EventEmitter<any>();

  users: { name: string, email: string, unreaded: number}[] = [
    { name: 'kamala', email: 'jkam@gmail.com', unreaded: 0 },
    { name: 'johndoe98', email: 'carla.esp@yahoo.it', unreaded: 0 },
    { name: 'kaktus98', email: 'janin245@gmail.com', unreaded: 0 }
  ];
  targetUsers: any = [];
  thisUser: string;
  otherUser: string;

  constructor(private chatCoreService: ChatCoreService) {
    
   }

  ngOnInit(): void {
    this.chatCoreService.currentUsernameObservable.subscribe(c => this.thisUser = c);
    this.chatCoreService.targetUsernameObservable.subscribe(t => this.otherUser = t);
    
    this.chatCoreService.setUsers("johndoe98", this.users[0].name);
  
  }

  selectUser(user) {
    if (user != this.otherUser){
      this.otherUser = user;
      //this.userSelectedEvent.emit(user);
      this.chatCoreService.setUsers(this.thisUser, user.name);
      
    }
  }

}

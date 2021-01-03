import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { ChatCoreService } from '../../services/chat-core.service';
import { AuthService } from '@auth0/auth0-angular';
import { BreakpointObserver } from '@angular/cdk/layout';
import { NbDialogService } from '@nebular/theme';
import { DialogAddChatComponent } from '../dialog-add-chat/dialog-add-chat.component';


@Component({
  selector: 'app-contacts-list',
  templateUrl: './contacts-list.component.html',
  styleUrls: ['./contacts-list.component.css']
})
export class ContactsListComponent implements OnInit {
  

  //@Output() userSelectedEvent = new EventEmitter<any>();


  chats: any = [];
  thisUser: string;
  thisName: string;
  otherUser: string;

  screenIsSmall = false;
  size = "medium";

  @Output()
  selectedUser: EventEmitter<string> = new EventEmitter<string>();

  constructor(private chatCoreService: ChatCoreService, public auth: AuthService, 
              private breakpointObserver: BreakpointObserver, private dialogService: NbDialogService) {
   }

  ngOnInit(): void {
    // to deactivate title and name of user list
    this.breakpointObserver.observe('(max-width: 992px)').subscribe(r => {
      this.screenIsSmall = r.matches;
      if (this.screenIsSmall){
        this.size = "small";
      }else{
        this.size = "medium";
      }
    });

    this.chatCoreService.currentUsernameObservable.subscribe(c => this.thisUser = c);
    this.chatCoreService.targetUsernameObservable.subscribe(t => this.otherUser = t);
    this.chatCoreService.chatsObservable.subscribe(c => this.chats = this.formatChats(c))
    this.auth.user$.subscribe(u => {
      this.thisName = u.name;
      this.chatCoreService.init(u.email, u.name);
      });
    //this.auth.user$.subscribe(u => this.chatCoreService.setUsers(u.email, this.users[0].email));
  }

  selectChat(username) {
    this.otherUser = username;
    this.chatCoreService.setChat(username);
    this.selectedUser.emit(username);
  }

  formatChats(unformattedChats){
    let chats = [];
    unformattedChats.forEach(chat => {
      if (chat.user1 === this.thisUser)
        chats.push(chat.user2);
      else
        chats.push(chat.user1);
    });
    return chats;
  }

  openAddChatDialog(){
    this.dialogService.open(DialogAddChatComponent);
  }
}

import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { ChatCoreService } from '../../services/chat-core.service';
import { AuthService } from '@auth0/auth0-angular';
import { BreakpointObserver } from '@angular/cdk/layout';
import { NbDialogService } from '@nebular/theme';
import { DialogAddChatComponent } from '../dialog-add-chat/dialog-add-chat.component';
import { SwPush } from '@angular/service-worker';
import { HttpClient } from '@angular/common/http';
import { ChatNotificationsService } from 'src/app/services/chat-notifications.service';


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

  topMenuActivated = false;
  screenIsSmall = false;
  size = "medium";

  @Output()
  selectedUser: EventEmitter<string> = new EventEmitter<string>();

  constructor(private chatCoreService: ChatCoreService, public auth: AuthService,
              private breakpointObserver: BreakpointObserver, private dialogService: NbDialogService,
              private chatNotificationsService: ChatNotificationsService) {
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
      this.chatNotificationsService.subscribeToMessagesPushNotifications(u.email);
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
    let chatUsername;
    let notify;
    let isAtLeastOneToNotify = false;
    unformattedChats.forEach(chat => {
      if (chat.user1 === this.thisUser) {
        chatUsername = chat.user2;
      }else{
        chatUsername = chat.user1;
      }


      //console.log("N", chat.notify, "T", this.thisUser, "EQ", chat.notify == this.thisUser);

      if (chat.notify == this.thisUser) {
        notify = "⋯";
        isAtLeastOneToNotify = true;
      }
      else
        notify = "";

      chats.push([chatUsername, notify])

    });
    return chats;
  }

  openAddChatDialog(){
    this.dialogService.open(DialogAddChatComponent);
  }

}

import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { ChatCoreService } from '../../services/chat-core.service';
import { AuthService } from '@auth0/auth0-angular';
import { BreakpointObserver } from '@angular/cdk/layout';
import { NbDialogService } from '@nebular/theme';
import { DialogAddChatComponent } from '../dialog-add-chat/dialog-add-chat.component';
import { ChatNotificationsService } from 'src/app/services/chat-notifications.service';
import {first} from 'rxjs/operators';


@Component({
  selector: 'app-contacts-list',
  templateUrl: './contacts-list.component.html',
  styleUrls: ['./contacts-list.component.css']
})
export class ContactsListComponent implements OnInit {


  //@Output() userSelectedEvent = new EventEmitter<any>();


  chats: any = [];
  chatsUsersInfo: any[] = [];
  currentUser: string;
  thisName: string;
  targetUser: string;

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


    /*this.chatCoreService.getUsers.pipe(first()).subscribe(users => {
      this.chatsUsersInfo.push(...users);
      this.chats.forEach(chat => {
        const user = users.find(user => user.username === chat.targetUsername);
        console.log('user', user);
        chat.name = user.name;
        chat.surname = user.surname;
        chat.age = user.age;
        chat.sex = user.sex;
        chat.online = user.online;
        chat.profile_img = user.profile_img;
      });
    });
    this.chatCoreService.userAdded.subscribe(userAdded => {
      this.chatsUsersInfo.push(userAdded);
      const chatChanged = this.chats.find(chat => chat.targetUsername === userAdded.username);
      if (chatChanged) {
        chatChanged.name = userAdded.name;
        chatChanged.surname = userAdded.surname;
        chatChanged.age = userAdded.age;
        chatChanged.sex = userAdded.sex;
        chatChanged.online = userAdded.online;
        chatChanged.profile_img = userAdded.profile_img;
      }
    });
    this.chatCoreService.userChanged.subscribe(userChanged => {
      const userIndex = this.chatsUsersInfo.findIndex(user => user.username === userChanged.username);
      this.chatsUsersInfo[userIndex] = userChanged;
      const chatChanged = this.chats.find(chat => chat.targetUsername === userChanged.username);
      if (chatChanged) {
        chatChanged.name = userChanged.name;
        chatChanged.surname = userChanged.surname;
        chatChanged.age = userChanged.age;
        chatChanged.sex = userChanged.sex;
        chatChanged.online = userChanged.online;
        chatChanged.profile_img = userChanged.profile_img;
      }
    });

    this.chatCoreService.currentUsernameObservable.subscribe(c => this.currentUser = c);
    this.chatCoreService.targetUsernameObservable.subscribe(t => this.targetUser = t);

    this.chatCoreService.getChats.pipe(first()).subscribe(c => {
      const precLen = this.chats.length;
      this.chats = this.formatChats(c);
      if (!this.screenIsSmall && !precLen && this.chats.length >= 1) {
        this.selectChat(this.chats[0].targetUsername);
      }
    });
    this.chatCoreService.chatChanged.subscribe(c => {
      const precLen = this.chats.length;
      const chatIndex = this.chats.findIndex(chat => chat.targetUsername === c.username1 || chat.targetUsername === c.username2);
      this.chats[chatIndex] = this.formatChats([c])[0];
      if (!this.screenIsSmall && !precLen && this.chats.length >= 1) {
        this.selectChat(this.chats[0].targetUsername);
      }
    });
    this.chatCoreService.chatAdded.subscribe(c => {
      console.log('chatAdded', c);
      const precLen = this.chats.length;
      this.chats.push(this.formatChats([c])[0]);
      if (!this.screenIsSmall && !precLen && this.chats.length >= 1) {
        this.selectChat(this.chats[0].targetUsername);
      }
    });
    this.chatCoreService.chatDeleted.subscribe(c => {
      const precLen = this.chats.length;
      this.chats.splice(this.chats.findIndex(chat => (chat.targetUsername === c.username1 || chat.targetUsername === c.username2)), 1);
      if (!this.screenIsSmall && !precLen && this.chats.length >= 1) {
        this.selectChat(this.chats[0].targetUsername);
      }
    });*/

    this.chatCoreService.currentUsernameObservable.subscribe(c => this.currentUser = c);

    this.chatCoreService.targetUsernameObservable.subscribe(t => this.targetUser = t);

    this.chatCoreService.getChats.subscribe(chats => {
      this.chatCoreService.getUsers.subscribe(users => {
        this.chatsUsersInfo = users;
        const precLen = this.chats.length;
        this.chats = this.formatChats(chats);
        if (!this.screenIsSmall && !precLen && this.chats.length >= 1) {
          this.selectChat(this.chats[0].targetUsername);
        }
      });
    });

    this.auth.user$.subscribe(u => {
      this.thisName = u.name;
      this.chatCoreService.init(u.email);
      this.chatNotificationsService.subscribeToMessagesPushNotifications(u.email);
    });
    //this.auth.user$.subscribe(u => this.chatCoreService.setUsers(u.email, this.users[0].email));
  }

  selectChat(username) {
    this.targetUser = username;
    this.chatCoreService.setChat(username);
    this.selectedUser.emit(username);
  }

  formatChats(unformattedChats){
    let chats = [];
    let chatUsername;
    let notify;
    let isAtLeastOneToNotify = false;
    unformattedChats.forEach(chat => {
      if (chat.username1 === this.currentUser) {
        chatUsername = chat.username2;
      }else{
        chatUsername = chat.username1;
      }

      //console.log("N", chat.notify, "T", this.thisUser, "EQ", chat.notify == this.thisUser);

      if (chat.hasToRead === this.currentUser) {
        notify = "⋯";
        isAtLeastOneToNotify = true;
      }
      else
        notify = "";

      const user = this.chatsUsersInfo.find(user => user.username === chatUsername);

      chats.push({
        targetUsername: chatUsername,
        notify: notify,
        bio: user ? user.bio : '',
        name: user ? user.name : '',
        surname: user ? user.surname : '',
        age: user ? user.age : '',
        sex: user ? user.sex : '',
        online: user ? user.online : '',
        profile_img: user ? user.profile_img : null,
        numOfMessagesToRead: isAtLeastOneToNotify ? chat.numOfMessagesToRead : null
    })

    });
    return chats;
  }

  openAddChatDialog(){
    this.dialogService.open(DialogAddChatComponent);
  }

}

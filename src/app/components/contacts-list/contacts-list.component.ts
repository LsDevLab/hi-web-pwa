import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { ChatCoreService } from '../../services/chat-core.service';
import { AuthService } from '@auth0/auth0-angular';
import { BreakpointObserver } from '@angular/cdk/layout';
import { NbDialogService } from '@nebular/theme';
import { DialogAddChatComponent } from '../dialog-add-chat/dialog-add-chat.component';
import { ChatNotificationsService } from 'src/app/services/chat-notifications.service';
import {NgxHowlerService} from 'ngx-howler';
import {AngularFireAuth} from '@angular/fire/auth';
import {Subscription} from 'rxjs';


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
  targetUser: string;
  currentUserUID: string;
  targetUserUID: string;

  usersSub: Subscription;
  topMenuActivated = false;
  screenIsSmall = false;
  size = "medium";

  unformattedChats: any[];

  @Output()
  selectedUser: EventEmitter<string> = new EventEmitter<string>();

  constructor(private chatCoreService: ChatCoreService, public afAuth: AngularFireAuth,
              private breakpointObserver: BreakpointObserver, private dialogService: NbDialogService,
              public howl: NgxHowlerService) {
   }

  ngOnInit(): void {
    this.howl.register('newMessageSound', {
      src: ['assets/sounds/newMessageSound.mp3'],
      html5: true
    }).subscribe(status => {
      //ok
    });
    // to deactivate title and name of user list
    this.breakpointObserver.observe('(max-width: 992px)').subscribe(r => {
      this.screenIsSmall = r.matches;
      if (this.screenIsSmall){
        this.size = "small";
      }else{
        this.size = "medium";
      }
    });


    this.chatCoreService.currentUsernameObservable.subscribe(c => this.currentUser = c);

    this.chatCoreService.targetUsernameObservable.subscribe(t => this.targetUser = t);

    this.chatCoreService.currentUserUIDObservable.subscribe(c => this.currentUserUID = c);

    this.chatCoreService.targetUserUIDObservable.subscribe(t => this.targetUserUID = t);

    this.chatCoreService.chats.subscribe(chats => {
      this.unformattedChats = chats;
      const precLen = this.chats.length;
      this.chats = this.formatChats(chats);
      if (!this.screenIsSmall && !precLen && this.chats.length >= 1) {
        this.selectChat(this.chats[0].targetUsername, this.chats[0].targetUserUID);
      }
    });

    this.usersSub = this.chatCoreService.targetUsers.subscribe(users => {
      this.chatsUsersInfo = users;
      const precLen = this.chats.length;
      this.chats = this.formatChats(this.unformattedChats);
      if (!this.screenIsSmall && !precLen && this.chats.length >= 1) {
        this.selectChat(this.chats[0].targetUsername, this.chats[0].targetUserUID);
      }
    });

    //this.auth.user$.subscribe(u => this.chatCoreService.setUsers(u.email, this.users[0].email));
  }

  selectChat(username, userUID) {
    this.targetUser = username;
    this.chatCoreService.setChat(username, userUID);
    this.selectedUser.emit(username);
  }

  formatChats(unformattedChats){

    let soundPlayed = false;
    let chats = [];
    let notify;
    let isAtLeastOneToNotify = false;
    let chatUserUID;
    unformattedChats.forEach(chat => {

      chatUserUID = chat.users_uids.find(uid => uid !== this.currentUserUID);

      const user = this.chatsUsersInfo.find(user => user.uid === chatUserUID);

      if (!user)
        return;

      if (chat.user_has_to_read === this.currentUserUID) {
        notify = "⋯";
        isAtLeastOneToNotify = true;
      }
      else
        notify = "";

      const prevChat = this.chats.find(c => c.targetUsername === user.username);
      if (!soundPlayed && isAtLeastOneToNotify && prevChat && prevChat.messages_to_read !== chat.messages_to_read) {
        this.howl.get('newMessageSound').play();
        soundPlayed = true;
      }

      chats.push({
        targetUserUID: chatUserUID,
        targetUsername: user.username,
        notify: notify,
        bio: user ? user.bio : '',
        name: user ? user.name : '',
        surname: user ? user.surname : '',
        age: user ? user.age : '',
        sex: user ? user.sex : '',
        online: user ? user.online : '',
        profile_img_url: user ? user.profile_img_url : null,
        messages_to_read: isAtLeastOneToNotify ? chat.messages_to_read : null
    });

    });
    return chats;
  }

  openAddChatDialog(){
    this.dialogService.open(DialogAddChatComponent);
  }

}

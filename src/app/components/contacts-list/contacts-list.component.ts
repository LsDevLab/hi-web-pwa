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
  thisName: string;
  targetUser: string;
  currentUserUID: string;
  targetUserUID: string;

  usersSub: Subscription;
  topMenuActivated = false;
  screenIsSmall = false;
  size = "medium";

  @Output()
  selectedUser: EventEmitter<string> = new EventEmitter<string>();

  constructor(private chatCoreService: ChatCoreService, public afAuth: AngularFireAuth,
              private breakpointObserver: BreakpointObserver, private dialogService: NbDialogService,
              private chatNotificationsService: ChatNotificationsService, public howl: NgxHowlerService) {
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
      if (this.usersSub)
        this.usersSub.unsubscribe();
      this.usersSub = this.chatCoreService.users.subscribe(users => {
        this.chatsUsersInfo = users;
        const precLen = this.chats.length;
        this.chats = this.formatChats(chats);
        if (!this.screenIsSmall && !precLen && this.chats.length >= 1) {
          this.selectChat(this.chats[0].targetUsername, this.chats[0].targetUserUID);
        }
      });
    });

    this.afAuth.user.subscribe(u => {
      this.thisName = u.displayName;
      this.chatCoreService.init(u.email, u.uid);
      this.chatNotificationsService.subscribeToMessagesPushNotifications(u.email);
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
      if (chat.user1_uid === this.currentUserUID) {
        chatUserUID = chat.user2_uid;
      }else{
        chatUserUID = chat.user1_uid;
      }

      const user = this.chatsUsersInfo.find(user => user.uid === chatUserUID);

      //console.log("N", chat.notify, "T", this.thisUser, "EQ", chat.notify == this.thisUser);

      if (chat.hasToRead === this.currentUser) {
        notify = "⋯";
        isAtLeastOneToNotify = true;
      }
      else
        notify = "";

      const prevChat = this.chats.find(c => c.targetUsername === user.username);
      if (!soundPlayed && isAtLeastOneToNotify && prevChat && prevChat.numOfMessagesToRead !== chat.numOfMessagesToRead) {
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
        profile_img: user ? user.profile_img : null,
        numOfMessagesToRead: isAtLeastOneToNotify ? chat.numOfMessagesToRead : null
    });

    });
    return chats;
  }

  openAddChatDialog(){
    this.dialogService.open(DialogAddChatComponent);
  }

}

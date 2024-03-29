import {Injectable} from '@angular/core';
import {ChatCoreService} from './chat-core.service';
import moment from 'moment';
import {Router} from '@angular/router';
import {HttpClient} from '@angular/common/http';
import {Subscription} from 'rxjs';
import {NgxHowlerService} from 'ngx-howler';
import {BreakpointObserver} from '@angular/cdk/layout';
import {JwtHelperService} from '@auth0/angular-jwt';
import {NbToastrConfig} from '../framework/theme/components/toastr/toastr-config';
import {AngularFireAuth} from '@angular/fire/auth';
import {ChatNotificationsService} from './chat-notifications.service';
import {NbToastrService} from '../framework/theme/components/toastr/toastr.service';
import {Chat, File, Message, UIChat, UIMessage, UIUser} from '../interfaces/dataTypes';
import { DialogSignupComponent } from '../components/dialog-signup/dialog-signup.component';
import { NbDialogService } from '../framework/theme/components/dialog/dialog.service';


@Injectable({
  providedIn: 'root'
})
export class ChatUiService {

  public messages: any[] = [];
  public chats: UIChat[];
  public currentUser: UIUser;
  public get targetUser(): any { return this.targetUsers.find(u => u.username === this.targetUsername); }
  public targetUsername: string;
  public targetUsers: any;
  public messageQuoted: any;
  public messagesLoading = true;
  public screenIsSmall = false;
  public size = 'medium';
  public isChatOpened = false;
  public firstDataLoadingStatus = 0;
  public isFirstDataLoaded = false;
  public isInitialized = false;
  public currentChatUID;
  public targetUserWriting;

  private currentUsername: string;
  private currentUserUID: string;
  private targetUserUID: string;
  private subscriptions: Subscription[] = [];
  private toConfirmReadedMessages: any[] = [];
  private unformattedChats: any = [];
  private writingInfoAlreadySent = false;

  constructor(private chatCoreService: ChatCoreService, private router: Router,
              private http: HttpClient, public howl: NgxHowlerService,
              private breakpointObserver: BreakpointObserver, private afAuth: AngularFireAuth,
              private chatNotificationsService: ChatNotificationsService, private toastrService: NbToastrService,
              private dialogService: NbDialogService) {
    this.howl.register('newMessageSound', {
      src: ['assets/sounds/newMessageSound.mp3'],
      html5: true
    }).subscribe();
    this.breakpointObserver.observe('(max-width: 992px)').subscribe(r => {
      this.screenIsSmall = r.matches;
      if (!this.screenIsSmall && this.targetUsername) {
        this.showChat();
      }
    });
  }

  public initializeService(): void {
    // initialize component attributes
    this.currentUsername = null;
    this.targetUsername = null;
    this.currentUserUID = null;
    this.targetUserUID = null;
    this.messages = [];
    this.messageQuoted = null;
    // unsubscribe to CCS observables
    this.subscriptions.forEach(sub => sub.unsubscribe());
    this.subscriptions = [];
    // subscribe to CCS observables
    let s = this.chatCoreService.currentUsernameObservable.subscribe(c => this.currentUsername = c);
    this.subscriptions.push(s);
    s = this.chatCoreService.targetUsernameObservable.subscribe(t => this.targetUsername = t );
    this.subscriptions.push(s);
    s = this.chatCoreService.currentUserUIDObservable.subscribe(c => this.currentUserUID = c);
    this.subscriptions.push(s);
    this.chatCoreService.targetUserUIDObservable.subscribe(t => {
      this.targetUserUID = t;
      this.messages = [];
      this.toConfirmReadedMessages = [];
      this.messageQuoted = null;
      this.messagesLoading = true;
    });
    this.subscriptions.push(s);
    s = this.chatCoreService.messagesAdded.subscribe(msgs => {
      this.messagesLoading = false;
      this.formatUpdateMessages(msgs);
    });
    this.subscriptions.push(s);
    s = this.chatCoreService.messagesChanged.subscribe(msgs => {
      this.messagesLoading = false;
      this.formatUpdateMessages(msgs);
    });
    this.subscriptions.push(s);
    s = this.chatCoreService.messagesDeleted.subscribe(msgs => {
      msgs.forEach(msg => this.messages.splice(this.indexOfMessageWithTimestamp(msg.timestamp), 1));
    });
    this.subscriptions.push(s);
    s = this.chatCoreService.currentUser.subscribe(currentUser => {
      const isFirstDataLoaded = !this.currentUser;
      this.currentUser = currentUser;
      if (isFirstDataLoaded){
        this.setFirstDataLoading();
        if (currentUser && currentUser.name === '')
          this.dialogService.open(DialogSignupComponent, { closeOnBackdropClick: false, closeOnEsc: false });
      }
    });
    this.subscriptions.push(s);
    s = this.chatCoreService.targetUsers.subscribe(targetUsers => {
      const isFirstDataLoaded = !this.targetUsers;
      this.targetUsers = targetUsers;
      if (this.chats)
        this.chats = this.formatChats(this.unformattedChats);
      if (isFirstDataLoaded){
        this.setFirstDataLoading();
      }
    });
    this.subscriptions.push(s);
    s = this.chatCoreService.chats.subscribe(chats => {
      const isFirstDataLoaded = !this.chats;
      this.unformattedChats = chats;
      if (this.targetUsers)
        this.chats = this.formatChats(chats);
      if (isFirstDataLoaded) {
        this.setFirstDataLoading();
      }
    });
    this.subscriptions.push(s);

    this.afAuth.user.subscribe(u => {
      this.chatCoreService.init(u.email, u.uid);
      // this.chatNotificationsService.subscribeToMessagesPushNotifications(u.email);
    });

    const helper = new JwtHelperService();
    const tokenExpiredInterval = setInterval(() => {
      const isTokenExpired: boolean = helper.isTokenExpired(localStorage.getItem('currentToken'));
      if (isTokenExpired) {
        clearInterval(tokenExpiredInterval);
        setTimeout(() => {
          this.toastrService.show('Login into with your account again. Logging out...', 'Access expired', new NbToastrConfig({status: 'info'}));
          setTimeout(() => this.afAuth.signOut().then(_ => window.location.reload()), 4000);
        }, 2000);
      }
    }, 2000);

    this.isInitialized = true;

  }

  public sendMessage(formattedMessage: any): void {
    // making a message from the formatted one
    // console.log('message from ui to send', formattedMessage);
    const message = this.makeMessageToSend(formattedMessage);
    // console.log('message MAKED to send', message);
    // adding the message to the list of the displayed messages, marking it as to be confirmed ("...")
    const messageToDisplay = this.formatMessage(message, true);
    // console.log('message FORMATTED to send', finalMessage);
    const prevReply = this.messages.length >= 1 ? this.messages[this.messages.length - 1].reply : null;
    if (prevReply !== messageToDisplay.reply && this.messages.length >= 1){
      this.messages[this.messages.length - 1].lastOfAGroup = true;
    }
    const prevDate = this.messages.length > 0 ? this.messages[this.messages.length - 1].timestamp : null;
    if (!prevDate || !moment(message.timestamp).isSame(prevDate, 'day')) {
      messageToDisplay.firstOfTheDay = true;
    }
    messageToDisplay.files.forEach(file => file.uploadingPercentage = 0);
    this.messages.push(messageToDisplay);
    // sending messages with CCS
    const sendMessageProgressOb = this.chatCoreService.sendMessage(message);
    sendMessageProgressOb.sendMessageResponseOb.subscribe(_ => {
      this.chatCoreService.chatNotificationsService.sendMessagePushNotification(message.text, this.currentUser.username, this.targetUsername);
      console.log('CFC: message sent to', this.targetUsername);
    }, (error) => {
      console.log('CFC: ERROR while sending message', error);
    });
    if (sendMessageProgressOb.progressObs) {
      sendMessageProgressOb.progressObs.forEach((progressOb, index) => {
        progressOb.subscribe(percentage => {
          const findedMessage = this.messages.find(m => m.timestamp === messageToDisplay.timestamp);
          findedMessage.files = findedMessage.files.map((file, alreadyFileIndex) => ({
            uploadingPercentage: index === alreadyFileIndex ? percentage : file.uploadingPercentage,
            url: file.url,
            type: file.type,
            icon: file.icon,
            name: file.name
          }));
          // console.log('UPLOADING FILE ', index, ' AT %', percentage, '  ', this.messages.find(message => message.date === finalMessage.date));
        });
      });

    }
    this.messageQuoted = null;
    // console.log("CFC: currently displayed messages", {'displayed messages': this.messages});
  }

  public assignMessageQuoted(message): void {
    console.log('Quoted message with uid', message.uid);
    this.messageQuoted = message;
  }

  public toISODate(timestamp): string {
    if (!timestamp)
      return null;
    return new Date(timestamp).toISOString();
  }

  public getTimeFormat(): string {
    const appSettings = JSON.parse(localStorage.getItem('appSettings'));
    switch (appSettings.dateFormat) {
      case 12:
        return 'shortTime';
      case 24:
        return 'HH:mm';
    }
  }

  public getDateTimeFormat(): string {
    const appSettings = JSON.parse(localStorage.getItem('appSettings'));
    switch (appSettings.dateFormat) {
      case 12:
        return 'short';
      case 24:
        return 'dd/MM/yyyy, HH:mm';
    }
  }

  public selectChat(username, userUID, chatUID): void {
    this.chatCoreService.setChat(username, userUID);
    this.currentChatUID = chatUID;
    this.showChat();
  }

  public hideChat(): void {
    this.isChatOpened = false;
  }

  public showChat(): void {
    this.isChatOpened = true;
    this.confirmMessagesAsReaded();
  }

  public chatFormValueChanged(): void {
    console.log('FormValueChanged');
    if (!this.writingInfoAlreadySent) {
      this.writingInfoAlreadySent = true;
      this.chatCoreService.updateCurrentUserWritingInChat(this.currentChatUID).subscribe(_ => console.log('CUS: Current user writing sent.'));
      setTimeout(() => this.writingInfoAlreadySent = false, 2000);
    }
  }

  private makeMessageToSend(formattedMessage): Partial<Message> {

    let type;
    console.log('sending unf', formattedMessage);
    if (this.messageQuoted && formattedMessage.files && formattedMessage.files.length !== 0)
      type = 'quote_file';
    else if (this.messageQuoted)
      type = 'quote';
    else if (formattedMessage.files && formattedMessage.files.length !== 0)
      type = 'file';
    else
      type = 'text';

    return {
      text: formattedMessage.message,
      timestamp: new Date().getTime(),
      type,
      files: formattedMessage.files,
      quote_message_uid: this.messageQuoted ? this.messageQuoted.uid : null,
      users_uids: [this.currentUserUID, this.targetUserUID]
    };
  }

  private indexOfMessageWithTimestamp(timestamp: number): number {
    // Returns true if messages has a message with the given date, otherwise false
    let i = 0;
    const timeDate = timestamp; // new Date(date).getTime();
    while (i < this.messages.length){
      const thisTimeDate = this.messages[i].timestamp;
      let thisTimeDateConfirm = null;
      if (this.messages[i].confirmTimestamp)
        thisTimeDateConfirm = this.messages[i].confirmTimestamp;
      if (thisTimeDate === timeDate || (thisTimeDateConfirm != null && thisTimeDateConfirm === timeDate)){
        return i;
      }
      i += 1;
    }
    return -1;
  }

  private formatUpdateMessages(unformattedMessages: Message[]): void {

    // Takes an array of messages from the CCS (ordered from the newer to the older)
    // Updates the list of the displayed messages and the list of the messages to be confirmed

    let prevDate = this.messages.length > 0 ? this.messages[this.messages.length - 1].timestamp : null;
    let prevSender = this.messages.length > 0 ? this.messages[this.messages.length - 1].users_uids[0] : null;
    // taking the messages loaded from CCS, but ordered from the older to the newer

    const orderedUnformattedMessages = unformattedMessages.slice().reverse();
    orderedUnformattedMessages.forEach((message, _) => {

      const indexOfMessage = this.indexOfMessageWithTimestamp(message.timestamp);
      // if the message has to be confirmed
      if (indexOfMessage !== -1 && this.messages[indexOfMessage].confirmTimestamp){
        // marking the message on the UI as confirmed (displaying the date of sent)
        this.messages[indexOfMessage].timestamp = message.timestamp;
        this.messages[indexOfMessage].confirmTimestamp = null;
        this.messages[indexOfMessage].uid = message.uid;
        if (message.files) {
          const existingMessageIndex = this.messages.findIndex(m => m.uid === message.uid);
          console.log('prev m', this.messages[existingMessageIndex]);
          this.messages[existingMessageIndex].files = (message.files as File[]).map((confirmedFile, index) => ({
            url: confirmedFile.url,
            type: confirmedFile.type,
            name: confirmedFile.title,
            icon: this.messages[existingMessageIndex].files[index].icon,
            uploadingPercentage: this.messages[existingMessageIndex].files[index].uploadingPercentage
          }));
          console.log('succ m', this.messages[existingMessageIndex]);
        }
        // marking as readed messages
        if (!message.readed)
          this.messages[indexOfMessage].status = '';
        else
          this.messages[indexOfMessage].status = '✔';
        prevSender = message.users_uids[0];
        prevDate = message.timestamp;
      }
      // else if the message is already displayed, do nothing
      else if (indexOfMessage !== -1){
        // console.log("alreadyhas", message);
        // marking as readed messages
        if (this.messages[indexOfMessage].reply){
          if (!message.readed)
            this.messages[indexOfMessage].status = '';
          else{
            this.messages[indexOfMessage].status = '✔';
          }
        }
        prevSender = message.users_uids[0];
        prevDate = message.timestamp;
        return;
      }
      // else add the message to the displayed messages
      else{
        // marking as to send the readed notify the messages just readed
        if (message.users_uids[0] === this.targetUserUID && !message.readed){
          this.toConfirmReadedMessages.push({
            users_uids: message.users_uids,
            timestamp: message.timestamp,
            readed: true,
            type: message.type,
            uid: message.uid
          });
        }
        const formattedMessage = this.formatMessage(message, false);

        if (!moment(message.timestamp).isSame(prevDate, 'day')) {
          formattedMessage.firstOfTheDay = true;
        }
        // console.log('prevsender', prevSender, 'sender_username', message.sender_username);
        // console.log('!moment(message.timestamp).isSame(prevDate, \'day\')', !moment(message.timestamp).isSame(prevDate, 'day'), message.timestamp, prevDate);
        if (prevSender !== message.users_uids[0] && this.messages.length >= 1){
          this.messages[this.messages.length - 1].lastOfAGroup = true;
        }
        prevSender = message.users_uids[0];
        prevDate = message.timestamp;
        this.messages.push(formattedMessage);
      }
      /*
      this.messages.sort((a, b) => {
        let d1;
        let d2;
        if (a.timestamp != null)
          d1 = new Date(a.timestamp);
        else
          d1 = new Date(a.confirmTimestamp);
        if (b.timestamp != null)
          d2 = new Date(b.timestamp);
        else
          d2 = new Date(b.confirmTimestamp);
        return d1 - d2;
      });*/

    });

    // removing messages if too much
    /*while (this.messages.length > unformattedMessages.length){
      this.messages.shift();
    }*/
    // console.log("FINE");
    // console.log("CFC: currently displayed messages", {'displayed messages': this.messages});
    if (this.isChatOpened)
      this.confirmMessagesAsReaded();
  }

  private formatMessage(unformattedMessage: any, toConfirm: boolean): UIMessage {
    // making a formatted message from an unformatted one. If toConfirm the message is
    // marked as to be confirmed

    let reply = true;
    let status = '';
    let timestamp = unformattedMessage.timestamp;
    let confirmTimestamp = null;

    if (unformattedMessage.users_uids[0] === this.targetUserUID){
      reply = false;
    }else{
      if (!unformattedMessage.readed)
        status = '';
      else
        status = '✔';
    }

    if (toConfirm){
      timestamp = null;
      confirmTimestamp = unformattedMessage.timestamp;
      status = '...';
    }

    const files = !unformattedMessage.files ? [] : unformattedMessage.files.map((file) => {
      if (file.url){
        return {
          url: file.url,
          type: file.type,
          name: file.title,
          icon: 'file-text-outline',
        };
      } else {
        return {
          url: file.src,
          type: file.type,
          name: file.name,
          icon: 'file-text-outline',
        };
      }

    });

    let type = unformattedMessage.type;
    let quote = null;

    if (unformattedMessage.quote_message_uid && (type === 'quote' || type === 'quote_file')) {
      console.log('formatting m with quote', unformattedMessage);
      quote = this.messages.find(message => message.uid === unformattedMessage.quote_message_uid);
      console.log('finded quoted m', quote);
      if (!quote)
        type = (type === 'quote') ? 'text' : 'file';

    }
    return {
      confirmTimestamp,
      timestamp,
      latitude: null,
      longitude: null,
      text: unformattedMessage.text,
      type,
      reply,
      status,
      files,
      quote,
      uid: unformattedMessage.uid,
      firstOfTheDay: null,
      lastOfAGroup: null,
      users_uids: unformattedMessage.users_uids
    };
  }

  private confirmMessagesAsReaded(): void {
    if (this.router.url === '/chat'){
      if (this.toConfirmReadedMessages.length > 0){
        this.toConfirmReadedMessages.forEach(m => {
          this.chatCoreService.setMessageAsReaded(m.uid).subscribe(_ => {
            console.log('CFC: message confirmed as readed', {messages: m});
          }, (error) => {
            console.log('CFC: ERROR while confirming message as readed', error);
          });
        });
        this.toConfirmReadedMessages = [];
      }
    }
  }

  private formatChats(unformattedChats: Chat[]): UIChat[] {

    let soundPlayed = false;
    const chats: UIChat[] = [];
    let notify;
    let isAtLeastOneToNotify = false;
    let chatUserUID;
    unformattedChats.forEach(chat => {

      chatUserUID = chat.users_uids.find(uid => uid !== this.currentUserUID);

      const user = this.targetUsers.find(u => u.uid === chatUserUID);

      if (!user)
        return;

      if (chat.user_has_to_read === this.currentUserUID) {
        notify = '⋯';
        isAtLeastOneToNotify = true;
      } else
        notify = '';

      const prevChat = this.chats.find(c => c.targetUsername === user.username);
      if (!soundPlayed && isAtLeastOneToNotify && prevChat && prevChat.messages_to_read !== chat.messages_to_read) {
        this.howl.get('newMessageSound').play();
        soundPlayed = true;
      }

      // tslint:disable-next-line:variable-name
      let is_target_user_writing;
      const targetUserIndex = chat.users_uids.indexOf(this.targetUserUID);
      if (targetUserIndex === 0)
        is_target_user_writing = !!chat.user0_writing;
      else
        is_target_user_writing = !!chat.user1_writing;

      if (chat.uid === this.currentChatUID)
        this.targetUserWriting = is_target_user_writing;

      chats.push({
        uid: chat.uid,
        targetUserUID: chatUserUID,
        targetUsername: user.username,
        notify,
        name: user ? user.name : '',
        surname: user ? user.surname : '',
        profile_img_url: user ? user.profile_img_url : null,
        messages_to_read: isAtLeastOneToNotify ? chat.messages_to_read : null,
        updated_timestamp: chat.last_message_preview === 'No messages yet' ? null : chat.updated_timestamp,
        target_user_writing: is_target_user_writing,
        last_message_preview: chat.last_message_preview,
        online: user.online,
        users_uids: chat.users_uids,
        user0_writing: chat.user0_writing,
        user1_writing: chat.user1_writing,
        user_writing_updated_by: chat.user_writing_updated_by
      });

    });
    chats.sort((c1, c2) => (c2.updated_timestamp - c1.updated_timestamp));
    return chats;
  }

  private setFirstDataLoading(): void {
    if (this.firstDataLoadingStatus === 0) {
      setTimeout(() => this.firstDataLoadingStatus += 33, 200);
    } else if (this.firstDataLoadingStatus === 66) {
      this.firstDataLoadingStatus += 34;
      setTimeout(() => this.isFirstDataLoaded = true, 400);
    } else {
        this.firstDataLoadingStatus += 33;
    }
  }



}



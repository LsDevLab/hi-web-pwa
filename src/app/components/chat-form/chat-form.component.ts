import { Component } from '@angular/core';
import { ChatCoreService } from '../../services/chat-core.service';
import { AuthService } from '@auth0/auth0-angular';
import { NgxHowlerService } from 'ngx-howler';
import {Router} from '@angular/router';
import {HttpClient} from '@angular/common/http';
import moment from 'moment';

@Component({
  selector: 'app-chat-form',
  templateUrl: './chat-form.component.html',
  styleUrls: ['./chat-form.component.css']
})
export class ChatFormComponent {

  thisUserAvatar: string = 'https://i.gifer.com/no.gif';

  // displayed messages
  messages = [];

  currentUser: string;
  targetUser: string;

  messageQuoted: any;

  constructor(private chatCoreService: ChatCoreService, public auth: AuthService,
              public howl: NgxHowlerService, private router: Router, private http: HttpClient) {
  }

  ngOnInit() {
    this.howl.register('newMessageSound', {
      src: ['assets/sounds/newMessageSound.mp3'],
      html5: true
    }).subscribe(status => {
      //ok
    });
    this.chatCoreService.currentUsernameObservable.subscribe(c => this.currentUser = c);
    this.chatCoreService.targetUsernameObservable.subscribe(t => {
      this.targetUser = t;
      this.messages = [];
      this.messageQuoted = null;
    });
    this.chatCoreService.loadedMessagesObservable.subscribe(msgs => this.formatUpdateMessages(msgs));
    //this.howl.get('newMessageSound').play();
  }

  sendMessage(formattedMessage: any) {
    // making a message from the formatted one
    let message = this.makeMessage(formattedMessage);
    // adding the message to the list of the displayed messages, marking it as to be confirmed ("...")
    const finalMessage = this.formatMessage(message, true);
    const prevReply = this.messages[this.messages.length - 1].reply;
    if (prevReply !== finalMessage.reply && this.messages.length >= 1){
      this.messages[this.messages.length - 1].lastOfAGroup = true;
    }
    this.messages.push(finalMessage);
    // sending messages with CCS
    this.chatCoreService.sendMessage(message).subscribe(response => {
      this.chatCoreService.chatNotificationsService.sendMessagePushNotification(message.text, this.currentUser, this.targetUser);
      console.log("CFC: message sent to", this.targetUser);
      this.chatCoreService.setCurrentChatNotifyToTarget().subscribe(response => {
        console.log('CFC: setted notify flag to', this.targetUser);
      },(error) => {
        console.log('CFC: ERROR while setting chat notify flag to ', this.targetUser, error);
      });
    },(error) => {
      console.log('CFC: ERROR while sending message', error);
    });
    this.messageQuoted = null;
    //console.log("CFC: currently displayed messages", {'displayed messages': this.messages});
  }

  // Makes a Message to send from a FormattedMessage
  makeMessage(formattedMessage) {

    let type = formattedMessage.files.length ? 'file' : 'text';
    if (this.messageQuoted)
      type = 'quote';

    let message = {
      text: formattedMessage.message,
      date: new Date(),
      reply: true,  // if reply then you are the sender
      type: type,
      files: formattedMessage.files,
      user: { // the sender of the message in this application
        name: this.currentUser,
        avatar: this.thisUserAvatar,
      },
      quote: this.messageQuoted
    };
    return message;
  }

  indexOfMessageWithDate(date){
    // Returns true if messages has a message with the given date, otherwise false
    let i = 0;
    let timeDate = new Date(date).getTime();
    while (i < this.messages.length){
      let thisTimeDate = new Date(this.messages[i].date).getTime();
      let thisTimeDateConfirm = null;
      if (this.messages[i].confirmDate)
        thisTimeDateConfirm = new Date(this.messages[i].confirmDate).getTime();
      if (thisTimeDate == timeDate || (thisTimeDateConfirm != null && thisTimeDateConfirm == timeDate)){
        return i;
      }
      i += 1;
    }
    return -1;
  }

  formatUpdateMessages(unformattedMessages) {
    //console.log("INIZIO")
    // Takes an array of messages from the CCS (ordered from the newer to the older)
    // Updates the list of the displayed messages and the list of the messages to be confirmed

    let prevDate = null;
    let prevSender = null;
    let reproduceSound = true;
    let justReadedMessagesId = [];

    // taking the messages loaded from CCS, but ordered from the older to the newer

    const orderedUnformattedMessages = unformattedMessages.slice().reverse();
    orderedUnformattedMessages.forEach((message, index) => {

      let indexOfMessage = this.indexOfMessageWithDate(message.date);
      // if the message has to be confirmed
      if (indexOfMessage != -1 && this.messages[indexOfMessage].confirmDate){
        // marking the message on the UI as confirmed (displaying the date of sent)
        this.messages[indexOfMessage].date = message.date;
        this.messages[indexOfMessage].confirmDate = null;
        // marking as readed messages
        if(!message.readed)
          this.messages[indexOfMessage].user.name = "";
        else
          this.messages[indexOfMessage].user.name = "✔";
        this.messages[indexOfMessage].id = message.id;
        prevSender = message.senderUsername;
        prevDate = message.date;
      }
      // else if the message is already displayed, do nothing
      else if (indexOfMessage != -1){
        //console.log("alreadyhas", message);
        // marking as readed messages
        if(this.messages[indexOfMessage].reply){
          if(!message.readed)
            this.messages[indexOfMessage].user.name = "";
          else{
            this.messages[indexOfMessage].user.name = "✔";
          }
        }
        prevSender = message.senderUsername;
        prevDate = message.date;
        return;
      }
      // else add the message to the displayed messages
      else{
        // marking as to send the readed notify the messages just readed
        if(message.senderUsername === this.targetUser && message.readed == null){
          justReadedMessagesId.push(message.id);
        }
        let formattedMessage = this.formatMessage(message, false);

        if (!moment(message.date).isSame(prevDate, 'day')) {
          formattedMessage.firstOfTheDay = true;
        }
        if (prevSender !== message.senderUsername && this.messages.length >= 1){
          this.messages[index - 1].lastOfAGroup = true;
        }
        prevSender = message.senderUsername;
        prevDate = message.date;
        this.messages.push(formattedMessage);
      }


      this.messages.sort((a, b) => {
        let d1;
        let d2;
        if (a.date != null)
          d1 = new Date(a.date);
        else
          d1 = new Date(a.confirmDate);
        if (b.date != null)
          d2 = new Date(b.date);
        else
          d2 = new Date(b.confirmDate);
        return d1 - d2;
      });

    });

    // removing messages if too much
    while (this.messages.length > unformattedMessages.length){
      this.messages.shift();
    }
    //console.log("FINE");
    //console.log("CFC: currently displayed messages", {'displayed messages': this.messages});

    if(this.router.url === '/chat'){

      if(justReadedMessagesId.length > 0){
        this.chatCoreService.setMessagesAsReaded(justReadedMessagesId).subscribe(response => {
          console.log("CFC: messages confirmed as readed", {'messages': justReadedMessagesId});
        },(error) => {
          console.log('CFC: ERROR while confirming messages as readed', error);
        });
        this.howl.get('newMessageSound').play();
      }

      this.chatCoreService.clearCurrentChatNotify().subscribe(response => {
        console.log("CFC: current chat notify flag cleared");
      },(error) => {
        console.log('CFC: ERROR while clearing notify for current chat', error);
      });
    }




  }

  formatMessage(unformattedMessage, toConfirm){
    // making a formatted message from an unformatted one. If toConfirm the message is
    // marked as to be confirmed

    let reply = true;
    let user = "";
    let date = unformattedMessage.date;
    let confirmDate = null;

    if (unformattedMessage.senderUsername === this.targetUser){
      reply = false;
    }else{
      if(!unformattedMessage.readed)
        user = "";
      else
        user = "✔";
    }

    if (toConfirm){
      date = null;
      confirmDate = unformattedMessage.date.toISOString();
      user += "...";
    }

    const files = !unformattedMessage.files ? [] : unformattedMessage.files.map((file) => {
      if(typeof file === 'string'){
        return {
          url: file.split('%%%')[0],
          type:  file.split('%%%')[1],
          title: file.split('%%%')[2],
          icon: 'file-text-outline',
        };
      } else {
        return {
          url: file.src,
          type: file.type,
          title: file.name,
          icon: 'file-text-outline',
        };
      }

    });

    let formattedMessage = {
      confirmDate: confirmDate,
      date: date,
      latitude: unformattedMessage.latitude,
      longitude: unformattedMessage.longitude,
      text: unformattedMessage.text,
      type: unformattedMessage.type,
      reply: reply,
      user:{
        name: user,
        avatar: null
      },
      files: files,
      quote: unformattedMessage.quote ? unformattedMessage.quote : this.messages.find(message => message.id === unformattedMessage.quoteMessageId),
      //quoteMessageId: unformattedMessage.quote ? unformattedMessage.quote : unformattedMessage.quote.id,
      id: unformattedMessage.id,
      firstOfTheDay: null,
      lastOfAGroup: null
    };
    return formattedMessage;
  }

  loadFilesOfMessage(date, filesURLSArray: string[]){
    const messageIndex = this.indexOfMessageWithDate(date);
    if (messageIndex != -1){
      this.messages[messageIndex].files = [];
      filesURLSArray.forEach(fileURL => {
        console.log('CFC: Downloading file', fileURL, ' of message with date', date);
        this.http.get(fileURL, { responseType: 'blob' }).subscribe(result => {
          console.log('CFC: File ', fileURL, 'downloaded', result);
          const messageIndex = this.indexOfMessageWithDate(date);
          if (messageIndex != -1){
            //const file = new File([result], fileURL, {type:result.type});
            this.messages[messageIndex].files.push({
              url: fileURL,
              type: result.type,
              icon: 'file-text-outline',
            });
            console.log('messages', this.messages);
            console.log('CFC: File ', fileURL, 'added to message with date', date);
          }
        }, error => {
          console.log('CFC: Error downloading file ', fileURL, error);
        });
      });
    }
  }

  assignMessageQuoted(message) {
    console.log('Quoted message with id', message.id);
    this.messageQuoted = message;
  }

}

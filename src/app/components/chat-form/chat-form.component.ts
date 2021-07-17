import { Component } from '@angular/core';
import { ChatCoreService } from '../../services/chat-core.service';
import { AuthService } from '@auth0/auth0-angular';
import { NgxHowlerService } from 'ngx-howler';
import {Router} from '@angular/router';
import {HttpClient} from '@angular/common/http';
import moment from 'moment';
import {first} from 'rxjs/operators';

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
      this.chatCoreService.getMessages.pipe(first()).subscribe(msgs => {
        this.messages = [];
        this.messageQuoted = null;
        console.log('GETTING messages', msgs);
        this.formatUpdateMessages(msgs);
      });
    });

    this.chatCoreService.messageAdded.subscribe(msg => {
      console.log('ADDED msg', msg);
      this.formatUpdateMessages([msg]);
    });
    this.chatCoreService.messageChanged.subscribe(msg => {
      console.log('CHANGED msg', msg);
      this.formatUpdateMessages([msg])
    });
    this.chatCoreService.messageDeleted.subscribe(msg => {
      console.log('DELETED msg', msg);
      this.messages.splice(this.indexOfMessageWithTimestamp(msg.timestamp), 1)
    });

    //this.howl.get('newMessageSound').play();
  }

  sendMessage(formattedMessage: any) {
    // making a message from the formatted one
    let message = this.makeMessage(formattedMessage);
    // adding the message to the list of the displayed messages, marking it as to be confirmed ("...")
    const finalMessage = this.formatMessage(message, true);
    const prevReply = this.messages.length >= 1 ? this.messages[this.messages.length - 1].reply : null;
    if (prevReply !== finalMessage.reply && this.messages.length >= 1){
      this.messages[this.messages.length - 1].lastOfAGroup = true;
    }
    finalMessage.files.forEach(file => file.uploadingPercentage = 0);
    this.messages.push(finalMessage);
    // sending messages with CCS
    const sendMessageProgressOb = this.chatCoreService.sendMessage(message);
    sendMessageProgressOb.sendMessageResponseOb.subscribe(response => {
      this.chatCoreService.chatNotificationsService.sendMessagePushNotification(message.text, this.currentUser, this.targetUser);
      console.log("CFC: message sent to", this.targetUser);
    },(error) => {
      console.log('CFC: ERROR while sending message', error);
    });
    if (sendMessageProgressOb.progressObs) {
      sendMessageProgressOb.progressObs.forEach((progressOb, index) => {
        progressOb.subscribe(percentage => {
          const message = this.messages.find(message => message.timestamp === finalMessage.timestamp);
          message.files = message.files.map((file, alreadyFileIndex) => ({
            uploadingPercentage: index === alreadyFileIndex ? percentage : file.uploadingPercentage,
            url: file.url,
            type: file.type,
            icon: file.icon,
            name: file.name
          }));
          //console.log('UPLOADING FILE ', index, ' AT %', percentage, '  ', this.messages.find(message => message.date === finalMessage.date));
        })
      });

    }
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
      timestamp: new Date().getTime(),
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

  indexOfMessageWithTimestamp(timestamp){
    // Returns true if messages has a message with the given date, otherwise false
    let i = 0;
    let timeDate = timestamp;//new Date(date).getTime();
    while (i < this.messages.length){
      let thisTimeDate = this.messages[i].timestamp;
      let thisTimeDateConfirm = null;
      if (this.messages[i].confirmDate)
        thisTimeDateConfirm = this.messages[i].confirmDate;
      if (thisTimeDate == timeDate || (thisTimeDateConfirm != null && thisTimeDateConfirm == timeDate)){
        return i;
      }
      i += 1;
    }
    return -1;
  }

  formatUpdateMessages(unformattedMessages) {
    // Takes an array of messages from the CCS (ordered from the newer to the older)
    // Updates the list of the displayed messages and the list of the messages to be confirmed

    let prevDate = this.messages.length > 0 ? this.messages[this.messages.length - 1].timestamp : null;
    let prevSender = this.messages.length > 0 ? this.messages[this.messages.length - 1].sender_username : null;
    let reproduceSound = true;
    let justReadedMessages = [];

    // taking the messages loaded from CCS, but ordered from the older to the newer

    const orderedUnformattedMessages = unformattedMessages.slice().reverse();
    orderedUnformattedMessages.forEach((message, index) => {

      let indexOfMessage = this.indexOfMessageWithTimestamp(message.timestamp);
      // if the message has to be confirmed
      if (indexOfMessage != -1 && this.messages[indexOfMessage].confirmDate){
        // marking the message on the UI as confirmed (displaying the date of sent)
        this.messages[indexOfMessage].timestamp = message.timestamp;
        this.messages[indexOfMessage].confirmDate = null;
        if (message.files)
          message.files.forEach((messageFile, index) => {
            const existingMessage = this.messages.find(m => m.timestamp === message.timestamp);
            existingMessage.files = existingMessage.files.map((file, alreadyFileIndex) => ({
              uploadingPercentage: file.uploadingPercentage,
              url: messageFile.split('%%%')[0],
              name: messageFile.split('%%%')[2],
              type: messageFile.split('%%%')[1],
              icon: file.icon
            }));
          });
        // marking as readed messages
        if(!message.readed)
          this.messages[indexOfMessage].user.name = "";
        else
          this.messages[indexOfMessage].user.name = "✔";
        this.messages[indexOfMessage].id = message.id;
        prevSender = message.sender_username;
        prevDate = message.timestamp;
      }
      // else if the message is already displayed, do nothing
      else if (indexOfMessage != -1){
        //console.log("alreadyhas", message);
        // marking as readed messages
        if(this.messages[indexOfMessage].reply){
          if(!message.readed_from_receiver)
            this.messages[indexOfMessage].user.name = "";
          else{
            this.messages[indexOfMessage].user.name = "✔";
          }
        }
        prevSender = message.sender_username;
        prevDate = message.timestamp;
        return;
      }
      // else add the message to the displayed messages
      else{
        // marking as to send the readed notify the messages just readed
        if(message.sender_username === this.targetUser && !message.readed_from_receiver){
          justReadedMessages.push({
            sender_username: message.sender_username,
            receiver_username: message.receiver_username,
            timestamp: message.timestamp,
            readed_from_receiver: true,
            type: message.type
          });
        }
        let formattedMessage = this.formatMessage(message, false);

        if (!moment(message.timestamp).isSame(prevDate, 'day')) {
          formattedMessage.firstOfTheDay = true;
        }
        if (prevSender !== message.sender_username && this.messages.length >= 1){
          this.messages[this.messages.length - 1].lastOfAGroup = true;
        }
        prevSender = message.sender_username;
        prevDate = message.timestamp;
        this.messages.push(formattedMessage);
      }

      this.messages.sort((a, b) => {
        let d1;
        let d2;
        if (a.timestamp != null)
          d1 = new Date(a.timestamp);
        else
          d1 = new Date(a.confirmDate);
        if (b.timestamp != null)
          d2 = new Date(b.timestamp);
        else
          d2 = new Date(b.confirmDate);
        return d1 - d2;
      });

    });

    // removing messages if too much
    /*while (this.messages.length > unformattedMessages.length){
      this.messages.shift();
    }*/
    //console.log("FINE");
    //console.log("CFC: currently displayed messages", {'displayed messages': this.messages});

    if(this.router.url === '/chat'){
      if(justReadedMessages.length > 0){
        this.chatCoreService.setMessagesAsReaded(justReadedMessages).subscribe(response => {
          console.log("CFC: messages confirmed as readed", {'messages': justReadedMessages});
        },(error) => {
          console.log('CFC: ERROR while confirming messages as readed', error);
        });
        this.howl.get('newMessageSound').play();
      }
    }




  }

  formatMessage(unformattedMessage, toConfirm){
    // making a formatted message from an unformatted one. If toConfirm the message is
    // marked as to be confirmed

    let reply = true;
    let user = "";
    let timestamp = unformattedMessage.timestamp;
    let confirmDate = null;

    if (unformattedMessage.sender_username === this.targetUser){
      reply = false;
    }else{
      if(!unformattedMessage.readed_from_receiver)
        user = "";
      else
        user = "✔";
    }

    if (toConfirm){
      timestamp = null;
      confirmDate = unformattedMessage.timestamp;
      user += "...";
    }

    const files = !unformattedMessage.files ? [] : unformattedMessage.files.map((file) => {
      if(typeof file === 'string'){
        return {
          url: file.split('%%%')[0],
          type:  file.split('%%%')[1],
          name: file.split('%%%')[2],
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

    let formattedMessage = {
      confirmDate: confirmDate,
      timestamp: timestamp,
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
      lastOfAGroup: null,
      sender_username: unformattedMessage.sender_username
    };
    return formattedMessage;
  }

  loadFilesOfMessage(date, filesURLSArray: string[]){
    const messageIndex = this.indexOfMessageWithTimestamp(date);
    if (messageIndex != -1){
      this.messages[messageIndex].files = [];
      filesURLSArray.forEach(fileURL => {
        console.log('CFC: Downloading file', fileURL, ' of message with date', date);
        this.http.get(fileURL, { responseType: 'blob' }).subscribe(result => {
          console.log('CFC: File ', fileURL, 'downloaded', result);
          const messageIndex = this.indexOfMessageWithTimestamp(date);
          if (messageIndex != -1){
            //const file = new File([result], fileURL, {type:result.type});
            this.messages[messageIndex].files.push({
              url: fileURL,
              type: result.type,
              icon: 'file-text-outline',
            });
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

  toISODate(timestamp) {
    return new Date(timestamp).toISOString();
  }

}

import { JsonPipe } from '@angular/common';
import { Component, Input } from '@angular/core';
import { ChatCoreService } from '../../services/chat-core.service';
import { AuthService } from '@auth0/auth0-angular';
import { time } from 'console';
import { threadId } from 'worker_threads';
import { throwServerError } from '@apollo/client/core';

@Component({
  selector: 'app-chat-form',
  templateUrl: './chat-form.component.html',
  styleUrls: ['./chat-form.component.css']
})
export class ChatFormComponent {

  thisUserAvatar: string = 'https://i.gifer.com/no.gif';

  // displayed messages
  messages = [];
  // identifiers (dates) of messages to confirm 
  messageToConfIDs = {};

  thisUser: string;
  otherUser: string;

  constructor(private chatCoreService: ChatCoreService, public auth: AuthService) {
  }

  ngOnInit() {
    this.chatCoreService.currentUsernameObservable.subscribe(c => this.thisUser = c);
    this.chatCoreService.targetUsernameObservable.subscribe(t => {
      this.otherUser = t;
      this.messages = [];
      this.messageToConfIDs = {};
    });
    this.chatCoreService.loadedMessagesObservable.subscribe(msgs => this.formatUpdateMessages(msgs));
  }

  sendMessage(formattedMessage: any) {
    // making a message from the formatted one
    let message = this.makeMessage(formattedMessage);
    // adding the message to the list of the displayed messages, marking it as to be confirmed ("...")
    this.messages.push(this.formatMessage(message, true));
    // sending messages with CCS
    this.chatCoreService.sendMessage(message);
  }

  // Makes a Message from a FormattedMessage 
  makeMessage(formattedMessage) {
    const files = !formattedMessage.files ? [] : formattedMessage.files.map((file) => {
      return {
        url: file.src,
        type: file.type,
        icon: 'file-text-outline',
      };
    });
    let message = {
      text: formattedMessage.message,
      date: new Date(),
      reply: true,  // if reply then you are the sender
      type: files.length ? 'file' : 'text',
      files: files,
      user: { // the sender of the message in this application
        name: this.thisUser,
        avatar: this.thisUserAvatar,
      },
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

    // taking the messages loaded from CCS, but ordered from the older to the newer
    unformattedMessages.slice().reverse().forEach(message => {

      let indexOfMessage = this.indexOfMessageWithDate(message.date);
      // if the message has to be confirmed
      if (indexOfMessage != -1 && this.messages[indexOfMessage].confirmDate){
        // marking the message on the UI as confirmed (displaying the date of sent)
        this.messages[indexOfMessage].date = message.date;
        this.messages[indexOfMessage].confirmDate = null;
        this.messages[indexOfMessage].user = "Sent on";
        console.log("CFC: message marked to confirmed", this.messages[indexOfMessage]);
      }
      // else if the message is already displayed, do nothing
      else if (indexOfMessage != -1){
        //console.log("alreadyhas", message);
        return;
      }
      // else add the message to the displayed messages
      else{
        let formattedMessage = this.formatMessage(message, false)
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
      })
      
    });

    // removing messages if too much
    while (this.messages.length > unformattedMessages.length){
      console.log("removing a message from the displayed ones")
      this.messages.shift();
    }
    //console.log("FINE");
    console.log(this.messages);

  }

  formatMessage(unformattedMessage, toConfirm){
    // making a formatted message from an unformatted one. If toConfirm the message is
    // marked as to be confirmed

    let reply = true;
    let user = "";
    let date = unformattedMessage.date;
    let confirmDate = null;

    if (unformattedMessage.senderUsername === this.otherUser){
      reply = false;
    }
    
    if (toConfirm){
      date = null;
      confirmDate = unformattedMessage.date.toISOString();
      user = "...";
    }

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
      files: null,
      quote: null
    };
    return formattedMessage;
  }

}


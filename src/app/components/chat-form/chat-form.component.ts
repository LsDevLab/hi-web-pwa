import { JsonPipe } from '@angular/common';
import { Component, Input } from '@angular/core';
import { ChatCoreService } from '../../services/chat-core.service';
import { AuthService } from '@auth0/auth0-angular';

@Component({
  selector: 'app-chat-form',
  templateUrl: './chat-form.component.html',
  styleUrls: ['./chat-form.component.css']
})
export class ChatFormComponent {

  thisUserAvatar: string = 'https://i.gifer.com/no.gif';
  messages: any[] = [];
  thisUser: string;
  otherUser: string;

  constructor(private chatCoreService: ChatCoreService, public auth: AuthService) {
    
  }

  ngOnInit() {
    this.chatCoreService.currentUsernameObservable.subscribe(c => this.thisUser = c);
    this.chatCoreService.targetUsernameObservable.subscribe(t => this.otherUser = t);
    this.chatCoreService.loadedMessagesObservable.subscribe(msgs => this.messages = this.formatMessages(msgs));
  }

  sendMessage(formattedMessage: any) {
    let message = this.makeMessage(formattedMessage);
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

  // Makes an array of FormattedMessage from a
  formatMessages(unformattedMessages) {
    /*
    if (!unformattedMessages.data){
      return [];
    }
    */
    let messages = [];

    unformattedMessages.forEach(element => {
      let reply = true;
      let user = this.thisUser;
      if (element.senderUsername === this.otherUser){
        reply = false;
        user = this.otherUser
      }
       
      let message = {
        date: element.date,
        latitude: element.latitude,
        longitude: element.longitude,
        text: element.text,
        type: element.type,
        reply: reply,
        user:{
          name: user,
          avatar: null
        },
        files: null,
        quote: null
      };

      messages.push(message);
      //messages.sort((a, b) => a.date-b.date);
    });
    
    //console.log("ChatFormComponent.formatMessages.dataResponse",messages);
    return messages;
  }

}
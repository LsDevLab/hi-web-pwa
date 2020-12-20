import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import gql from 'graphql-tag';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ChatCoreService {
  private gqlQueryMessage = gql`
    query queryMessage($USER: String!, $targetUser: String!) {
      queryMessage {
        text
        type
        longitude
        latitude
        date
        senderUser(filter: {username: {eq: $USER}, or: {username: {eq: $targetUser}}}) {
          username
        }
        receiverUser(filter: {username: {eq: $targetUser}, or: {username: {eq: $USER}}}) {
          username
        }
      }
    }
  `;
  private gqlSubMessage = gql`
  subscription queryMessage($USER: String!, $targetUser: String!) {
      queryMessage {
        text
        type
        longitude
        latitude
        date
        senderUser(filter: {username: {eq: $USER}, or: {username: {eq: $targetUser}}}) {
          username
        }
        receiverUser(filter: {username: {eq: $targetUser}, or: {username: {eq: $USER}}}) {
          username
        }
      }
    }
  `;
  private gqlAddMessage = gql`
    mutation addMessage($date: DateTime!, $type: String!, $text: String! $USER: String!, $targetUser: String!) {
      addMessage(input: {type: $type, date: $date, receiverUser: {username: $targetUser}, text: $text, senderUser: {username: $USER}}) {
        numUids
      }
    }
  `;

  private currentUsernameSource = new BehaviorSubject<string>("default-sender");
  currentUsernameObservable = this.currentUsernameSource.asObservable();
  currentUsername: string;
  private targetUsernameSource = new BehaviorSubject<string>("default-receiver");
  targetUsernameObservable = this.targetUsernameSource.asObservable();
  targetUsername: string;
  private loadedMessagesSource = new BehaviorSubject<any[]>([]);
  loadedMessagesObservable = this.loadedMessagesSource.asObservable();
  loadedMessages: any[];

  constructor(private apollo: Apollo) {
    this.currentUsernameObservable.subscribe(c => this.currentUsername = c);
    this.targetUsernameObservable.subscribe(t => this.targetUsername = t);
    this.loadedMessagesObservable.subscribe(msgs => this.loadedMessages = msgs);
  }

  private subscribeToMessages() {

    console.log("ChatCoreService.subscribeToMessages of chat with", this.targetUsername);
    
    let messageQuery = this.apollo
      .watchQuery<any[]>({
        query: this.gqlQueryMessage,
        variables: {
          USER: this.currentUsername,
          targetUser: this.targetUsername
        }
      });

    messageQuery.subscribeToMore({
      document: this.gqlSubMessage,
      variables: {
        USER: this.currentUsername,
        targetUser: this.targetUsername
      },
      updateQuery: (prev, {subscriptionData}) => {
        return subscriptionData.data
      }
    });

    messageQuery.valueChanges.subscribe(
      response =>{
        this.loadedMessagesSource.next(response.data["queryMessage"]);
        console.log(response.data["queryMessage"]);
      }
    );
  }

  sendMessage(message: any) {
    
    console.log("ChatCoreService.sendMessage to", this.targetUsername);

    this.apollo.mutate({
      mutation: this.gqlAddMessage,
      variables: {
        date: message.date,
        type: message.type,
        text: message.text,
        USER: this.currentUsername,
        targetUser: this.targetUsername
      }
    }).subscribe(({ data }) => {
    },(error) => {
      console.log('ChatCoreService.sendMessage ERROR while sending message', error);
    });

  }

  // to be called before using the service
  setUsers(currentUsername: string, targetUsername: string) {
    this.currentUsernameSource.next(currentUsername);
    console.log("ChatCoreService.setCurrentUser to", this.currentUsername);
    this.targetUsernameSource.next(targetUsername);
    console.log("ChatCoreService.setTargetUser to", this.targetUsername);  
    this.subscribeToMessages();
  }

  getLoadedMessages() {
    return this.loadedMessages;
  }


}

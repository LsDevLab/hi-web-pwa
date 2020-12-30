import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthService } from '@auth0/auth0-angular';
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
  private gqlQueryUser = gql`
  query queryUser($USER: String!) {
    queryUser(filter: {not: {username: {eq: $USER}}}) {
      username
      name
    }
  }
  `;
  private gqlSubUser = gql`
  subscription queryUser($USER: String!) {
      queryUser(filter: {not: {username: {eq: $USER}}}) {
        username
        name
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
  private targetUsersSource = new BehaviorSubject<any[]>([]);
  targetUsersObservable = this.targetUsersSource.asObservable();
  targetUsers: any[];

  constructor(private apollo: Apollo) {
    console.log("ChatCoreService initialized");
    this.currentUsernameObservable.subscribe(c => this.currentUsername = c);
    this.targetUsernameObservable.subscribe(t => this.targetUsername = t);
    this.loadedMessagesObservable.subscribe(msgs => this.loadedMessages = msgs);
    this.targetUsersObservable.subscribe(tu => this.targetUsers = tu);
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

  private subscribeToTargetUsers() {

    console.log("ChatCoreService.subscribeToTargetUsers of", this.currentUsername);
    
    let userQuery = this.apollo
      .watchQuery<any[]>({
        query: this.gqlQueryUser,
        variables: {
          USER: this.currentUsername
        }
      });

    userQuery.subscribeToMore({
      document: this.gqlSubUser,
      variables: {
        USER: this.currentUsername
      },
      updateQuery: (prev, {subscriptionData}) => {
        return subscriptionData.data
      }
    });

    userQuery.valueChanges.subscribe(
      response =>{
        this.targetUsersSource.next(response.data["queryUser"]);
        console.log(response.data["queryUser"]);
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
    this.subscribeToTargetUsers();
  }

}

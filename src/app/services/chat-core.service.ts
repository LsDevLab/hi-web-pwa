import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import gql from 'graphql-tag';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ChatCoreService {

  messageQuery = null;
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

  subscribeToMessages() {

    console.log("ChatCoreService.subscribeToMessages of chat with", this.targetUsername);

    this.messageQuery = this.apollo
      .watchQuery<any[]>({
        query: gql`
          query queryMessage($senderUserName: String!, $receiverUserName: String!){
            queryMessage(filter:{
              senderUserName:{allofterms:$senderUserName},
              receiverUserName:{allofterms:$receiverUserName},
              or:{
              senderUserName:{allofterms:$receiverUserName},
              receiverUserName:{allofterms:$senderUserName},
            }}){
              text
              senderUserName
              date
              latitude
              longitude
            }
          }
        `,
        variables: {
          senderUserName: this.currentUsername,
          receiverUserName: this.targetUsername
        }
      });


      this.messageQuery.subscribeToMore({
        document: gql`
            subscription queryMessage($senderUserName: String!, $receiverUserName: String!){
                queryMessage(filter:{
                senderUserName:{allofterms:$senderUserName},
                receiverUserName:{allofterms:$receiverUserName},
                or:{
                senderUserName:{allofterms:$receiverUserName},
                receiverUserName:{allofterms:$senderUserName},
              }}){
                text
                senderUserName
                date
                latitude
                longitude
              }
            }
        `,
        variables: {
          senderUserName: this.currentUsername,
          receiverUserName: this.targetUsername
        },
        updateQuery: (prev, {subscriptionData}) => {
          return subscriptionData.data
        }
      });

      this.messageQuery.valueChanges.subscribe(
        response => this.loadedMessagesSource.next(response.data["queryMessage"])
        );
  }

  sendMessage(message: any) {
    
    console.log("ChatCoreService.sendMessage to", this.targetUsername);

    this.apollo.mutate({
      mutation: gql`
        mutation addMessage($date: DateTime!, $type: String!, $text: String! $senderUserName: String!, $receiverUserName: String!) {
          addMessage(
            input: [
              {
                date: $date
                type: $type
                text: $text
                senderUserName: $senderUserName
                receiverUserName: $receiverUserName
              }
            ]
          ) {
            numUids
          }
        }
      `,
      variables: {
        date: message.date,
        type: message.type,
        text: message.text,
        senderUserName: this.currentUsername,
        receiverUserName: this.targetUsername
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

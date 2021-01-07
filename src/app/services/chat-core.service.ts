import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthService } from '@auth0/auth0-angular';
import { Apollo } from 'apollo-angular';
import { parse } from 'graphql';
import gql from 'graphql-tag';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ChatCoreService {
  private gqlQueryMessage = gql`
    query queryMessage($USER: String!, $targetUser: String!) {
      queryMessage(
          order: { desc: date }, 
          first: 30,
          filter: {senderUsername: {eq: $USER}, receiverUsername: {eq: $targetUser}, 
              or: {receiverUsername: {eq: $USER}, senderUsername: {eq: $targetUser}}}
        ) {
        id
        text
        type
        longitude
        latitude
        date
        senderUsername
        receiverUsername
        }
      }
  `;
  private gqlSubMessage = gql`
    subscription queryMessage($USER: String!, $targetUser: String!) {
      queryMessage(
          order: { desc: date }, 
          first: 30,
          filter: {senderUsername: {eq: $USER}, receiverUsername: {eq: $targetUser}, 
              or: {receiverUsername: {eq: $USER}, senderUsername: {eq: $targetUser}}}
        ) {
        id
        text
        type
        longitude
        latitude
        date
        senderUsername
        receiverUsername
        }
      }
  `;
  private gqlAddMessage = gql`
    mutation addMessage($date: DateTime!, $type: String!, $text: String! $USER: String!, $targetUser: String!) {
      addMessage(input: {type: $type, date: $date, receiverUsername: $targetUser, text: $text, senderUsername: $USER}) {
        numUids
      }
    }
  `;
  private gqlGetUser = gql`
  query getUser($USER: String!) {
    getUser(username: $USER) {
      username
      name
    }
  }
  `;
  private gqlQueryChats = gql`
    query queryChats($USER: String!) {
      queryChats(filter: {user1: {eq: $USER}, or: {user2: {eq: $USER}}}) {
        user1
        user2
      }
    }
  `;
  private gqlGetChats = gql`
    query queryChats($USER: String!, $targetUsername: String!) {
      queryChats(filter: {user1: {eq: $USER}, user2: {eq: $targetUsername},
                     or: {user1: {eq: $targetUsername}, user2: {eq: $USER}}}
        ) {
        user1
        user2
      }
    }
  `;
  private gqlSubChats = gql`
    subscription queryChats($USER: String!) {
      queryChats(filter: {user1: {eq: $USER}, or: {user2: {eq: $USER}}}) {
        user1
        user2
      }
    }
  `;
  private gqlAddChat = gql`
   mutation addChats($USER: String!, $otherUser: String!) {
      addChats(input: {user1: $USER, user2: $otherUser}) {
      numUids
    }
   }
 `;
  private gqlQueryUser = gql`
  query queryUser($USER: String!) {
    queryUser(filter: {username: {eq: $USER}}) {
      username
      name
      lastAccess
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
  private gqlAddUser = gql`
    mutation addUser($USER: String!, $name: String!, $lastAccess: DateTime!) {
        addUser(input: {username: $USER, name: $name, lastAccess: $lastAccess}) {
          numUids
        }
      }
  `;
  private gqlUpdateUser = gql`
    mutation updateUser($USER: String!, $lastAccess: DateTime!) {
        updateUser(input: {filter: {username: {eq: $USER}}, set: {lastAccess: $lastAccess}}) {
          numUids
        }
      }
  `;

  private currentUsernameSource = new BehaviorSubject<string>("No user selected");
  currentUsernameObservable = this.currentUsernameSource.asObservable();
  currentUsername: string;
  private targetUsernameSource = new BehaviorSubject<string>("No user selected");
  targetUsernameObservable = this.targetUsernameSource.asObservable();
  targetUsername: string;
  private loadedMessagesSource = new BehaviorSubject<any[]>([]);
  loadedMessagesObservable = this.loadedMessagesSource.asObservable();
  loadedMessages: any[];
  private chatsSource = new BehaviorSubject<any[]>([]);
  chatsObservable = this.chatsSource.asObservable();
  chats: any[];
  private targetUserlastAccessSource = new BehaviorSubject<Date>(null);
  targetUserlastAccessObservable = this.targetUserlastAccessSource.asObservable();
  targetUserlastAccess: Date;


  constructor(private apollo: Apollo) {
    this.currentUsernameObservable.subscribe(c => this.currentUsername = c);
    this.targetUsernameObservable.subscribe(t => this.targetUsername = t);
    this.loadedMessagesObservable.subscribe(msgs => this.loadedMessages = msgs);
    this.chatsObservable.subscribe(c => this.chats = c);
    this.targetUserlastAccessObservable.subscribe(isonl => this.targetUserlastAccess = isonl);
    console.log("CCS: service loaded");
  }

  private subscribeToChatMessages() {
    // Subscribes to the message of the current chat

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
        console.log("CCS: messages received", response.data["queryMessage"]);
      }
    );
  }

  private subscribeToChats() {
    // Subscribes to the chats of the current user

    let chatQuery = this.apollo
      .watchQuery<any[]>({
        query: this.gqlQueryChats,
        variables: {
          USER: this.currentUsername
        }
      });

    chatQuery.subscribeToMore({
      document: this.gqlSubChats,
      variables: {
        USER: this.currentUsername
      },
      updateQuery: (prev, {subscriptionData}) => {
        return subscriptionData.data
      }
    });

    chatQuery.valueChanges.subscribe(
      response =>{
        this.chatsSource.next(response.data["queryChats"]);
        console.log("CCS: chats received", response.data["queryChats"]);
      }
    );
  }

  private subscribeToTargetUserLastAccess(){
    // Subscribes to the activity of the target user

    let targetLastAccessQuery = this.apollo
      .watchQuery<any[]>({
        query: this.gqlQueryUser,
        variables: {
          USER: this.targetUsername
        }
      });

      targetLastAccessQuery.subscribeToMore({
      document: this.gqlQueryUser,
      variables: {
        USER: this.targetUsername
      },
      updateQuery: (prev, {subscriptionData}) => {
        return subscriptionData.data
      }
    });

    targetLastAccessQuery.valueChanges.subscribe(
      response =>{
        this.targetUserlastAccessSource.next(response.data["queryUser"][0].lastAccess);
        console.log("CCS: target last access received", response.data["queryUser"][0].lastAccess);
      }
    );
  }

  sendMessage(message: any) {
    // Send a message to the other user in the selected chat

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
      console.log("CCS: message sent to", this.targetUsername);
    },(error) => {
      console.log('CCS: ERROR while sending message', error);
    });

  }

  userExists(username){
    // Returns an observable saying if a user with the given username already exists.

    return this.apollo.watchQuery<any[]>({
      query: this.gqlGetUser,
      variables: {
        USER: username
      }
    }).valueChanges;
  }

  addUser(username, name){
    // Adds an user with the given username and name

    this.apollo.mutate({
      mutation: this.gqlAddUser,
      variables: {
        USER: username,
        name: name,
        lastAccess: new Date().toISOString()
      }
    }).subscribe(({ data }) => {
    },(error) => {
      console.log('CCS: ERROR while adding user', error);
    });
  }

  updateCurrentUserLastAccess(){
    // Updates to now the last access of the current user

    this.apollo.mutate({
      mutation: this.gqlUpdateUser,
      variables: {
        USER: this.currentUsername,
        lastAccess: new Date().toISOString()
      }
    }).subscribe(({ data }) => {
    },(error) => {
      console.log('CCS: ERROR while updating last access of the current user', error);
    });
  }

  init(currentUsername: string, currentName: string) {
    // Initializes the service setting as current user the one with the given username and name

    this.currentUsernameSource.next(currentUsername);

    // checking if the current user exists.
    this.userExists(currentUsername).subscribe(response => {
      var result = response.data["getUser"];
      if (!result){
        // if not, create a new user with the given username and name
        console.log("CCS: user first login. Created profile."); 
        this.addUser(currentUsername, currentName);  
        window.location.reload(); 
      }else{
        // subscribing to chats of the current user
        this.subscribeToChats();
        this.updateCurrentUserLastAccess();
        console.log("CCS: setted current user (", this.currentUsername, ")");
      }
    });    

    
      
  }

  setChat(targetUsername: string){
    // settings as current chat the one with the user with the given username

    this.targetUsernameSource.next(targetUsername);

    // subscribing to the messages of the current chat and to the target user last access
    this.subscribeToChatMessages();
    this.subscribeToTargetUserLastAccess();
    console.log("CCS: setted current chat (", this.currentUsername, "->", this.targetUsername, ")");

  }

  addChat(targetUsername: string) {
    
    this.apollo.mutate({
      mutation: this.gqlAddChat,
      variables: {
        USER: this.currentUsername,
        otherUser: targetUsername,
      }
    }).subscribe(({ data }) => {
      console.log("CCS: chat added", this.targetUsername);
    },(error) => {
      console.log('CCS: ERROR while adding chat', error);
    });

  }

  chatExists(targetUsername){
    // Returns true only if a chat with the given username already exists.
    let founded = false;
    this.chats.forEach(chat => {
      console.log(chat.user1, chat.user2);
      if(chat.user1 == targetUsername || chat.user2 == targetUsername){
        founded = true;
      }
        
    });
    return founded;
  }

}

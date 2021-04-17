import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import gql from 'graphql-tag';
import {BehaviorSubject, forkJoin, interval, Subscription} from 'rxjs';
import { ChatNotificationsService } from './chat-notifications.service';
import { last, map, switchMap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { AngularFireStorage } from '@angular/fire/storage';
import { concatMap } from 'rxjs/operators';
import {jsGlobalObjectValue} from '@angular/compiler-cli/src/ngtsc/partial_evaluator/src/known_declaration';

const GQL_QUERY_MESSAGE = gql`
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
      files
      senderUsername
      receiverUsername
      readed
    }
  }
`;
const GQL_SUB_MESSAGE = gql`
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
      files
      senderUsername
      receiverUsername
      readed
    }
  }
`;
const GQL_ADD_MESSAGE = gql`
  mutation addMessage($date: DateTime!, $type: String!, $text: String! $USER: String!, $targetUser: String!, $files: [String]) {
    addMessage(input: {type: $type, date: $date, receiverUsername: $targetUser, text: $text, senderUsername: $USER,
                        files: $files}) {
      numUids
    }
  }
`;
const GQL_UPDATE_MESSAGES = gql`
  mutation updateMessage($ids: [ID!], $readed: Boolean) {
    updateMessage(input: {filter:{id: $ids}, set: {readed: $readed}}) {
      numUids
    }
  }
`;

const GQL_QUERY_CHATS = gql`
  query queryChats($USER: String!) {
    queryChats(filter: {user1: {eq: $USER}, or: {user2: {eq: $USER}}}) {
      user1
      user2
      notify
    }
  }
`;
const GQL_SUB_CHATS = gql`
  subscription queryChats($USER: String!) {
    queryChats(filter: {user1: {eq: $USER}, or: {user2: {eq: $USER}}}) {
      user1
      user2
      notify
    }
  }
`;
const GQL_ADD_CHAT = gql`
  mutation addChats($USER: String!, $otherUser: String!) {
    addChats(input: {user1: $USER, user2: $otherUser, notify: "none"}) {
      numUids
    }
  }
`;
const GQL_UPDATE_CHAT = gql`
  mutation updateChats($USER: String!, $otherUser: String!, $notify: String) {
    updateChats(input: {filter: {not: {notify: {eq: $otherUser}},
      and: {user1: {eq: $USER}, user2: {eq: $otherUser},
        or: {user1: {eq: $otherUser}, user2: {eq: $USER}}}},
      set: {notify: $notify}}) {
      numUids
    }
  }
`;

const GQL_GET_USER = gql`
  query getUser($USER: String!) {
    getUser(username: $USER) {
      username
      name
      surname
      bio
      age
      sex
      online
      profile_img
    }
  }
`;
const GQL_QUERY_USER_CURRENTUSER = gql`
  query queryUser($USER: String!) {
    queryUser(filter: {username: {eq: $USER}}) {
      username
      name
      surname
      bio
      age
      sex
      online
      profile_img
    }
  }
`;
const GQL_SUB_USER_CURRENTUSER = gql`
  subscription queryUser($USER: String!) {
    queryUser(filter: {username: {eq: $USER}}) {
      username
      name
      surname
      bio
      age
      sex
      online
      profile_img
    }
  }
`;
const GQL_QUERY_USER_TARGETLASTACCESS = gql`
  query queryUser($USER: String!) {
    queryUser(filter: {username: {eq: $USER}}) {
      lastAccess
    }
  }
`;
const GQL_SUB_USER_TARGETLASTACCESS = gql`
  subscription queryUser($USER: String!) {
    queryUser(filter: {username: {eq: $USER}}) {
      lastAccess
    }
  }
`;
const GQL_QUERY_USER_CHATSINFO = gql`
  query queryUser($usernames: [String!]) {
    queryUser(filter: {username: {in: $usernames}}) {
      username
      name
      surname
      bio
      age
      sex
      online
      profile_img
    }
  }
`;
const GQL_SUB_USER_CHATSINFO = gql`
  subscription queryUser($usernames: [String!]) {
    queryUser(filter: {username: {in: $usernames}}) {
      username
      name
      surname
      bio
      age
      sex
      online
      profile_img
    }
  }
`;
const GQL_ADD_USER = gql`
  mutation addUser($USER: String!, $name: String!, $lastAccess: DateTime!, $online: Boolean,
    $surname: String!, $bio: String, $sex: String, $age: Int, $profile_img: String) {
    addUser(input: {username: $USER, name: $name, lastAccess: $lastAccess, online: $online,
      surname: $surname, bio: $bio, sex: $sex, age: $age, profile_img: $profile_img}) {
      numUids
    }
  }
`;
const GQL_UPDATE_USER = gql`
  mutation updateUser($USER: String!, $name: String, $lastAccess: DateTime, $online: Boolean,
    $surname: String, $bio: String, $sex: String, $age: Int, $profile_img: String) {
    updateUser(input: {filter: {username: {eq: $USER}}, set: {
      name: $name, lastAccess: $lastAccess, online: $online,
      surname: $surname, bio: $bio, sex: $sex, age: $age, profile_img: $profile_img}}) {
      numUids
    }
  }
`;


@Injectable({
  providedIn: 'root'
})
export class ChatCoreService {

  private currentUsernameSource = new BehaviorSubject<string>("No user selected");
  private targetUsernameSource = new BehaviorSubject<string>("No user selected");
  private targetUserDataSource = new BehaviorSubject<any>(null);
  private loadedMessagesSource = new BehaviorSubject<any[]>([]);
  private chatsSource = new BehaviorSubject<any[]>([]);
  private chatsUsersInfoSource = new BehaviorSubject<any[]>([]);
  private targetUserlastAccessSource = new BehaviorSubject<Date>(null);
  private currentUserDataSource = new BehaviorSubject<any>(null);
  private isLoadingSource = new BehaviorSubject<boolean>(null);

  private _currentUsername: string;
  private _targetUsername: string;
  private _loadedMessages: any[];
  private _chats: any[];
  private _chatsUsersInfo: any[];
  private _targetUserlastAccess: Date;
  private _currentUserData: any;
  private _isLoading: boolean;
  private _targetUserData: any;

  private chatUsersInfoSubscription: Subscription = null;
  private chatMessagesSubscription: Subscription = null;
  private targetUserLastAccessSubscription: Subscription = null;

  //////////////////////////// PUBLIC ATTRIBUTES ////////////////////////////

  public currentUsernameObservable = this.currentUsernameSource.asObservable();
  public targetUsernameObservable = this.targetUsernameSource.asObservable();
  public targetUserDataObservable = this.targetUserDataSource.asObservable();
  public loadedMessagesObservable = this.loadedMessagesSource.asObservable();
  public chatsObservable = this.chatsSource.asObservable();
  public chatsUsersInfoObservable = this.chatsUsersInfoSource.asObservable();
  public targetUserlastAccessObservable = this.targetUserlastAccessSource.asObservable();
  public currentUserDataObservable = this.currentUserDataSource.asObservable();
  public isLoadingObservable = this.isLoadingSource.asObservable();

  constructor(private apollo: Apollo, public chatNotificationsService: ChatNotificationsService,
              private afStorage: AngularFireStorage) {
    this.currentUsernameObservable.subscribe(c => this._currentUsername = c);
    this.targetUsernameObservable.subscribe(t => this._targetUsername = t);
    this.loadedMessagesObservable.subscribe(msgs => this._loadedMessages = msgs);
    this.chatsObservable.subscribe(c => this._chats = c);
    this.chatsUsersInfoObservable.subscribe(cui => this._chatsUsersInfo = cui);
    this.isLoadingObservable.subscribe(isL => this._isLoading = isL);
    this.currentUserDataObservable.subscribe(userData => this._currentUserData = userData);
    this.targetUserlastAccessObservable.subscribe(tula => this._targetUserlastAccess = tula);
    console.log("CCS: service loaded");
  }


  //////////////////////////// PRIVATE METHODS ////////////////////////////

  private subscribeToCurrentChatUsersInfo(chatTargetUsernames: string[]): Subscription {
    // Subscribes to the some info of the target users of the current list of chats

    let usersQuery = this.apollo
      .watchQuery<any[]>({
        query: GQL_QUERY_USER_CHATSINFO,
        variables: {
          usernames: chatTargetUsernames
        }
      });

    usersQuery.subscribeToMore({
      document: GQL_SUB_USER_CHATSINFO,
      variables: {
        usernames: chatTargetUsernames
      },
      updateQuery: (prev, {subscriptionData}) => {
        return subscriptionData.data
      }
    });

    return usersQuery.valueChanges.subscribe(
      response =>{
        this.chatsUsersInfoSource.next(response.data["queryUser"]);
        const newTargetUserData = response.data["queryUser"].find(user => user.username === this._targetUsername);
        if (newTargetUserData != this._targetUserData)
          this.targetUserDataSource.next(newTargetUserData);
        console.log("CCS: chats users info received", {'usersInfo': response.data["queryUser"]});
      }
    );
  }

  private subscribeToChatMessages(): Subscription {
    // Subscribes to the messages of the current chat

    let messageQuery = this.apollo
      .watchQuery<any[]>({
        query: GQL_QUERY_MESSAGE,
        variables: {
          USER: this._currentUsername,
          targetUser: this._targetUsername
        }
      });

    messageQuery.subscribeToMore({
      document: GQL_SUB_MESSAGE,
      variables: {
        USER: this._currentUsername,
        targetUser: this._targetUsername
      },
      updateQuery: (prev, {subscriptionData}) => {
        return subscriptionData.data
      }
    });

    return messageQuery.valueChanges.subscribe(
      response =>{
        this.loadedMessagesSource.next(response.data["queryMessage"]);
        console.log("CCS: messages received", {'messages': response.data["queryMessage"]});
      }
    );

  }

  private subscribeToChats(): Subscription {
    // Subscribes to the chats of the current user

    this.isLoadingSource.next(true);

    let chatQuery = this.apollo
      .watchQuery<any[]>({
        query: GQL_QUERY_CHATS,
        variables: {
          USER: this._currentUsername
        }
      });

    chatQuery.subscribeToMore({
      document: GQL_SUB_CHATS,
      variables: {
        USER: this._currentUsername
      },
      updateQuery: (prev, {subscriptionData}) => {
        return subscriptionData.data
      }
    });

    return chatQuery.valueChanges.subscribe(
      response =>{
        this.isLoadingSource.next(false);
        this.chatsSource.next(response.data["queryChats"]);
        console.log("CCS: chats received", {'chats': response.data["queryChats"]});
        if(this.chatUsersInfoSubscription)
          this.chatUsersInfoSubscription.unsubscribe();
        let chatsList = response.data["queryChats"] ? response.data["queryChats"] : null;
        if (chatsList) {
          chatsList = chatsList.map(chatData => {
            if (chatData.user1 === this._currentUsername)
              return chatData.user2;
            else
              return chatData.user1;
          });
          console.log('CCS: chats of which subscribe to their data', chatsList)
          this.chatUsersInfoSubscription = this.subscribeToCurrentChatUsersInfo(chatsList);
        }
      }
    );

  }

  private subscribeToTargetUserLastAccess(): Subscription {
    // Subscribes to the last access of the target user

    let targetLastAccessQuery = this.apollo
      .watchQuery<any[]>({
        query: GQL_QUERY_USER_TARGETLASTACCESS,
        variables: {
          USER: this._targetUsername
        }
      });

      targetLastAccessQuery.subscribeToMore({
      document: GQL_SUB_USER_TARGETLASTACCESS,
      variables: {
        USER: this._targetUsername
      },
      updateQuery: (prev, {subscriptionData}) => {
        return subscriptionData.data;
      }
    });

    return targetLastAccessQuery.valueChanges.subscribe(
      response =>{
        this.targetUserlastAccessSource.next(response.data["queryUser"][0].lastAccess);
        console.log("CCS: target last access received", {'target last access': response.data["queryUser"][0].lastAccess});
      }
    );

  }

  private subscribeToCurrentUserData(): Subscription {
    // Subscribes to the current user data

    let userQuery = this.apollo
      .watchQuery<any[]>({
        query: GQL_QUERY_USER_CURRENTUSER,
        variables: {
          USER: this._currentUsername
        }
      });

    userQuery.subscribeToMore({
      document: GQL_SUB_USER_CURRENTUSER,
      variables: {
        USER: this._currentUsername,
      },
      updateQuery: (prev, {subscriptionData}) => {
        return subscriptionData.data
      }
    });

    return userQuery.valueChanges.subscribe(
      response =>{
        this.currentUserDataSource.next(response.data["queryUser"][0]);
        console.log("CCS: current user data received", {'current user': response.data["queryUser"][0]});
      }
    );

  }

  private addUser(username): Observable<any>{
    // Adds an user with the given username

    //this.isLoadingSource.next(true);

    return this.apollo.mutate({
      mutation: GQL_ADD_USER,
      variables: {
        USER: username,
        name: '',
        lastAccess: new Date().toISOString(),
        online: false,
        bio: '',
        surname: '',
        age: 25,
        sex: 'M'
      }
    }).pipe(map(response => response.data['addUser']));

  }

  private updateCurrentUserLastAccess(): Observable<any>{
    // Updates to now the last access of the current user

    //console.log("CCS: UPDATE");

    return this.apollo.mutate({
      mutation: GQL_UPDATE_USER,
      variables: {
        USER: this._currentUsername,
        lastAccess: new Date().toISOString()
      }
    }).pipe(map(response => response.data['updateUser']));

  }


  //////////////////////////// PUBLIC METHODS ////////////////////////////

  public setCurrentChatNotifyToTarget(): Observable<any> {
    // Set the notify field of a chat to the target user. N.B. Used when the current user sends a message

    return this.apollo.mutate({
      mutation: GQL_UPDATE_CHAT,
      variables: {
        USER: this._currentUsername,
        otherUser: this._targetUsername,
        notify: this._targetUsername
      }
    }).pipe(map(response => response.data["updateChat"]));

  }

  public clearCurrentChatNotify(): Observable<any>{
    // Set the notify field of a chat to 'none'

    return this.apollo.mutate({
      mutation: GQL_UPDATE_CHAT,
      variables: {
        USER: this._currentUsername,
        otherUser: this._targetUsername,
        notify: "none"
      }
    }).pipe(map(response => response.data["updateChat"]));
  }

  private getFileStoringObs(file){
    const fileId = Math.trunc(Math.random()*1000000);
    let ref = this.afStorage.ref('chats_files/' + this._currentUsername + '/' + this._targetUsername + '/' + fileId);
    let task = ref.put(file);
    return task.snapshotChanges().pipe(
      last(),  // emit the last element after task.snapshotChanges() completed
      switchMap(() => ref.getDownloadURL())
    ).pipe(map(url => {
      return url + ' ' + file.type
    }));
  }

  public sendMessage(message: any): Observable<any> {
    // Sends a message to the current target user

    if(message.files.length) {
      let filesURLSArray: String[] = [];
      let storingFilesObsArray: Observable<any>[];
      storingFilesObsArray = message.files.map(file => this.getFileStoringObs(file));
      return forkJoin(storingFilesObsArray).pipe(map(obsResults => {
        obsResults.forEach(obsResult => {
          filesURLSArray.push(obsResult);
          console.log('CCS: File stored at URL with type', obsResult);
        });
      })).pipe(concatMap(() => {
          console.log('CCS: All files stored. Linking URLs... (', filesURLSArray, ')')
          return this.apollo.mutate({
            mutation: GQL_ADD_MESSAGE,
            variables: {
              date: message.date,
              type: message.type,
              text: message.text,
              USER: this._currentUsername,
              targetUser: this._targetUsername,
              files: filesURLSArray
            }
          }).pipe(map(response => response.data["addMessage"]));
        }
      ));
    } else {
      return this.apollo.mutate({
        mutation: GQL_ADD_MESSAGE,
        variables: {
          date: message.date,
          type: message.type,
          text: message.text,
          USER: this._currentUsername,
          targetUser: this._targetUsername,
        }
      }).pipe(map(response => response.data["addMessage"]));
    }


  }

  public setMessagesAsReaded(messagesId: string[]): Observable<any> {
    // Updates the readed flag of the messages with the provided messagesId

    return this.apollo.mutate({
      mutation: GQL_UPDATE_MESSAGES,
      variables: {
        ids: messagesId,
        readed: true
      }
    }).pipe(map(response => response.data['updateMessage']));

  }

  public getUser(username): Observable<any>{
    // Returns an observable containing an the User with the provided username

    return this.apollo.watchQuery<any[]>({
      query: GQL_GET_USER,
      variables: {
        USER: username
      }
    }).valueChanges.pipe(map(response => response.data["getUser"]));

  }

  public updateCurrentUserData(newUserData): Observable<any>{
    // Updates the current user data

    return this.apollo.mutate({
      mutation: GQL_UPDATE_USER,
      variables: {
        USER: this._currentUsername,
        name: newUserData.name,
        surname: newUserData.surname,
        age: newUserData.age,
        sex: newUserData.sex,
        bio: newUserData.bio,
      }
    }).pipe(map(response => response.data["updateUser"]));

  }

  public updateCurrentUserProfileImage(newUserProfileImage: any): Observable<any> {
    let ref = this.afStorage.ref('profile_images/' + this._currentUsername);
    let task = ref.put(newUserProfileImage);

    return task.snapshotChanges().pipe(
      last(),  // emit the last element after task.snapshotChanges() completed
      switchMap(() => ref.getDownloadURL())
    ).pipe(concatMap(uploadedURL => {
          console.log('CCS: Profile image stored. Linking URL... (', uploadedURL, ')')
          return this.apollo.mutate({
            mutation: GQL_UPDATE_USER,
            variables: {
              USER: this._currentUsername,
              profile_img: uploadedURL,
            }
          }).pipe(map(response => response.data["updateUser"]));
        }
      ));

  }

  public addChat(targetUsername: string): Observable<any> {
    // Adds the chat between the currentUser and the User with the provided targetUsername

    return this.apollo.mutate({
      mutation: GQL_ADD_CHAT,
      variables: {
        USER: this._currentUsername,
        otherUser: targetUsername,
      }
    }).pipe(map(response => response.data["addChat"]));

  }

  public chatExists(targetUsername): boolean {
    // Returns true only if a chat with the given username already exists.

    let founded = false;
    this._chats.forEach(chat => {
      if(chat.user1 == targetUsername || chat.user2 == targetUsername){
        founded = true;
      }
    });
    return founded;
  }

  public setChat(targetUsername: string){
    // Sets as current chat the one with the user with the given username

    this.targetUsernameSource.next(targetUsername);

    const newTargetUserData = this._chatsUsersInfo.find(user => user.username === targetUsername);
    this.targetUserDataSource.next(newTargetUserData);

    // subscribing to the messages of the current chat and to the target user last access
    if (this.chatMessagesSubscription){
      this.chatMessagesSubscription.unsubscribe();
    }
    if (this.targetUserLastAccessSubscription){
      this.targetUserLastAccessSubscription.unsubscribe();
    }
    this.chatMessagesSubscription = this.subscribeToChatMessages();
    this.targetUserLastAccessSubscription = this.subscribeToTargetUserLastAccess();
    console.log("CCS: setted current chat (", this._currentUsername, "->", this._targetUsername, ")");

  }

  public init(currentUsername: string) {
    // Initializes the service setting as current user the one with the given username

    if(currentUsername == this._currentUsername)
      return;

    this.isLoadingSource.next(true);

    this.currentUsernameSource.next(currentUsername);

    // checking if the current user exists.
    this.getUser(currentUsername).subscribe(result => {
      this.isLoadingSource.next(false);
      if (!result){
        // if not, create a new user with the given username and name
        console.log("CCS: user first login. Created profile.");
        this.addUser(currentUsername).subscribe(response => {
          this.isLoadingSource.next(false);
          console.log("CCS: user added");
          window.location.reload();
        },(error) => {
          this.isLoadingSource.next(false);
          console.log('CCS: ERROR while adding user', error);
          window.location.reload();
        });
      }else{
        // subscribing to chats of the current user
        this.subscribeToChats();
        this.subscribeToCurrentUserData();
        // updating last access of current user once every 10s
        this.updateCurrentUserLastAccess().subscribe(response => {
          console.log("CCS: current user last access updated");
        },(error) => {
          console.log('CCS: ERROR while updating last access of the current user', error);
        });
        interval(10000).subscribe(() =>
          this.updateCurrentUserLastAccess().subscribe(response => {
            console.log("CCS: current user last access updated");
          },(error) => {
            console.log('CCS: ERROR while updating last access of the current user', error);
          })
        );
        console.log("CCS: setted current user (", this._currentUsername, ")");
      }
    });

  }

}

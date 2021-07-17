import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import gql from 'graphql-tag';
import {BehaviorSubject, forkJoin, interval, ReplaySubject, Subject, Subscription} from 'rxjs';
import { ChatNotificationsService } from './chat-notifications.service';
import {filter, first, last, map, switchMap} from 'rxjs/operators';
import { Observable } from 'rxjs';
import { AngularFireStorage } from '@angular/fire/storage';
import { concatMap } from 'rxjs/operators';

const GQL_GET_MESSAGES = gql`
  query getMessages($currentUser: String!, $targetUser: String!) {
    getMessages(usernames: {username1: $currentUser, username2: $targetUser}) {
      id
      text
      type
      timestamp
      files {
        title
        url
        type
      }
      quoteMessageId
      sender_username
      receiver_username
      readed_from_receiver
    }
  }
`;
const GQL_MESSAGE_ADDED = gql`
  subscription messageAdded($targetUser: String!) {
    messageAdded(username: $targetUser) {
      id
      text
      type
      timestamp
      files {
        title
        url
        type
      }
      quoteMessageId
      sender_username
      receiver_username
      readed_from_receiver
    }
  }
`;
const GQL_MESSAGE_CHANGED = gql`
  subscription messageChanged($targetUser: String!) {
    messageChanged(username: $targetUser) {
      id
      text
      type
      timestamp
      files {
        title
        url
        type
      }
      quoteMessageId
      sender_username
      receiver_username
      readed_from_receiver
    }
  }
`;
const GQL_MESSAGE_DELETED = gql`
  subscription messageDeleted($targetUser: String!) {
    messageDeleted(username: $targetUser) {
      id
      text
      type
      timestamp
      files {
        title
        url
        type
      }
      quoteMessageId
      sender_username
      receiver_username
      readed_from_receiver
    }
  }
`;
const GQL_ADD_MESSAGE = gql`
  mutation addMessages($message: MessageInput!) {
    addMessages(messages: [$message]) {
      log
      message
      {
        id
        text
        type
        timestamp
        files {
          title
          url
          type
        }
        quoteMessageId
        sender_username
        receiver_username
        readed_from_receiver
      }
    }
  }
`;
const GQL_UPDATE_MESSAGES = gql`
  mutation updateMessages($messages: [MessageInput!]!) {
    editMessages(messages: $messages) {
      log
      message
      {
        id
        text
        type
        timestamp
        files {
          title
          url
          type
        }
        quoteMessageId
        sender_username
        receiver_username
        readed_from_receiver
      }
    }
  }
`;


const GQL_GET_CHATS = gql`
  query getChats {
    getChats {
      username1
      username2
      hasToRead
      numOfMessagesToRead
    }
  }
`;
const GQL_CHAT_ADDED = gql`
  subscription chatAdded {
    chatAdded {
      username1
      username2
      hasToRead
      numOfMessagesToRead
    }
  }
`;
const GQL_CHAT_CHANGED = gql`
  subscription chatChanged {
    chatChanged {
      username1
      username2
      hasToRead
      numOfMessagesToRead
    }
  }
`;
const GQL_CHAT_DELETED = gql`
  subscription chatDeleted {
    chatDeleted {
      username1
      username2
      hasToRead
      numOfMessagesToRead
    }
  }
`;
const GQL_ADD_CHAT = gql`
  mutation addChats($USER: String!, $otherUser: String!) {
    addChats(chats: [{username1: $USER, username2: $otherUser}]) {
      log
      chat {
        username1
        username2
        hasToRead
        numOfMessagesToRead
      }
    }
  }
`;

const GQL_GET_USER = gql`
  query getUsers($USER: String!, $accessToAll: Boolean) {
    getUsers(usernames: [$USER], accessToAll: $accessToAll) {
      username
      name
      surname
      bio
      age
      sex
      profile_img
      last_access
    }
  }
`;
const GQL_GET_USERS = gql`
  query getUsers {
    getUsers {
      username
      name
      surname
      bio
      age
      sex
      profile_img
      last_access
    }
  }
`;
const GQL_USER_ADDED = gql`
  subscription userAdded {
    userAdded {
      username
      name
      surname
      bio
      age
      sex
      profile_img
      last_access
    }
  }
`;
const GQL_USER_CHANGED = gql`
  subscription userChanged {
    userChanged {
      username
      name
      surname
      bio
      age
      sex
      profile_img
      last_access
    }
  }
`;
const GQL_USER_DELETED = gql`
  subscription userDeleted {
    userDeleted {
      username
      name
      surname
      bio
      age
      sex
      profile_img
      last_access
    }
  }
`;
const GQL_ADD_USER = gql`
  mutation addUser($USER: String!, $name: String!, $lastAccess: Timestamp!,
    $surname: String!, $bio: String, $sex: Sex, $age: Int, $profile_img: String) {
    addUsers(users: [{username: $USER, name: $name, last_access: $lastAccess,
      surname: $surname, bio: $bio, sex: $sex, age: $age, profile_img: $profile_img}]) {
      log
      user {
        username
        name
        surname
        sex
        last_access
        profile_img
        bio
      }
    }
  }
`;
const GQL_UPDATE_USER = gql`
  mutation updateUsers($USER: String!, $name: String, $lastAccess: Timestamp,
    $surname: String, $bio: String, $sex: Sex, $age: Int, $profile_img: String) {
    editUsers(users: [{username: $USER, name: $name, last_access: $lastAccess,
      surname: $surname, bio: $bio, sex: $sex, age: $age, profile_img: $profile_img}]) {
      log
      user {
        username
        name
        surname
        sex
        last_access
        profile_img
        bio
      }
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
      profile_img
    }
  }
`;



@Injectable({
  providedIn: 'root'
})
export class ChatCoreService {

  private currentUsernameSource = new BehaviorSubject<string>(null);
  private targetUsernameSource = new BehaviorSubject<string>(null);
  private targetUserDataSource = new BehaviorSubject<any>(null);
  private loadedMessagesSource = new BehaviorSubject<any[]>([]);
  //private chatsSource = new BehaviorSubject<any[]>([]);
  private chatsUsersInfoSource = new BehaviorSubject<any[]>([]);
  private targetUserlastAccessSource = new BehaviorSubject<Date>(null);
  private currentUserDataSource = new BehaviorSubject<any>(null);
  private isLoadingSource = new BehaviorSubject<boolean>(null);

  private _currentUsername: string;
  private _targetUsername: string;
  private _messages: any[] = [];
  private _chats: any[] = [];
  private _users: any[] = [];
  private _targetUserlastAccess: Date;
  private _currentUserData: any;
  private _isLoading: boolean;
  private _targetUserData: any;

  private chatUsersInfoSubscription: Subscription = null;
  private chatMessagesSubscription: Subscription = null;
  private targetUserLastAccessSubscription: Subscription = null;
  private _targetUsernameSubscription: Subscription = null;


  private usersSource = new BehaviorSubject<any>(null);
  private userAddedSource = new Subject<any>();
  private userChangedSource = new Subject<any>();
  private userDeletedSource = new Subject<any>();

  private chatsSource =  new BehaviorSubject<any>(null);
  private chatAddedSource = new Subject<any>();
  private chatChangedSource = new Subject<any>();
  private chatDeletedSource = new Subject<any>();

  private messagesSource = new Subject<any>();
  private messageAddedSource = new Subject<any>();
  private messageChangedSource = new Subject<any>();
  private messageDeletedSource = new Subject<any>();

  public getUsers = this.usersSource.asObservable().pipe(filter(v => v !== null));
  public userAdded = this.userAddedSource.asObservable();
  public userChanged = this.userChangedSource.asObservable();
  public userDeleted = this.userDeletedSource.asObservable();

  public getChats = this.chatsSource.asObservable().pipe(filter(v => v !== null));
  public chatAdded = this.chatAddedSource.asObservable();
  public chatChanged = this.chatChangedSource.asObservable();
  public chatDeleted = this.chatDeletedSource.asObservable();

  public getMessages = this.messagesSource.asObservable()
  public messageAdded = this.messageAddedSource.asObservable();
  public messageChanged = this.messageChangedSource.asObservable();
  public messageDeleted = this.messageDeletedSource.asObservable();

  private _messageAddedSub: Subscription;
  private _messageChangedSub: Subscription;
  private _messageDeletedSub: Subscription;

  private _chatAddedSub: Subscription;
  private _chatChangedSub: Subscription;
  private _chatDeletedSub: Subscription;

  private _userAddedSub: Subscription;
  private _userChangedSub: Subscription;
  private _userDeletedSub: Subscription;

  //////////////////////////// PUBLIC ATTRIBUTES ////////////////////////////

  public currentUsernameObservable = this.currentUsernameSource.asObservable().pipe(filter(v => v !== null));
  public targetUsernameObservable = this.targetUsernameSource.asObservable().pipe(filter(v => v !== null));
  public targetUserDataObservable = this.targetUserDataSource.asObservable();
  public loadedMessagesObservable = this.loadedMessagesSource.asObservable();
  //public chatsObservable = this.chatsSource.asObservable();
  public chatsUsersInfoObservable = this.chatsUsersInfoSource.asObservable();
  public targetUserlastAccessObservable = this.targetUserlastAccessSource.asObservable();
  public currentUserDataObservable = this.currentUserDataSource.asObservable();
  public isLoadingObservable = this.isLoadingSource.asObservable();

  constructor(private apollo: Apollo, public chatNotificationsService: ChatNotificationsService,
              private afStorage: AngularFireStorage) {

    this.messageAdded.subscribe(msg => {
      this._messages.push(msg);
      this.messagesSource.next(this._messages);
    });
    this.messageChanged.subscribe(msg => {
      const index = this._messages.findIndex(m => m.timestamp === msg.timestamp);
      this._messages[index] = msg;
      this.messagesSource.next(this._messages);
    });
    this.messageDeleted.subscribe(msg => {
      this._messages.splice(this._messages.findIndex(m => m.timestamp === msg.timestamp), 1);
      this.messagesSource.next(this._messages);
    });

    this.getChats.pipe(first()).subscribe(chats => this._chats.push(...chats));
    this.chatAdded.subscribe(chat => {
      this._chats.push(chat);
      this.chatsSource.next(this._chats);
    });
    this.chatChanged.subscribe(chat => {
      const index = this._chats.findIndex(c => (c.username1 === chat.username1 && c.username2 === chat.username2));
      this._chats[index] = chat;
      this.chatsSource.next(this._chats);
    });
    this.chatDeleted.subscribe(chat => {
      this._chats.splice(this._chats.findIndex(c => (c.username1 === chat.username1 && c.username2 === chat.username2)), 1);
      this.chatsSource.next(this._chats);
    });

    this.getUsers.pipe(first()).subscribe(users => this._users.push(...users));
    this.userAdded.subscribe(user => {
      this._users.push(user);
      this.usersSource.next(this._users);
    });
    this.userChanged.subscribe(user => {
      const index = this._users.findIndex(u => u.username === user.username)
      this._users[index] = user;
      this.usersSource.next(this._users);
    });
    this.userDeleted.subscribe(user => {
      this._users.splice(this._messages.findIndex(u => u.username === user.username), 1);
      this.usersSource.next(this._users);
    });


    this.isLoadingObservable.subscribe(isL => this._isLoading = isL);
    //this.currentUserDataObservable.subscribe(userData => this._currentUserData = userData);
    //this.targetUserlastAccessObservable.subscribe(tula => this._targetUserlastAccess = tula);
    console.log("CCS: service loaded");
  }


  //////////////////////////// PRIVATE METHODS ////////////////////////////

 /* private subscribeToCurrentChatUsersInfo(chatTargetUsernames: string[]): Subscription {
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
          if(chatsList.length){
            this.chatUsersInfoSubscription = this.subscribeToCurrentChatUsersInfo(chatsList);
            console.log('CCS: subscribed to data of target users', chatsList);
          }
        }
      }
    );

  }
*/

  /*private subscribeToTargetUserLastAccess(): Subscription {
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

  }*/

  //////////////////////////// MESSAGES SUBSCRIBERS ATTRIBUTES ////////////////////////////

  private _getMessages(): Subscription {

    this.isLoadingSource.next(true);

    const messagesQuery = this.apollo
      .watchQuery<any[]>({
        query: GQL_GET_MESSAGES,
        variables: {
          targetUser: this._targetUsername,
          currentUser: this._currentUsername
        },
        fetchPolicy: 'no-cache'
      });

    return messagesQuery.valueChanges.subscribe(
      response =>{
        this.isLoadingSource.next(false);
        this.messagesSource.next(response.data["getMessages"]);
        console.log("CCS: messages received", {'messages': response.data["getMessages"]});
      }
    );

  }

  private _subscribeToMessageAdded(): Subscription {

    const messageAddedSub = this.apollo.subscribe({
      query: GQL_MESSAGE_ADDED,
      variables: {
        targetUser: this._targetUsername
      }
    });

    return messageAddedSub.subscribe(
      response =>{
        if (response.data["messageAdded"])
          this.messageAddedSource.next(response.data["messageAdded"]);
        console.log("CCS: message added", {'message': response.data["messageAdded"]});
      }
    );

  }

  private _subscribeToMessageChanged(): Subscription {

    const messageChangedSub = this.apollo.subscribe({
      query: GQL_MESSAGE_CHANGED,
      variables: {
        targetUser: this._targetUsername
      }
    });

    return messageChangedSub.subscribe(
      response =>{
        if (response.data["messageChanged"])
          this.messageChangedSource.next(response.data["messageChanged"]);
        console.log("CCS: message changed", {'message': response.data["messageChanged"]});
      }
    );

  }

  private _subscribeToMessageDeleted(): Subscription {

    const messageDeletedSub = this.apollo.subscribe({
      query: GQL_MESSAGE_DELETED,
      variables: {
        targetUser: this._targetUsername
      }
    });

    return messageDeletedSub.subscribe(
      response => {
        if (response.data["messageDeleted"])
          this.messageDeletedSource.next(response.data["messageDeleted"]);
        console.log("CCS: message deleted", {'message': response.data["messageDeleted"]});
      }
    );

  }

  private _subscribeToMessages() {
    this._messageAddedSub = this._subscribeToMessageAdded();
    this._messageChangedSub = this._subscribeToMessageChanged();
    this._messageDeletedSub = this._subscribeToMessageDeleted();
  }

  private _unsubscribeToMessages() {
    if (this._messageAddedSub)
      this._messageAddedSub.unsubscribe();
    if (this._messageChangedSub)
      this._messageChangedSub.unsubscribe();
    if (this._messageDeletedSub)
      this._messageDeletedSub.unsubscribe()
  }

  //////////////////////////// CHATS SUBSCRIBERS ATTRIBUTES ////////////////////////////

  private _getChats(): Subscription {

    this.isLoadingSource.next(true);

    const chatsQuery = this.apollo
      .watchQuery<any[]>({
        query: GQL_GET_CHATS,
      });

    return chatsQuery.valueChanges.subscribe(
      response =>{
        this.isLoadingSource.next(false);
        this.chatsSource.next(response.data["getChats"]);
        console.log("CCS: chats received", {'chats': response.data["getChats"]});
      }
    );

  }

  private _subscribeToChatAdded(): Subscription {

    const chatAddedSub = this.apollo.subscribe({
      query: GQL_CHAT_ADDED
    });

    return chatAddedSub.subscribe(
      response =>{
        if (response.data["chatAdded"])
          this.chatAddedSource.next(response.data["chatAdded"]);
        console.log("CCS: chat added", {'chat': response.data["chatAdded"]});
      }
    );

  }

  private _subscribeToChatChanged(): Subscription {

    const chatChangedSub = this.apollo.subscribe({
      query: GQL_CHAT_CHANGED
    });

    return chatChangedSub.subscribe(
      response =>{
        if (response.data["chatChanged"])
          this.chatChangedSource.next(response.data["chatChanged"]);
        console.log("CCS: chat changed", {'chat': response.data["chatChanged"]});
      }
    );

  }

  private _subscribeToChatDeleted(): Subscription {

    const userDeletedSub = this.apollo.subscribe({
      query: GQL_CHAT_DELETED
    });

    return userDeletedSub.subscribe(
      response =>{
        if (response.data["chatDeleted"])
          this.chatDeletedSource.next(response.data["chatDeleted"]);
        console.log("CCS: chat deleted", {'user': response.data["chatDeleted"]});
      }
    );

  }

  private _subscribeToChats() {
    this._chatAddedSub = this._subscribeToChatAdded();
    this._chatChangedSub = this._subscribeToChatChanged();
    this._chatDeletedSub = this._subscribeToChatDeleted();
  }

  private _unsubscribeToChats() {
    if (this._chatAddedSub)
      this._chatAddedSub.unsubscribe();
    if (this._chatChangedSub)
      this._chatChangedSub.unsubscribe();
    if (this._chatDeletedSub)
      this._chatDeletedSub.unsubscribe()
  }

  //////////////////////////// USERS SUBSCRIBERS ATTRIBUTES ////////////////////////////

  private _getUsers(): Subscription {

    this.isLoadingSource.next(true);

    const usersQuery = this.apollo
      .watchQuery<any[]>({
        query: GQL_GET_USERS,
      });

    return usersQuery.valueChanges.subscribe(
      response =>{
        this.isLoadingSource.next(false);
        this.usersSource.next(response.data["getUsers"]);
        console.log("CCS: users received", {'users': response.data["getUsers"]});
      }
    );

  }

  private _subscribeToUserAdded(): Subscription {

    const userAddedSub = this.apollo.subscribe({
      query: GQL_USER_ADDED
    });

    return userAddedSub.subscribe(
      response =>{
        if (response.data["userAdded"])
          this.userAddedSource.next(response.data["userAdded"]);
        console.log("CCS: user added", {'user': response.data["userAdded"]});
      }
    );

  }

  private _subscribeToUserChanged(): Subscription {

    const userChangedSub = this.apollo.subscribe({
      query: GQL_USER_CHANGED
    });

    return userChangedSub.subscribe(
      response =>{
        if (response.data["userChanged"])
          this.userChangedSource.next(response.data["userChanged"]);
        console.log("CCS: user changed", {'user': response.data["userChanged"]});
      }
    );

  }

  private _subscribeToUserDeleted(): Subscription {

    const userDeletedSub = this.apollo.subscribe({
      query: GQL_USER_DELETED
    });

    return userDeletedSub.subscribe(
      response =>{
        if (response.data["userDeleted"])
          this.userDeletedSource.next(response.data["userDeleted"]);
        console.log("CCS: user deleted", {'user': response.data["userDeleted"]});
      }
    );

  }

  public _subscribeToUsers() {
    this._userAddedSub = this._subscribeToUserAdded();
    this._userChangedSub = this._subscribeToUserChanged();
    this._userDeletedSub = this._subscribeToUserDeleted();
  }

  public _unsubscribeToUsers() {
    if (this._userAddedSub)
      this._userAddedSub.unsubscribe();
    if (this._userChangedSub)
      this._userChangedSub.unsubscribe();
    if (this._userDeletedSub)
      this._userDeletedSub.unsubscribe()
  }




  private addUser(username): Observable<any>{
    // Adds an user with the given username

    //this.isLoadingSource.next(true);

    return this.apollo.mutate({
      mutation: GQL_ADD_USER,
      variables: {
        USER: username,
        name: '',
        lastAccess: new Date().getMilliseconds(),
        bio: '',
        surname: '',
        age: 25,
        sex: 'M'
      }
    }).pipe(map(response => response.data['addUsers']));

  }

  private updateCurrentUserLastAccess(): Observable<any>{
    // Updates to now the last access of the current user

    //console.log("CCS: UPDATE");

    return this.apollo.mutate({
      mutation: GQL_UPDATE_USER,
      variables: {
        USER: this._currentUsername,
        lastAccess: new Date().getTime()
      }
    }).pipe(map(response => response.data['editUsers']));

  }


  //////////////////////////// PUBLIC METHODS ////////////////////////////

  /*
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
    }*/

  private getFileStoringObs(file){
    const fileId = Math.trunc(Math.random()*1000000);
    let ref = this.afStorage.ref('chats_files/' + this._currentUsername + '/' + this._targetUsername + '/' + fileId);
    let task = ref.put(file);
    const fileObservable = task.snapshotChanges().pipe(
      last(),  // emit the last element after task.snapshotChanges() completed
      switchMap(() => ref.getDownloadURL())
    ).pipe(map(url => {
      return {
        url: url,
        type: file.type,
        title: file.name
      };//url + '%%%' + file.type + '%%%' + file.name;
    }));
    const progressAndObs = { progressOb: task.percentageChanges(), fileOb: fileObservable };
    return progressAndObs;
  }

  public sendMessage(message: any): { progressObs?: Observable<number>[], sendMessageResponseOb: Observable<any> } {
    // Sends a message to the current target user

    if(message.files.length) {
      let filesURLSArray: String[] = [];
      const storingFilesObsArray = message.files.map(file => this.getFileStoringObs(file));
      const progressObs: Observable<number>[] = storingFilesObsArray.map(x => x.progressOb);
      const fileObs: Observable<any>[] = storingFilesObsArray.map(x => x.fileOb);
      const sendMessageResponseOb = forkJoin(fileObs).pipe(map(obsResults => {
        obsResults.forEach(obsResult => {
          filesURLSArray.push(obsResult);
          console.log('CCS: File stored at URL, type, name', obsResult);
        });
      })).pipe(concatMap(() => {
          console.log('CCS: All files stored. Linking URLs and types...');
          return this.apollo.mutate({
            mutation: GQL_ADD_MESSAGE,
            variables: {
              message: {
                timestamp: message.timestamp,
                type: message.type,
                text: message.text,
                sender_username: this._currentUsername,
                receiver_username: this._targetUsername,
                files: filesURLSArray,
                quoteMessageId: message.quote ? message.quote.id : null
              }
            }
          }).pipe(map(response => response.data["addMessages"]));
        }
      ));
      return { progressObs: progressObs, sendMessageResponseOb: sendMessageResponseOb };
    } else {
      const sendMessageResponseOb = this.apollo.mutate({
        mutation: GQL_ADD_MESSAGE,
        variables: {
          message: {
            timestamp: message.timestamp,
            type: message.type,
            text: message.text,
            sender_username: this._currentUsername,
            receiver_username: this._targetUsername,
            quoteMessageId: message.quote ? message.quote.id : null,
          }
        }
      }).pipe(map(response => response.data["addMessages"]));
      return { sendMessageResponseOb: sendMessageResponseOb }
    }


  }

  public setMessagesAsReaded(messagesToConfirm: any[]): Observable<any> {
    // Updates the readed flag of the messages with the provided messagesId

    return this.apollo.mutate({
      mutation: GQL_UPDATE_MESSAGES,
      variables: {
        messages: messagesToConfirm
      }
    }).pipe(map(response => response.data['editMessages']));

  }

  public getUser(username): Observable<any>{
    // Returns an observable containing an the User with the provided username

    return this.apollo.watchQuery<any[]>({
      query: GQL_GET_USER,
      variables: {
        USER: username,
        accessToAll: true
      }
    }).valueChanges.pipe(map(response => (response.data["getUsers"].length >= 1 ? response.data["getUsers"][0] : null)));

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
    }).pipe(map(response => response.data["editUsers"]));

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
          }).pipe(map(response => response.data["editUsers"]));
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
    }).pipe(map(response => response.data["addChats"]));

  }

  public chatExists(targetUsername): boolean {
    // Returns true only if a chat with the given username already exists.

    let founded = false;
    this._chats.forEach(chat => {
      if(chat.username1 == targetUsername || chat.username2 == targetUsername){
        founded = true;
      }
    });
    return founded;
  }

  public setChat(targetUsername: string){
    // Sets as current chat the one with the user with the given username

    if (this._targetUsername === targetUsername)
      return;

    this._targetUsername = targetUsername;
    this.targetUsernameSource.next(targetUsername);

    this._unsubscribeToMessages();
    this._getMessages();
    this._subscribeToMessages();

    this.getMessages.pipe(first()).subscribe(msgs => {
      this._messages = [];
      this._messages.push(...msgs);
    });

    //const newTargetUserData = this._chatsUsersInfo.find(user => user.username === targetUsername);
    //this.targetUserDataSource.next(newTargetUserData);

    //this.chatMessagesSubscription = this.subscribeToChatMessages();
    //this.targetUserLastAccessSubscription = this.subscribeToTargetUserLastAccess();
    console.log("CCS: setted current chat (", this._currentUsername, "->", this._targetUsername, ")");

  }

  public init(currentUsername: string) {
    // Initializes the service setting as current user the one with the given username

    if(currentUsername == this._currentUsername)
      return;

    this.isLoadingSource.next(true);

    this._currentUsername = currentUsername;
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
        //this.subscribeToChats();
        this._getChats();
        this._subscribeToChats();
        this._getUsers();
        this._subscribeToUsers();
        // updating last access of current user once every 10s
        /*this.updateCurrentUserLastAccess().subscribe(response => {
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
        );*/
        console.log("CCS: setted current user (", this._currentUsername, ")");
      }
    });

  }

}

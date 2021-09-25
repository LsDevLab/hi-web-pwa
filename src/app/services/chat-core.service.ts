import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import gql from 'graphql-tag';
import {BehaviorSubject, forkJoin, from, interval, ReplaySubject, Subject, Subscription} from 'rxjs';
import { ChatNotificationsService } from './chat-notifications.service';
import {filter, first, last, map, switchMap} from 'rxjs/operators';
import { Observable } from 'rxjs';
import { AngularFireStorage } from '@angular/fire/storage';
import { concatMap } from 'rxjs/operators';
import {AngularFireDatabase} from '@angular/fire/database';
import {AngularFirestore} from '@angular/fire/firestore';
import firebase from 'firebase';
import FieldPath = firebase.firestore.FieldPath;

@Injectable({
  providedIn: 'root'
})
export class ChatCoreService {

  private currentUserUIDSource = new BehaviorSubject<string>(null);
  private targetUserUIDSource = new BehaviorSubject<string>(null);
  private currentUsernameSource = new BehaviorSubject<string>(null);
  private targetUsernameSource = new BehaviorSubject<string>(null);
  private targetUserDataSource = new BehaviorSubject<any>(null);
  private loadedMessagesSource = new BehaviorSubject<any[]>([]);
  private chatsUsersInfoSource = new BehaviorSubject<any[]>([]);
  private targetUserlastAccessSource = new BehaviorSubject<Date>(null);
  private currentUserDataSource = new BehaviorSubject<any>(null);
  private isLoadingSource = new BehaviorSubject<boolean>(true);

  private _currentUsername: string;
  private _targetUsername: string;
  private _currentUserUID: string;
  private _targetUserUID: string;
  private _messages: any[] = [];
  private _chats: any[] = [];
  private _users: any[] = [];
  private _isLoading: boolean;

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

  public users = this.usersSource.asObservable().pipe(filter(v => v !== null));
  public userAdded = this.userAddedSource.asObservable();
  public userChanged = this.userChangedSource.asObservable();
  public userDeleted = this.userDeletedSource.asObservable();

  public chats = this.chatsSource.asObservable().pipe(filter(v => v !== null));
  public chatAdded = this.chatAddedSource.asObservable();
  public chatChanged = this.chatChangedSource.asObservable();
  public chatDeleted = this.chatDeletedSource.asObservable();

  public messages = this.messagesSource.asObservable()
  public messageAdded = this.messageAddedSource.asObservable();
  public messageChanged = this.messageChangedSource.asObservable();
  public messageDeleted = this.messageDeletedSource.asObservable();

  private _messagesSub: { sub1: Subscription, sub2: Subscription };
  private _messageAddedSub: { sub1: Subscription, sub2: Subscription };
  private _messageChangedSub: { sub1: Subscription, sub2: Subscription };
  private _messageDeletedSub: { sub1: Subscription, sub2: Subscription };

  private _chatAddedSub: { sub1: Subscription, sub2: Subscription };
  private _chatChangedSub: { sub1: Subscription, sub2: Subscription };
  private _chatDeletedSub: { sub1: Subscription, sub2: Subscription };

  private _usersSub: Subscription;

  //////////////////////////// PUBLIC ATTRIBUTES ////////////////////////////

  public currentUserUIDObservable = this.currentUserUIDSource.asObservable().pipe(filter(v => v !== null));
  public targetUserUIDObservable = this.targetUserUIDSource.asObservable().pipe(filter(v => v !== null));
  public currentUsernameObservable = this.currentUsernameSource.asObservable().pipe(filter(v => v !== null));
  public targetUsernameObservable = this.targetUsernameSource.asObservable().pipe(filter(v => v !== null));
  public targetUserDataObservable = this.targetUserDataSource.asObservable();
  public loadedMessagesObservable = this.loadedMessagesSource.asObservable();
  public targetUserlastAccessObservable = this.targetUserlastAccessSource.asObservable();
  public isLoadingObservable = this.isLoadingSource.asObservable();

  constructor(private apollo: Apollo, public chatNotificationsService: ChatNotificationsService,
              private afs: AngularFirestore, private afStorage: AngularFireStorage) {

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

    this.chatAdded.subscribe(chat => {
      this._chats.push(chat);
      this._subscribeToUsers(this._chats.map(chat => chat.user1_uid === this._currentUserUID ? chat.user2_uid : chat.user1_uid));
      this.chatsSource.next(this._chats);
    });
    this.chatChanged.subscribe(chat => {
      const index = this._chats.findIndex(c => (c.user1_uid === chat.user1_uid && c.user2_uid === chat.user2_uid));
      this._chats[index] = chat;
      this.chatsSource.next(this._chats);
    });
    this.chatDeleted.subscribe(chat => {
      this._chats.splice(this._chats.findIndex(c => (c.user1_uid === chat.user1_uid && c.user2_uid === chat.user2_uid)), 1);
      this.chatsSource.next(this._chats);
      this._subscribeToUsers(this._chats.map(chat => chat.user1_uid === this._currentUserUID ? chat.user2_uid : chat.user1_uid));
    });

    this.users.subscribe(users => this._users.push(...users));

    this.isLoadingObservable.subscribe(isL => this._isLoading = isL);

    console.log("CCS: service loaded");

  }

  //////////////////////////// MESSAGES SUBSCRIBERS ATTRIBUTES ////////////////////////////

  private _subscribeToMessageAdded(): { sub1: Subscription, sub2: Subscription } {

    const callback = response => {
      response.forEach(message => {
        if (message)
          this.messageAddedSource.next(message);
        console.log("CCS: message added", {'message': message});
      });
    };

    const itemRef1 = this.afs.collection('messages', ref => ref
      .where('sender_user_uid', '==', this._currentUserUID)
      .where('receiver_user_uid', '==', this._targetUserUID));
    const sub1 = itemRef1.stateChanges(['added']).pipe(
      map(snapshot => snapshot.filter(mSnapshot => !mSnapshot.payload.doc.metadata.hasPendingWrites)),
      map(snapshot => snapshot.map(mSnapshot => ({ uid: mSnapshot.payload.doc.id, ...mSnapshot.payload.doc.data() as {} })))
    ).subscribe(callback);

    const itemRef2 = this.afs.collection('messages', ref => ref
      .where('sender_user_uid', '==', this._targetUserUID)
      .where('receiver_user_uid', '==', this._currentUserUID));
    const sub2 = itemRef2.stateChanges(['added']).pipe(
      map(snapshot => snapshot.filter(mSnapshot => !mSnapshot.payload.doc.metadata.hasPendingWrites)),
      map(snapshot => snapshot.map(mSnapshot => ({ uid: mSnapshot.payload.doc.id, ...mSnapshot.payload.doc.data() as {} })))
    ).subscribe(callback);

    return { sub1: sub1, sub2: sub2 };

  }

  private _subscribeToMessageChanged(): { sub1: Subscription, sub2: Subscription } {

    const callback = response => {
      response.forEach(message => {
        if (message)
          this.messageChangedSource.next(message);
        console.log("CCS: message changed", {'message': message});
      });
    };

    const itemRef1 = this.afs.collection('messages', ref => ref
      .where('sender_user_uid', '==', this._currentUserUID)
      .where('receiver_user_uid', '==', this._targetUserUID));
    const sub1 = itemRef1.stateChanges(['modified']).pipe(
      map(snapshot => snapshot.filter(mSnapshot => !mSnapshot.payload.doc.metadata.hasPendingWrites)),
      map(snapshot => snapshot.map(mSnapshot => ({ uid: mSnapshot.payload.doc.id, ...mSnapshot.payload.doc.data() as {} })))
    ).subscribe(callback);
    const itemRef2 = this.afs.collection('messages', ref => ref
      .where('sender_user_uid', '==', this._currentUserUID)
      .where('receiver_user_uid', '==', this._targetUserUID));
    const sub2 = itemRef2.stateChanges(['modified']).pipe(
      map(snapshot => snapshot.filter(mSnapshot => !mSnapshot.payload.doc.metadata.hasPendingWrites)),
      map(snapshot => snapshot.map(mSnapshot => ({ uid: mSnapshot.payload.doc.id, ...mSnapshot.payload.doc.data() as {} })))
    ).subscribe(callback);

    return { sub1: sub1, sub2: sub2 };

  }

  private _subscribeToMessageDeleted(): { sub1: Subscription, sub2: Subscription } {

    const callback = response => {
      response.forEach(message => {
        if (message)
          this.messageDeletedSource.next(message);
        console.log("CCS: message deleted", {'message': message});
      });
    };

    const itemRef1 = this.afs.collection('messages', ref => ref
      .where('sender_user_uid', '==', this._currentUserUID)
      .where('receiver_user_uid', '==', this._targetUserUID));
    const sub1 = itemRef1.stateChanges(['removed']).pipe(
      map(snapshot => snapshot.filter(mSnapshot => !mSnapshot.payload.doc.metadata.hasPendingWrites)),
      map(snapshot => snapshot.map(mSnapshot => ({ uid: mSnapshot.payload.doc.id, ...mSnapshot.payload.doc.data() as {} })))
    ).subscribe(callback);

    const itemRef2 = this.afs.collection('messages', ref => ref
      .where('sender_user_uid', '==', this._currentUserUID)
      .where('receiver_user_uid', '==', this._targetUserUID));
    const sub2 = itemRef2.stateChanges(['removed']).pipe(
      map(snapshot => snapshot.filter(mSnapshot => !mSnapshot.payload.doc.metadata.hasPendingWrites)),
      map(snapshot => snapshot.map(mSnapshot => ({ uid: mSnapshot.payload.doc.id, ...mSnapshot.payload.doc.data() as {} })))
    ).subscribe(callback);

    return { sub1: sub1, sub2: sub2 };

  }

  private _subscribeToMessages_all() {
    if (this._messageAddedSub) {
      this._messageAddedSub.sub1.unsubscribe();
      this._messageAddedSub.sub2.unsubscribe();
    }
    if (this._messageChangedSub) {
      this._messageChangedSub.sub1.unsubscribe();
      this._messageChangedSub.sub2.unsubscribe();
    }
    if (this._messageDeletedSub) {
      this._messageDeletedSub.sub1.unsubscribe();
      this._messageDeletedSub.sub2.unsubscribe();
    }
    this._messageAddedSub = this._subscribeToMessageAdded();
    this._messageChangedSub = this._subscribeToMessageChanged();
    this._messageDeletedSub = this._subscribeToMessageDeleted();
  }

  //////////////////////////// CHATS SUBSCRIBERS ATTRIBUTES ////////////////////////////


  private _subscribeToChatAdded(): { sub1: Subscription, sub2: Subscription } {

    const callback = response => {
      response.forEach(chat => {
        if (chat)
          this.chatAddedSource.next(chat);
        console.log("CCS: chat added", {'chat': chat});
      });
    };

    const listRef1 = this.afs.collection('chats', ref => ref
      .where('user1_uid', '==', this._currentUserUID));
    const sub1 = listRef1.stateChanges(['added']).pipe(
      map(snapshot => snapshot.filter(mSnapshot => !mSnapshot.payload.doc.metadata.hasPendingWrites)),
      map(snapshot => snapshot.map(mSnapshot => ({ uid: mSnapshot.payload.doc.id, ...mSnapshot.payload.doc.data() as {} })))
    ).subscribe(callback);

    const listRef2 = this.afs.collection('chats', ref => ref
      .where('user2_uid', '==', this._currentUserUID));
    const sub2 = listRef2.stateChanges(['added']).pipe(
      map(snapshot => snapshot.filter(mSnapshot => !mSnapshot.payload.doc.metadata.hasPendingWrites)),
      map(snapshot => snapshot.map(mSnapshot => ({ uid: mSnapshot.payload.doc.id, ...mSnapshot.payload.doc.data() as {} })))
    ).subscribe(callback);

    return { sub1: sub1, sub2: sub2 };

  }

  private _subscribeToChatChanged(): { sub1: Subscription, sub2: Subscription } {

    const callback = response => {
      response.forEach(chat => {
        if (chat)
          this.chatChangedSource.next(chat);
        console.log("CCS: chat changed", {'chat': chat});
      });
    };

    const listRef1 = this.afs.collection('chats', ref => ref
      .where('user1_uid', '==', this._currentUserUID));
    const sub1 = listRef1.stateChanges(['modified']).pipe(
      map(snapshot => snapshot.filter(mSnapshot => !mSnapshot.payload.doc.metadata.hasPendingWrites)),
      map(snapshot => snapshot.map(mSnapshot => ({ uid: mSnapshot.payload.doc.id, ...mSnapshot.payload.doc.data() as {} })))
    ).subscribe(callback);

    const listRef2 = this.afs.collection('chats', ref => ref
      .where('user2_uid', '==', this._currentUserUID));
    const sub2 = listRef2.stateChanges(['modified']).pipe(
      map(snapshot => snapshot.filter(mSnapshot => !mSnapshot.payload.doc.metadata.hasPendingWrites)),
      map(snapshot => snapshot.map(mSnapshot => ({ uid: mSnapshot.payload.doc.id, ...mSnapshot.payload.doc.data() as {} })))
    ).subscribe(callback);

    return { sub1: sub1, sub2: sub2 };

  }

  private _subscribeToChatDeleted(): { sub1: Subscription, sub2: Subscription } {

    const callback = response => {
      response.forEach(chat => {
        if (chat)
          this.chatDeletedSource.next(chat);
        console.log("CCS: chat deleted", {'chat': chat});
      });
    };

    const listRef1 = this.afs.collection('chats', ref => ref
      .where('user1_uid', '==', this._currentUserUID));
    const sub1 = listRef1.stateChanges(['removed']).pipe(
      map(snapshot => snapshot.filter(mSnapshot => !mSnapshot.payload.doc.metadata.hasPendingWrites)),
      map(snapshot => snapshot.map(mSnapshot => ({ uid: mSnapshot.payload.doc.id, ...mSnapshot.payload.doc.data() as {} })))
    ).subscribe(callback);

    const listRef2 = this.afs.collection('chats', ref => ref
      .where('user2_uid', '==', this._currentUserUID));
    const sub2 = listRef2.stateChanges(['removed']).pipe(
      map(snapshot => snapshot.filter(mSnapshot => !mSnapshot.payload.doc.metadata.hasPendingWrites)),
      map(snapshot => snapshot.map(mSnapshot => ({ uid: mSnapshot.payload.doc.id, ...mSnapshot.payload.doc.data() as {} })))
    ).subscribe(callback);

    return { sub1: sub1, sub2: sub2 };

  }

  private _subscribeToChats_all() {
    if (this._chatAddedSub) {
      this._chatAddedSub.sub1.unsubscribe();
      this._chatAddedSub.sub2.unsubscribe();
    }
    if (this._chatChangedSub) {
      this._chatChangedSub.sub1.unsubscribe();
      this._chatChangedSub.sub2.unsubscribe();
    }
    if (this._chatDeletedSub) {
      this._chatDeletedSub.sub1.unsubscribe();
      this._chatDeletedSub.sub2.unsubscribe();
    }
    this._chatAddedSub = this._subscribeToChatAdded();
    this._chatChangedSub = this._subscribeToChatChanged();
    this._chatDeletedSub = this._subscribeToChatDeleted();
  }

  //////////////////////////// USERS SUBSCRIBERS ATTRIBUTES ////////////////////////////

  private _subscribeToUsers(userUids: string[]): Subscription {

    if (this._usersSub)
      this._usersSub.unsubscribe()

    this.isLoadingSource.next(true);

    userUids.push(this._currentUserUID);

    const callback = response =>{
      this.isLoadingSource.next(false);
      this.usersSource.next(response);
      if (response.length !== 0)
        console.log("CCS: users received", {'users': response });
    };

    if (userUids.length !== 0) {
      const listRef = this.afs.collection('users', ref => ref.where(FieldPath.documentId(), 'in', userUids));
      return this._usersSub = listRef.snapshotChanges().pipe(
        map(snapshot => snapshot.filter(mSnapshot => !mSnapshot.payload.doc.metadata.hasPendingWrites)),
        map(snapshot => snapshot.map(mSnapshot => ({ uid: mSnapshot.payload.doc.id, ...mSnapshot.payload.doc.data() as {} })))
      ).subscribe(callback);
    }

  }

  private addUser(username: string, userUID: string): Observable<any>{
    // Adds an user with the given username

    const user = {
      username: username,
      name: 'Name',
      lastAccess: new Date().getTime(),
      bio: 'sample bio',
      surname: 'Surname',
      age: null,
      sex: null,
    };

    const itemsRef = this.afs.collection('users').doc(userUID);
    return from(itemsRef.set(user));

  }

  //////////////////////////// PUBLIC METHODS ////////////////////////////

  private getFileStoringObs(file){
    const fileId = Math.trunc(Math.random()*1000000);
    let ref = this.afStorage.ref('chats_files/' + this._currentUserUID + '/' + this._targetUserUID + '/' + fileId);
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
      let filesArray: any[] = [];
      const storingFilesObsArray = message.files.map(file => this.getFileStoringObs(file));
      const progressObs: Observable<number>[] = storingFilesObsArray.map(x => x.progressOb);
      const fileObs: Observable<any>[] = storingFilesObsArray.map(x => x.fileOb);
      const sendMessageResponseOb = forkJoin(fileObs).pipe(map(obsResults => {
        obsResults.forEach(obsResult => {
          filesArray.push(obsResult);
          console.log('CCS: File stored at URL, type, name', obsResult);
        });
      })).pipe(concatMap(() => {
          console.log('CCS: All files stored. Linking URLs and types...');
          const messageToSend = {
            timestamp: message.timestamp,
            type: message.type,
            text: message.text,
            files: filesArray,
            quote_message_uid : message.quote ? message.quote.id : null,
            sender_user_uid: this._currentUserUID,
            receiver_user_uid: this._targetUserUID
          };
          const itemsRef = this.afs.collection('messages');
          return from(itemsRef.add(messageToSend));
        }
      ));
      return { progressObs: progressObs, sendMessageResponseOb: sendMessageResponseOb };
    } else {
      const messageToSend = {
        timestamp: message.timestamp,
        type: message.type,
        text: message.text,
        quote_message_uid : message.quote ? message.quote.uid : null,
        sender_user_uid: this._currentUserUID,
        receiver_user_uid: this._targetUserUID
      };
      const itemsRef = this.afs.collection('messages');
      const sendMessageResponseOb = from(itemsRef.add(messageToSend));
      return { sendMessageResponseOb: sendMessageResponseOb }
    }


  }

  public setMessageAsReaded(message: any): Observable<any> {
    // Updates the readed flag of the message with the provided messagesId

    const itemsRef = this.afs.collection('messages').doc(message.uid);
    return from(itemsRef.update({ readed: true }));

  }

  public getUser(userUID: string): Observable<any>{
    // Returns an observable containing an the User with the provided UID

    const listRef = this.afs.collection('users').doc(userUID);
    return listRef.snapshotChanges().pipe(
      map(snapshot => {
        const snapshotData = snapshot.payload.data();
        return snapshotData ? { uid: snapshot.payload.id, ...snapshotData as {} } : null ;
      }),
      first()
    );

  }

  public getUserByUsername(username: string): Observable<any>{
    // Returns an observable containing an the User with the provided username

    const listRef = this.afs.collection('users', ref => ref.where('username', '==', username));
    return listRef.snapshotChanges().pipe(
      map(snapshot => {
        return snapshot.length !== 0 ? { uid: snapshot[0].payload.doc.id, ...snapshot[0].payload.doc.data() as {} } : null ;
      }),
      first()
    );

  }

  public updateCurrentUserData(newUserData): Observable<any>{
    // Updates the current user data

    const userData = {
      username: this._currentUsername,
      name: newUserData.name,
      surname: newUserData.surname,
      age: newUserData.age,
      sex: newUserData.sex,
      bio: newUserData.bio,
    }

    const itemsRef = this.afs.collection('users').doc(this._currentUserUID);
    return from(itemsRef.update(userData));

  }

  public updateCurrentUserProfileImage(newUserProfileImage: any): { progressOb: Observable<number>, updateCurrentUserProfileImgOb: Observable<any> } {
    let ref = this.afStorage.ref('profile_images/' + this._currentUserUID);
    let task = ref.put(newUserProfileImage);

    const imageUploadingObs = task.snapshotChanges().pipe(
      last(),  // emit the last element after task.snapshotChanges() completed
      switchMap(() => ref.getDownloadURL())
    ).pipe(concatMap(uploadedURL => {
          console.log('CCS: Profile image stored. Linking URL... (', uploadedURL, ')')

          const itemsRef = this.afs.collection('users/').doc(this._currentUserUID);
          return from(itemsRef.update({'profile_img_url': uploadedURL }));

        }
      ));

    return { progressOb: task.percentageChanges(), updateCurrentUserProfileImgOb: imageUploadingObs };

  }

  public addChat(targetUserUID: string): Observable<any> {
    // Adds the chat between the currentUser and the User with the provided targetUsername

    const chat = {
      createdTimestamp: new Date().getTime(),
      user1_uid: targetUserUID,
      user2_uid: this._currentUserUID
    }

    const itemsRef = this.afs.collection('chats');
    return from(itemsRef.add(chat));

  }

  public chatExists(targetUserUID): boolean {
    // Returns true only if a chat with the given username already exists.

    let founded = false;
    this._chats.forEach(chat => {
      if(chat.user1_uid == targetUserUID || chat.user2_uid == targetUserUID){
        founded = true;
      }
    });
    return founded;
  }

  public setChat(targetUsername: string, targetUserUID: string) {
    // Sets as current chat the one with the user with the given username

    if (this._targetUserUID === targetUserUID)
      return;

    this._targetUserUID = targetUserUID;
    this.targetUserUIDSource.next(targetUserUID);
    this._targetUsername = targetUsername;
    this.targetUsernameSource.next(targetUsername);

    this._subscribeToMessages_all();

    this.messages.pipe(first()).subscribe(msgs => {
      this._messages = [];
      this._messages.push(...msgs);
    });

    console.log("CCS: setted current chat (", this._currentUserUID, "->", this._targetUserUID, ")");

  }

  public init(currentUsername: string, currentUserUID: string) {
    // Initializes the service setting as current user the one with the given username
    if(currentUserUID == this._currentUserUID)
      return;

    this.isLoadingSource.next(true);

    this._currentUserUID = currentUserUID;
    this.currentUserUIDSource.next(currentUserUID);
    this._currentUsername = currentUsername;
    this.currentUsernameSource.next(currentUsername);

    // checking if the current user exists.
    this.getUser(currentUserUID).subscribe(user => {
      if (!user){
        // if not, create a new user with the given username and name
        console.log("CCS: user first login. Created profile.");
        this.addUser(currentUsername, currentUserUID).subscribe(response => {
          console.log("CCS: user added");
          window.location.reload();
        },(error) => {
          console.log('CCS: ERROR while adding user', error);
          window.location.reload();
        });
      }else{
        this.isLoadingSource.next(false);
        // subscribing to chats of the current user
        this._subscribeToChats_all()
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
        console.log("CCS: setted current user", user);
      }
    });

  }

}

import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { BehaviorSubject, forkJoin, from, interval, Subject, Subscription } from 'rxjs';
import { ChatNotificationsService } from './chat-notifications.service';
import { filter, first, last, map, switchMap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { AngularFireStorage } from '@angular/fire/storage';
import { concatMap } from 'rxjs/operators';
import { AngularFirestore } from '@angular/fire/firestore';
import firebase from 'firebase';
import FieldPath = firebase.firestore.FieldPath;
import {Chat, Message, MessageToSend, User} from '../interfaces/dataTypes';

@Injectable({
  providedIn: 'root'
})
export class ChatCoreService {

  //////////////////////////// OBSERVABLES SOURCES ////////////////////////////

  private currentUserUIDSource = new BehaviorSubject<string>(null);
  private targetUserUIDSource = new BehaviorSubject<string>(null);

  private currentUsernameSource = new BehaviorSubject<string>(null);
  private targetUsernameSource = new BehaviorSubject<string>(null);

  private targetUsersSource = new BehaviorSubject<User[]>([]);

  private currentUserSource = new BehaviorSubject<User>(null);

  private chatsSource = new BehaviorSubject<Chat[]>([]);
  private chatsAddedSource = new Subject<Chat[]>();
  private chatsChangedSource = new Subject<Chat[]>();
  private chatsDeletedSource = new Subject<Chat[]>();

  private messagesSource = new BehaviorSubject<Message[]>([]);
  private messagesAddedSource = new Subject<Message[]>();
  private messagesChangedSource = new Subject<Message[]>();
  private messagesDeletedSource = new Subject<Message[]>();

  private isLoadingSource = new BehaviorSubject<boolean>(true);

  //////////////////////////// PRIVATE SUBSCRIPTION VARIABLES ////////////////////////////

  private _messagesAddedSub: Subscription;
  private _messagesChangedSub: Subscription;
  private _messagesDeletedSub: Subscription;

  private _chatsAddedSub: Subscription;
  private _chatsChangedSub: Subscription;
  private _chatsDeletedSub: Subscription;

  private _targetUsersSub: Subscription;
  private _currentUserSub: Subscription;

  //////////////////////////// PRIVATE DATA VARIABLES ////////////////////////////

  private _currentUsername: string;
  private _targetUsername: string;
  private _currentUserUID: string;
  private _targetUserUID: string;
  private _messages: any[] = [];
  private _chats: any[] = [];
  private _targetUsers: any[] = [];
  private _currentUser: any;
  private _isLoading: boolean;

  //////////////////////////// PUBLIC ATTRIBUTES (OBSERVABLES) ////////////////////////////

  public currentUserUIDObservable = this.currentUserUIDSource.asObservable().pipe(filter(v => v !== null));
  public targetUserUIDObservable = this.targetUserUIDSource.asObservable().pipe(filter(v => v !== null));

  public currentUsernameObservable = this.currentUsernameSource.asObservable().pipe(filter(v => v !== null));
  public targetUsernameObservable = this.targetUsernameSource.asObservable().pipe(filter(v => v !== null));

  public currentUser = this.currentUserSource.asObservable().pipe(filter(v => v !== null));
  public targetUsers = this.targetUsersSource.asObservable().pipe(filter(v => v !== null));

  public chats = this.chatsSource.asObservable().pipe(filter(v => v !== null));
  public chatsAdded = this.chatsAddedSource.asObservable();
  public chatsChanged = this.chatsChangedSource.asObservable();
  public chatsDeleted = this.chatsDeletedSource.asObservable();

  public messages = this.messagesSource.asObservable().pipe(filter(v => v !== null));
  public messagesAdded = this.messagesAddedSource.asObservable();
  public messagesChanged = this.messagesChangedSource.asObservable();
  public messagesDeleted = this.messagesDeletedSource.asObservable();

  public isLoadingObservable = this.isLoadingSource.asObservable();

  //////////////////////////// PUBLIC ATTRIBUTES ////////////////////////////

  constructor(private apollo: Apollo, public chatNotificationsService: ChatNotificationsService,
              private afs: AngularFirestore, private afStorage: AngularFireStorage) {

    this.messagesAdded.subscribe(msgs => {
      this._messages.push(...msgs);
      this.messagesSource.next(this._messages);
    });
    this.messagesChanged.subscribe(msgs => {
      msgs.forEach(msg => {
        const index = this._messages.findIndex(m => m.uid === msg.uid);
        this._messages[index] = msg;
      });
      this.messagesSource.next(this._messages);
    });
    this.messagesDeleted.subscribe(msgs => {
      msgs.forEach(msg => {
        this._messages.splice(this._messages.findIndex(m => m.uid === msg.uid), 1);
      });
      this.messagesSource.next(this._messages);
    });

    this.chatsAdded.subscribe(chats => {
      chats.forEach(chat => {
        this._chats.push(chat);
      });
      this._targetUsersSub = this._subscribeToTargetUsers(this._chats.map(chat => chat.users_uids.find(uid => uid !== this._currentUserUID)));
      this.chatsSource.next(this._chats);
    });
    this.chatsChanged.subscribe(chats => {
      chats.forEach(chat => {
        const index = this._chats.findIndex(c => chat.uid === c.uid);
        if (index !== -1)
          this._chats[index] = chat;
        else
          this._chats.push(chat);
      });
      this.chatsSource.next(this._chats);
      this._targetUsersSub = this._subscribeToTargetUsers(this._chats.map(chat => chat.users_uids.find(uid => uid !== this._currentUserUID)));
    });
    this.chatsDeleted.subscribe(chats => {
      chats.forEach(chat => {
        this._chats.splice(this._chats.findIndex(c => chat.uid === c.uid), 1);
      });
      this.chatsSource.next(this._chats);
      this._targetUsersSub = this._subscribeToTargetUsers(this._chats.map(chat => chat.users_uids.find(uid => uid !== this._currentUserUID)));
    });

    this.targetUsers.subscribe(users => this._targetUsers.push(...users));

    this.currentUser.subscribe(user => this._currentUser = user);

    this.isLoadingObservable.subscribe(isL => this._isLoading = isL);

    console.log("CCS: service loaded");

  }

  //////////////////////////// PRIVATE MESSAGES SUBSCRIBERS ATTRIBUTES ////////////////////////////

  private _subscribeToMessagesAdded(): Subscription {

    const callback = messages => {
      this.messagesAddedSource.next(messages);
      console.log('CCS: messages added', {'messages': messages});
    };

    const appSettings = JSON.parse(localStorage.getItem('appSettings'));

    const itemRef = this.afs.collection('messages', ref => ref
      .where('users_uids', 'in', [[this._currentUserUID, this._targetUserUID], [this._targetUserUID, this._currentUserUID]])
      .orderBy('timestamp', 'desc')
      .limit(appSettings.maxNumOfChatMessages));
    const sub = itemRef.stateChanges(['added']).pipe(
      map(snapshot => snapshot.filter(mSnapshot => !mSnapshot.payload.doc.metadata.hasPendingWrites && !mSnapshot.payload.doc.metadata.fromCache)),
      map(snapshot => snapshot.map(mSnapshot => ({ uid: mSnapshot.payload.doc.id, ...mSnapshot.payload.doc.data() as {} })))
    ).subscribe(callback);

    return sub;

  }

  private _subscribeToMessagesChanged(): Subscription {

    const callback = messages => {
      if (messages.length > 0) {
        this.messagesChangedSource.next(messages);
        console.log("CCS: messages changed", {'message': messages});
      }
    };

    const appSettings = JSON.parse(localStorage.getItem('appSettings'));

    const itemRef = this.afs.collection('messages', ref => ref
      .where('users_uids', 'in', [[this._currentUserUID, this._targetUserUID], [this._targetUserUID, this._currentUserUID]])
      .orderBy('timestamp', 'desc')
      .limit(appSettings.maxNumOfChatMessages));
    const sub = itemRef.stateChanges(['modified']).pipe(
      map(snapshot => snapshot.filter(mSnapshot => !mSnapshot.payload.doc.metadata.hasPendingWrites && !mSnapshot.payload.doc.metadata.fromCache)),
      map(snapshot => snapshot.map(mSnapshot => ({ uid: mSnapshot.payload.doc.id, ...mSnapshot.payload.doc.data() as {} })))
    ).subscribe(callback);

    return sub;

  }

  private _subscribeToMessagesDeleted(): Subscription {

    const callback = messages => {
      if (messages.length > 0) {
        this.messagesDeletedSource.next(messages);
        console.log("CCS: messages deleted", {'messages': messages});
      }
    };

    const appSettings = JSON.parse(localStorage.getItem('appSettings'));

    const itemRef = this.afs.collection('messages', ref => ref
      .where('users_uids', 'in', [[this._currentUserUID, this._targetUserUID], [this._targetUserUID, this._currentUserUID]])
      .orderBy('timestamp', 'desc')
      .limit(appSettings.maxNumOfChatMessages));
    const sub = itemRef.stateChanges(['removed']).pipe(
      map(snapshot => snapshot.filter(mSnapshot => !mSnapshot.payload.doc.metadata.hasPendingWrites && !mSnapshot.payload.doc.metadata.fromCache)),
      map(snapshot => snapshot.map(mSnapshot => ({ uid: mSnapshot.payload.doc.id, ...mSnapshot.payload.doc.data() as {} })))
    ).subscribe(callback);

    return sub;

  }

  private _subscribeToMessages_all() {
    if (this._messagesAddedSub) {
      this._messagesAddedSub.unsubscribe();
    }
    if (this._messagesChangedSub) {
      this._messagesChangedSub.unsubscribe();
    }
    if (this._messagesDeletedSub) {
      this._messagesDeletedSub.unsubscribe();
    }
    this._messagesAddedSub = this._subscribeToMessagesAdded();
    this._messagesChangedSub = this._subscribeToMessagesChanged();
    this._messagesDeletedSub = this._subscribeToMessagesDeleted();
  }

  //////////////////////////// PRIVATE CHATS SUBSCRIBERS ATTRIBUTES ////////////////////////////

  private _subscribeToChatsAdded(): Subscription {

    const callback = chats => {
      this.chatsAddedSource.next(chats);
      console.log('CCS: chats added', {'chats': chats});
    };

    const listRef = this.afs.collection('chats', ref => ref
      .where('users_uids', 'array-contains', this._currentUserUID));
    const sub = listRef.stateChanges(['added']).pipe(
      map(snapshot => snapshot.filter(mSnapshot => !mSnapshot.payload.doc.metadata.hasPendingWrites && !mSnapshot.payload.doc.metadata.fromCache)),
      map(snapshot => snapshot.map(mSnapshot => ({ uid: mSnapshot.payload.doc.id, ...mSnapshot.payload.doc.data() as {} })))
    ).subscribe(callback);

    return sub;

  }

  private _subscribeToChatsChanged(): Subscription {

    const callback = chats => {
      if (chats.length > 0) {
        this.chatsChangedSource.next(chats);
        console.log("CCS: chats changed", {'chats': chats});
      }
    };

    const listRef = this.afs.collection('chats', ref => ref
      .where('users_uids', 'array-contains', this._currentUserUID));
    const sub = listRef.stateChanges(['modified']).pipe(
      map(snapshot => snapshot.filter(mSnapshot => !mSnapshot.payload.doc.metadata.hasPendingWrites && !mSnapshot.payload.doc.metadata.fromCache)),
      map(snapshot => snapshot.map(mSnapshot => ({ uid: mSnapshot.payload.doc.id, ...mSnapshot.payload.doc.data() as {} })))
    ).subscribe(callback);

    return sub;

  }

  private _subscribeToChatsDeleted(): Subscription {

    const callback = chats => {
      if (chats.length > 0) {
        this.chatsDeletedSource.next(chats);
        console.log("CCS: chats deleted", {'chats': chats});
      }
    };

    const listRef = this.afs.collection('chats', ref => ref
      .where('users_uids', 'array-contains', this._currentUserUID));
    const sub = listRef.stateChanges(['removed']).pipe(
      map(snapshot => snapshot.filter(mSnapshot => !mSnapshot.payload.doc.metadata.hasPendingWrites && !mSnapshot.payload.doc.metadata.fromCache)),
      map(snapshot => snapshot.map(mSnapshot => ({ uid: mSnapshot.payload.doc.id, ...mSnapshot.payload.doc.data() as {} })))
    ).subscribe(callback);

    return sub;

  }

  private _subscribeToChats_all() {
    if (this._chatsAddedSub) {
      this._chatsAddedSub.unsubscribe();
    }
    if (this._chatsChangedSub) {
      this._chatsChangedSub.unsubscribe();
    }
    if (this._chatsDeletedSub) {
      this._chatsDeletedSub.unsubscribe();
    }
    this._chatsAddedSub = this._subscribeToChatsAdded();
    this._chatsChangedSub = this._subscribeToChatsChanged();
    this._chatsDeletedSub = this._subscribeToChatsDeleted();
  }

  //////////////////////////// PRIVATE USERS SUBSCRIBERS ATTRIBUTES ////////////////////////////

  private _subscribeToTargetUsers(userUids: string[]): Subscription {

    if (this._targetUsersSub)
      this._targetUsersSub.unsubscribe()

    //this.isLoadingSource.next(true);

    const callback = response => {
      //this.isLoadingSource.next(false);
      if (response.length !== 0) {
        this.targetUsersSource.next(response);
        console.log("CCS: target users received", {'users': response });
      }
    };

    if (userUids && userUids.length !== 0) {
      const listRef = this.afs.collection('users', ref => ref.where(FieldPath.documentId(), 'in', userUids));
      return listRef.snapshotChanges().pipe(
        map(snapshot => snapshot.filter(mSnapshot => !mSnapshot.payload.doc.metadata.hasPendingWrites && !mSnapshot.payload.doc.metadata.fromCache)),
        map(snapshot => snapshot.map(mSnapshot => ({uid: mSnapshot.payload.doc.id, ...mSnapshot.payload.doc.data() as {}})))
      ).subscribe(callback);
    }

  }

  private _subscribeToCurrentUser(): Subscription {

    if (this._currentUserSub)
      this._currentUserSub.unsubscribe()

    this.isLoadingSource.next(true);

    const callback = response => {
      this.isLoadingSource.next(false);
      this.isLoadingSource.next(false);
      if (response.length !== 0){
        this.currentUserSource.next(response[0]);
        console.log("CCS: current user received", {'user': response[0] });
      }
    };

    const listRef = this.afs.collection('users', ref => ref.where(FieldPath.documentId(), '==', this._currentUserUID));
    return listRef.snapshotChanges().pipe(
      map(snapshot => snapshot.filter(mSnapshot => !mSnapshot.payload.doc.metadata.hasPendingWrites && !mSnapshot.payload.doc.metadata.fromCache)),
      map(snapshot => snapshot.map(mSnapshot => ({ uid: mSnapshot.payload.doc.id, ...mSnapshot.payload.doc.data() as {} })))
    ).subscribe(callback);

  }

  //////////////////////////// OTHER PRIVATE METHODS ////////////////////////////

  private _getFileStoringObs(file): { progressOb: Observable<number>, fileOb: Observable<any> }{
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

  private _updateCurrentUserLastAccess(): Observable<void> {
    const itemsRef = this.afs.collection('users').doc(this._currentUserUID);
    return from(itemsRef.update({'last_access': new Date().getTime() }));
  }

  private addCurrentUser(username: string, userUID: string): Observable<void> {
    // Adds an user with the given username

    const user = {
      username: username,
      name: 'Name',
      last_access: new Date().getTime(),
      bio: 'sample bio',
      surname: 'Surname',
      age: null,
      sex: null,
    };

    const itemsRef = this.afs.collection('users').doc(userUID);
    return from(itemsRef.set(user));

  }


  //////////////////////////// PUBLIC METHODS ////////////////////////////

  public sendMessage(message: MessageToSend): { progressObs?: Observable<number>[], sendMessageResponseOb: Observable<any> } {
    // Sends a message to the current target user

    console.log(message);

    if(message.files.length) {
      let filesArray: any[] = [];
      const storingFilesObsArray = message.files.map(file => this._getFileStoringObs(file));
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
            quote_message_uid: message.quote_message_uid,
            users_uids: [this._currentUserUID, this._targetUserUID]
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
        quote_message_uid: message.quote_message_uid,
        users_uids: [this._currentUserUID, this._targetUserUID]
      };
      const itemsRef = this.afs.collection('messages');
      const sendMessageResponseOb = from(itemsRef.add(messageToSend));
      return { sendMessageResponseOb: sendMessageResponseOb }
    }


  }

  public setMessageAsReaded(messageUid: string): Observable<void> {
    // Updates the readed flag of the message with the provided messagesId

    const batch = this.afs.firestore.batch()

    const itemsRef = this.afs.collection('messages').doc(messageUid);
    return from(batch.update(itemsRef.ref,{ readed: true }).commit());

  }

  public getUser(userUID: string): Observable<User>{
    // Returns an observable containing an the User with the provided UID

    const listRef = this.afs.collection('users').doc(userUID);
    return listRef.snapshotChanges().pipe(
      map(snapshot => {
        const snapshotData = snapshot.payload.data();
        return snapshotData ? { uid: snapshot.payload.id, ...snapshotData as {} } as User : null ;
      }),
      first()
    );

  }

  public getUserByUsername(username: string): Observable<User>{
    // Returns an observable containing an the User with the provided username

    const listRef = this.afs.collection('users', ref => ref.where('username', '==', username));
    return listRef.snapshotChanges().pipe(
      map(snapshot => {
        return snapshot.length !== 0 ? { uid: snapshot[0].payload.doc.id, ...snapshot[0].payload.doc.data() as {} } as User : null ;
      }),
      first()
    );

  }

  public updateCurrentUserData(newUserData: Partial<User>): Observable<void>{
    // Updates the current user data

    const userData: Partial<User> = {
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

          const itemsRef = this.afs.collection('users').doc(this._currentUserUID);
          return from(itemsRef.update({'profile_img_url': uploadedURL }));

        }
      ));

    return { progressOb: task.percentageChanges(), updateCurrentUserProfileImgOb: imageUploadingObs };

  }

  public addChat(targetUserUID: string): Observable<any> {
    // Adds the chat between the currentUser and the User with the provided targetUsername

    const chat = {
      updated_timestamp: new Date().getTime(),
      users_uids: [this._currentUserUID, targetUserUID],
      last_message_preview: 'No messages yet'
    }

    const itemsRef = this.afs.collection('chats');
    return from(itemsRef.add(chat));

  }

  public chatExists(targetUserUID: string): boolean {
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
        this.addCurrentUser(currentUsername, currentUserUID).subscribe(response => {
          console.log("CCS: user added");
          window.location.reload();
        },(error) => {
          console.log('CCS: ERROR while adding user', error);
          window.location.reload();
        });
      }else{
        this.isLoadingSource.next(false);
        // subscribing to chats of the current user
        //this._subscribeToTargetUsers(null);
        this._currentUserSub = this._subscribeToCurrentUser();
        this._subscribeToChats_all();
        // updating last access of current user once every 10s
        this._updateCurrentUserLastAccess().subscribe(_ => {
          console.log("CCS: current user last access updated");
        },(error) => {
          console.log('CCS: ERROR while updating last access of the current user', error);
        });
        interval(10000).subscribe(() =>
          this._updateCurrentUserLastAccess().subscribe(_ => {
            console.log("CCS: current user last access updated");
          },(error) => {
            console.log('CCS: ERROR while updating last access of the current user', error);
          })
        );
        console.log("CCS: setted current user", user.uid);
      }
    });

  }

}

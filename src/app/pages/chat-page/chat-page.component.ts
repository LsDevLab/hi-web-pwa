import { Component, ElementRef, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { AuthService } from '@auth0/auth0-angular';
import { ChatCoreService } from 'src/app/services/chat-core.service';
import {BreakpointObserver} from '@angular/cdk/layout';
import {NbDialogService, NbRevealCardComponent} from '@nebular/theme';
import {DialogLoadingComponent} from '../../components/dialog-loading/dialog-loading.component';


@Component({
  selector: 'app-chat-page',
  templateUrl: './chat-page.component.html',
  styleUrls: ['./chat-page.component.css']
})
export class ChatPageComponent implements OnInit {

  isFlipped: boolean = false;
  screenIsSmall = false;
  isChatOpened = false;
  isUserSelected = false;
  targetUsername: string;
  targetUserLastAccess: Date;

  //@ViewChild(NbRevealCardComponent, { static: false }) chatCard: NbRevealCardComponent;

  constructor(private breakpointObserver: BreakpointObserver, private chatCoreService: ChatCoreService,
              private dialogService: NbDialogService) { }

  ngOnInit(): void {
    this.breakpointObserver.observe('(max-width: 992px)').subscribe(r => {
      this.screenIsSmall = r.matches;
    });
    //this.chatCoreService.targetUserlastAccessObservable.subscribe(tula => this.targetUserLastAccess = tula);
    //this.chatCoreService.targetUsernameObservable.subscribe(tu => this.targetUsername = tu);
    //this.chatCoreService.currentUsernameObservable.subscribe(c => this.thisUser = c);
    //this.auth.idTokenClaims$.subscribe(t => console.log(t));
    this.chatCoreService.isLoadingObservable.subscribe(isL => {
      if(isL)
        this.dialogService.open(DialogLoadingComponent, { closeOnBackdropClick: false, closeOnEsc: false });
    });
  }

  selectUser(){
    this.isUserSelected = true;
    this.isChatOpened = true;
  }

  openChat(event){
    this.isChatOpened = true;
  }

  closeChat(event){
    this.isChatOpened = false;
  }

  toggleChatMenu(){

  }

  toggleGeneralMenu(){

  }



}

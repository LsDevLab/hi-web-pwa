import { Component, ElementRef, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { AuthService } from '@auth0/auth0-angular';
import { ChatCoreService } from 'src/app/services/chat-core.service';
import {BreakpointObserver} from '@angular/cdk/layout';
import {NbDialogService, NbMenuService, NbRevealCardComponent, NbToastrConfig, NbToastrService} from '@nebular/theme';
import {DialogLoadingComponent} from '../../components/dialog-loading/dialog-loading.component';
import {Subscription} from 'apollo-client/util/Observable';
import {DialogEditProfileComponent} from '../../components/dialog-edit-profile/dialog-edit-profile.component';
import {DialogAboutComponent} from '../../components/dialog-about/dialog-about.component';
import { JwtHelperService } from "@auth0/angular-jwt";
import {DialogTokenExpiredComponent} from '../../components/dialog-token-expired/dialog-token-expired.component';


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
  userContextMenuItems = [
    {
      title: 'Home',
      icon: 'home-outline',
      link: '/home'
    },
    {
      title: 'Chat',
      icon: 'message-square-outline',
      link: '/chat',
    },
    {
      title: 'Edit profile',
      icon: 'person-outline',
    },
    {
      title: 'About...',
      icon: 'info-outline'
    },
  ];

  menuSub: Subscription;

  //@ViewChild(NbRevealCardComponent, { static: false }) chatCard: NbRevealCardComponent;

  constructor(private breakpointObserver: BreakpointObserver, private chatCoreService: ChatCoreService,
              private dialogService: NbDialogService, private nbMenuService: NbMenuService,
              private auth: AuthService, private toastrService: NbToastrService ) { }

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
    this.menuSub = this.nbMenuService.onItemClick().subscribe(menu => {
      if(menu.tag === 'user-context-menu-small') {
        switch (menu.item.title) {
          case 'Edit profile':
            this.dialogService.open(DialogEditProfileComponent);
            break;
          case 'About...':
            this.dialogService.open(DialogAboutComponent);
            break;
        }
      }
    });
    const helper = new JwtHelperService();
    const tokenExpiredInterval = setInterval(() => {
      const isTokenExpired: boolean = helper.isTokenExpired(localStorage.getItem('currentToken'));
      if (!isTokenExpired) {
        this.dialogService.open(DialogTokenExpiredComponent, { closeOnBackdropClick: false, closeOnEsc: false });
        this.toastrService.show("Login into with your account again. Logging out...", "Access expired", new NbToastrConfig({status:"info"}));
        setTimeout(() => this.auth.logout(), 4000);
        clearInterval(tokenExpiredInterval);
      }
    }, 2000);
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

  ngOnDestroy(){
    this.menuSub.unsubscribe();
  }


}

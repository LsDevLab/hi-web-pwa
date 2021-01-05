import { Component, ElementRef, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { AuthService } from '@auth0/auth0-angular';
import { ChatCoreService } from 'src/app/services/chat-core.service';
import {BreakpointObserver} from '@angular/cdk/layout';
import { NbFlipCardComponent } from '@nebular/theme';


@Component({
  selector: 'app-chat-page',
  templateUrl: './chat-page.component.html',
  styleUrls: ['./chat-page.component.css']
})
export class ChatPageComponent implements OnInit {

  isFlipped: boolean = false;
  screenIsSmall = false;
  isSelectedUser = false;

  @ViewChild(NbFlipCardComponent, { static: false }) flipcard: NbFlipCardComponent;

  constructor(private breakpointObserver: BreakpointObserver) { }

  ngOnInit(): void {
    this.breakpointObserver.observe('(max-width: 992px)').subscribe(r => {
      this.screenIsSmall = r.matches;
    });
    //this.chatCoreService.currentUsernameObservable.subscribe(c => this.thisUser = c);
    //this.auth.idTokenClaims$.subscribe(t => console.log(t));
  }

  toggleChat(event){
    this.isSelectedUser = true;
    this.flipcard.toggle();
  }

  toggleChatLarge(event){
    this.isSelectedUser = true;
  }

}

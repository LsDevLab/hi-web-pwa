import { Component, OnInit } from '@angular/core';
import { ChatCoreService } from 'src/app/services/chat-core.service';

@Component({
  selector: 'app-chat-user-info',
  templateUrl: './chat-user-info.component.html',
  styleUrls: ['./chat-user-info.component.css']
})
export class ChatUserInfoComponent implements OnInit {

  targetUserLastAccess: Date;
  targetUsername: string;
  targetUserData: any;

  constructor(private chatCoreService: ChatCoreService) { }

  ngOnInit(): void {
    this.chatCoreService.targetUserlastAccessObservable.subscribe(tula => this.targetUserLastAccess = tula);
    this.chatCoreService.targetUsernameObservable.subscribe(tu => {
      this.targetUsername = tu;
    });
    this.chatCoreService.targetUserDataObservable.subscribe(tud => {
      this.targetUserData = tud;
    });
  }

}

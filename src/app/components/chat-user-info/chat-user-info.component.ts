import { Component, OnInit } from '@angular/core';
import { ChatCoreService } from 'src/app/services/chat-core.service';
import { NbDialogService } from '@nebular/theme';
import { DialogTargetInfoComponent } from '../dialog-target-info/dialog-target-info.component';

@Component({
  selector: 'app-chat-user-info',
  templateUrl: './chat-user-info.component.html',
  styleUrls: ['./chat-user-info.component.css']
})
export class ChatUserInfoComponent implements OnInit {

  targetUserLastAccess: Date;
  targetUsername: string;
  targetUserData: any;

  constructor(private chatCoreService: ChatCoreService, private dialogService: NbDialogService) { }

  ngOnInit(): void {
    this.chatCoreService.targetUserlastAccessObservable.subscribe(tula => this.targetUserLastAccess = tula);
    this.chatCoreService.targetUsernameObservable.subscribe(tu => {
      this.targetUsername = tu;
    });
    this.chatCoreService.targetUserDataObservable.subscribe(tud => {
      this.targetUserData = tud;
    });
  }

  openUserInfoDialog(){
    this.dialogService.open(DialogTargetInfoComponent);
  }

}

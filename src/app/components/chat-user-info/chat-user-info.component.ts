import { Component, OnInit } from '@angular/core';
import { ChatCoreService } from 'src/app/services/chat-core.service';
import { NbDialogService } from '@nebular/theme';
import { DialogTargetInfoComponent } from '../dialog-target-info/dialog-target-info.component';
import {first} from 'rxjs/operators';

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
    this.chatCoreService.targetUsernameObservable.subscribe(targetUsername => {
      this.chatCoreService.getUsers.pipe(first()).subscribe(users => {
        this.targetUserData = users.find(u => u.username === targetUsername);
      });
      this.chatCoreService.userChanged.subscribe(user => {
        if (user.username === targetUsername)
          this.targetUserData = user;
      });
    });
  }

  openUserInfoDialog(){
    this.dialogService.open(DialogTargetInfoComponent);
  }

  getDateFormat() {
    const appSettings = JSON.parse(localStorage.getItem('appSettings'));
    switch (appSettings.dateFormat) {
      case 12:
        return 'short';
        break;
      case 24:
        return 'dd/MM/yyyy, HH:mm';
        break;
    }
  }

}

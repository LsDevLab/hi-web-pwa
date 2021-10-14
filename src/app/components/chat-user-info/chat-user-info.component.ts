import { Component, OnInit } from '@angular/core';
import { ChatCoreService } from 'src/app/services/chat-core.service';
import { NbDialogService } from '@nebular/theme';
import { DialogTargetInfoComponent } from '../dialog-target-info/dialog-target-info.component';
import { ChatUiService } from '../../services/chat-ui.service';

@Component({
  selector: 'app-chat-user-info',
  templateUrl: './chat-user-info.component.html',
  styleUrls: ['./chat-user-info.component.css']
})
export class ChatUserInfoComponent implements OnInit {


  constructor(private chatCoreService: ChatCoreService, private dialogService: NbDialogService,
              public chatUiService: ChatUiService) {
  }

  ngOnInit(): void {
  }

  openUserInfoDialog(){
    this.dialogService.open(DialogTargetInfoComponent);
  }

  getDateFormat() {
    const appSettings = JSON.parse(localStorage.getItem('appSettings'));
    switch (appSettings.dateFormat) {
      case 12:
        return 'short';
      case 24:
        return 'dd/MM/yyyy, HH:mm';
    }
  }

}

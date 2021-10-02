import { Component, OnInit } from '@angular/core';
import { NbDialogRef, NbToastrConfig, NbToastrService } from '@nebular/theme';
import { ChatCoreService } from '../../services/chat-core.service';
import {first} from 'rxjs/operators';
import {ChatUiService} from '../../services/chat-ui.service';

@Component({
  selector: 'app-dialog-target-info',
  templateUrl: './dialog-target-info.component.html',
  styleUrls: ['./dialog-target-info.component.css']
})
export class DialogTargetInfoComponent implements OnInit {

  loadingUserData: boolean = false;
  currentName: string;
  /*userData: any = {
    name: '',
    surname: '',
  };*/

  constructor(protected dialogRef: NbDialogRef<DialogTargetInfoComponent>, private chatCoreService: ChatCoreService,
              public chatUiService: ChatUiService) {
  }

  ngOnInit(): void {
    /*this.chatCoreService.targetUsernameObservable.subscribe(targetUsername => {
      this.chatCoreService.targetUsers.subscribe(users => {
        const userData = users.find(u => u.username === targetUsername);
        this.userData = userData ? userData : this.userData;
      });
    });*/
  }

  closeDialog(){
    this.dialogRef.close();
  }
}

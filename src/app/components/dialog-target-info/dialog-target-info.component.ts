import { Component, OnInit } from '@angular/core';
import { NbDialogRef, NbToastrConfig, NbToastrService } from '@nebular/theme';
import { ChatCoreService } from '../../services/chat-core.service';
import {first} from 'rxjs/operators';

@Component({
  selector: 'app-dialog-target-info',
  templateUrl: './dialog-target-info.component.html',
  styleUrls: ['./dialog-target-info.component.css']
})
export class DialogTargetInfoComponent implements OnInit {

  loadingUserData: boolean = false;
  currentName: string;
  userData: any = {
    name: '',
    surname: '',
  };

  constructor(protected dialogRef: NbDialogRef<DialogTargetInfoComponent>, private chatCoreService: ChatCoreService) {
  }

  ngOnInit(): void {
    this.chatCoreService.targetUsernameObservable.subscribe(targetUsername => {
      console.log('target0', targetUsername);
      this.chatCoreService.users.subscribe(users => {
        console.log('target', users);
        const userData = users.find(u => u.username === targetUsername);
        console.log('target2', userData);
        this.userData = userData ? userData : this.userData;
      });
    });
  }

  closeDialog(){
    this.dialogRef.close();
  }
}

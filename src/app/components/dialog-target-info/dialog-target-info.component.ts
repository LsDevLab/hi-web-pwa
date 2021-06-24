import { Component, OnInit } from '@angular/core';
import { NbDialogRef, NbToastrConfig, NbToastrService } from '@nebular/theme';
import { ChatCoreService } from '../../services/chat-core.service';

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

  constructor(protected dialogRef: NbDialogRef<DialogTargetInfoComponent>, private chatCoreService: ChatCoreService,
              private toastrService: NbToastrService) {
  }

  ngOnInit(): void {
    this.chatCoreService.targetUserDataObservable.subscribe(
      userData => {
        this.userData = userData ? userData : this.userData;
      }
    );
  }

  closeDialog(){
    this.dialogRef.close();
  }
}

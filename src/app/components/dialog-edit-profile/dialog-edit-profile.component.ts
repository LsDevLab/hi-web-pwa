import { Component, Input, OnInit } from '@angular/core';
import { NbDialogRef, NbToastrConfig, NbToastrService } from '@nebular/theme';
import { ChatCoreService } from 'src/app/services/chat-core.service';
import { Subscription } from 'rxjs';
import { ChatUiService } from '../../services/chat-ui.service';
import { User } from '../../interfaces/dataTypes';

@Component({
  selector: 'app-dialog-edit-profile',
  templateUrl: './dialog-edit-profile.component.html',
  styleUrls: ['./dialog-edit-profile.component.css']
})
export class DialogEditProfileComponent implements OnInit {

  loadingUserData = false;

  constructor(protected dialogRef: NbDialogRef<DialogEditProfileComponent>, private chatCoreService: ChatCoreService,
              private toastrService: NbToastrService, public chatUiService: ChatUiService) {
  }

  ngOnInit(): void {
  }

  closeDialog(): void {
    this.dialogRef.close();
  }

  saveEdits(newUserData: Partial<User>): void {
    this.loadingUserData = true;
    this.chatCoreService.updateCurrentUserData(newUserData).subscribe(_ => {
      console.log('DEPC: current user data updated');
      this.toastrService.show('User profile updated', 'Done', new NbToastrConfig({status: 'success'}));
      this.loadingUserData = false;
      this.closeDialog();
    }, (error) => {
      console.log('DEPC: ERROR while updating current user data', error);
      this.toastrService.show('Error while updating user data', 'Error', new NbToastrConfig({status: 'danger'}));
      this.loadingUserData = false;
    });
  }


}

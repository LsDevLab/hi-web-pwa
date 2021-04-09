import { DOCUMENT } from '@angular/common';
import { Component, ElementRef, Inject, Input, OnInit, ViewChild } from '@angular/core';
import { NbDialogRef, NbFormFieldModule, NbGlobalPhysicalPosition, NbInputDirective, NbToastrConfig, NbToastrService } from '@nebular/theme';
import { ChatCoreService } from 'src/app/services/chat-core.service';

@Component({
  selector: 'app-dialog-edit-profile',
  templateUrl: './dialog-edit-profile.component.html',
  styleUrls: ['./dialog-edit-profile.component.css']
})
export class DialogEditProfileComponent implements OnInit {

  loadingUserImg: boolean = false;
  currentName: string;
  userData: any;

  constructor(protected dialogRef: NbDialogRef<DialogEditProfileComponent>, private chatCoreService: ChatCoreService,
              private toastrService: NbToastrService) {
  }

  ngOnInit(): void {
    this.chatCoreService.currentUserDataObservable.subscribe(
      userData => {
        this.userData = userData;
      }
    );
  }

  closeDialog(){
    this.dialogRef.close();
  }

  saveEdits(newUserData){
    this.chatCoreService.updateCurrentUserData(newUserData).subscribe(({ data }) => {
      console.log("USER UPDATED");
      this.closeDialog();
    },(error) => {
      console.log('ERROR UPDATING', error);
      this.toastrService.show("Error while updating user data", "Error", new NbToastrConfig({status:"danger"}));
    });
  }
}

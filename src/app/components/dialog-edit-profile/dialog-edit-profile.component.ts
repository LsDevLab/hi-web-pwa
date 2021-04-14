import { Component, OnInit } from '@angular/core';
import { NbDialogRef, NbToastrConfig, NbToastrService } from '@nebular/theme';
import { ChatCoreService } from 'src/app/services/chat-core.service';

@Component({
  selector: 'app-dialog-edit-profile',
  templateUrl: './dialog-edit-profile.component.html',
  styleUrls: ['./dialog-edit-profile.component.css']
})
export class DialogEditProfileComponent implements OnInit {

  loadingUserData: boolean = false;
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
    this.loadingUserData = true;
    this.chatCoreService.updateCurrentUserData(newUserData).subscribe(response => {
      console.log("USER UPDATED");
      console.log("DEPC: current user data updated", response);
      this.toastrService.show("User profile updated", "Done", new NbToastrConfig({status:"success"}));
      this.loadingUserData = false;
      this.closeDialog();
    },(error) => {
      console.log('DEPC: ERROR while updating current user data', error);
      this.toastrService.show("Error while updating user data", "Error", new NbToastrConfig({status:"danger"}));
      this.loadingUserData = false;
    });
  }

  editProfileImage(event){
    this.loadingUserData = true;
    this.chatCoreService.updateCurrentUserProfileImage(event.target.files[0]).subscribe(result => {
      console.log('DEPC: Profile image correctly updated');
      this.toastrService.show("User profile image updated", "Done", new NbToastrConfig({status:"success"}));
      this.loadingUserData = false;
    }, error => {
      console.log('DEPC: ERROR while updating profile image', error);
      this.toastrService.show("Error while updating profile image", "Error", new NbToastrConfig({status:"danger"}));
      this.loadingUserData = false;
    });
  }
}

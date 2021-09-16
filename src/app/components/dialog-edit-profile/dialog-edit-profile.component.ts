import { Component, OnInit } from '@angular/core';
import { NbDialogRef, NbToastrConfig, NbToastrService } from '@nebular/theme';
import { ChatCoreService } from 'src/app/services/chat-core.service';
import {first} from 'rxjs/operators';

@Component({
  selector: 'app-dialog-edit-profile',
  templateUrl: './dialog-edit-profile.component.html',
  styleUrls: ['./dialog-edit-profile.component.css']
})
export class DialogEditProfileComponent implements OnInit {

  loadingUserData: boolean = false;
  currentName: string;
  userData: any = {
    name: '',
    surname: '',
  };
  imgUploadingPercentage = null;

  constructor(protected dialogRef: NbDialogRef<DialogEditProfileComponent>, private chatCoreService: ChatCoreService,
              private toastrService: NbToastrService) {
  }

  ngOnInit(): void {
    this.chatCoreService.currentUsernameObservable.subscribe(currentUsername => {
      this.chatCoreService.getUsers.pipe(first()).subscribe(users => {
        const userData = users.find(u => u.username === currentUsername);
        this.userData = userData ? userData : this.userData;
      });
      this.chatCoreService.userChanged.subscribe(user => {
        if (user.username === currentUsername)
          this.userData = user;
      });
    });
  }

  closeDialog(){
    this.dialogRef.close();
  }

  saveEdits(newUserData){
    this.loadingUserData = true;
    this.chatCoreService.updateCurrentUserData(newUserData).subscribe(response => {
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
    const updateCurrentUserProfileImageObs = this.chatCoreService.updateCurrentUserProfileImage(event.target.files[0]);
    updateCurrentUserProfileImageObs.updateCurrentUserProfileImgOb.subscribe(result => {
      console.log('DEPC: Profile image updated', result);
      this.toastrService.show("User profile image updated", "Done", new NbToastrConfig({status:"success"}));
      this.loadingUserData = false;
      this.imgUploadingPercentage = 100;
    }, error => {
      console.log('DEPC: ERROR while updating profile image', error);
      this.toastrService.show("Error while updating profile image", "Error", new NbToastrConfig({status:"danger"}));
      this.loadingUserData = false;
      this.imgUploadingPercentage = null;
    });
    if (updateCurrentUserProfileImageObs.progressOb) {
      updateCurrentUserProfileImageObs.progressOb.subscribe(percentage => {
        this.imgUploadingPercentage = percentage < 90 ? percentage : 90;
      });
    }
  }
}

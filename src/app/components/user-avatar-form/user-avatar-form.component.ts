import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { NbToastrConfig } from '../../framework/theme/components/toastr/toastr-config';
import { ChatUiService } from '../../services/chat-ui.service';
import { ChatCoreService } from '../../services/chat-core.service';
import { NbToastrService } from '../../framework/theme/components/toastr/toastr.service';

@Component({
  selector: 'app-user-avatar-form',
  templateUrl: './user-avatar-form.component.html',
  styleUrls: ['./user-avatar-form.component.css']
})
export class UserAvatarFormComponent implements OnInit {

  imgUploadingPercentage = null;
  @Input()
  loadingUserData = false;
  @Output()
  loadingUserDataChange = new EventEmitter<boolean>();

  constructor(public chatUiService: ChatUiService, private chatCoreService: ChatCoreService,
              private toastrService: NbToastrService) { }

  ngOnInit(): void {
  }

  editProfileImage(event): void{
    this.loadingUserData = true;
    this.loadingUserDataChange.next(true);
    const updateCurrentUserProfileImageObs = this.chatCoreService.updateCurrentUserProfileImage(event.target.files[0]);
    updateCurrentUserProfileImageObs.updateCurrentUserProfileImgOb.subscribe(result => {
      console.log('DEPC: Profile image updated', result);
      this.toastrService.show('User profile image updated', 'Done', new NbToastrConfig({status: 'success'}));
      this.loadingUserData = false;
      this.loadingUserDataChange.next(false);
      this.imgUploadingPercentage = 100;
    }, error => {
      console.log('DEPC: ERROR while updating profile image', error);
      this.toastrService.show('Error while updating profile image', 'Error', new NbToastrConfig({status: 'danger'}));
      this.loadingUserData = false;
      this.loadingUserDataChange.next(false);
      this.imgUploadingPercentage = null;
    });
    if (updateCurrentUserProfileImageObs.progressOb) {
      updateCurrentUserProfileImageObs.progressOb.subscribe(percentage => {
        this.imgUploadingPercentage = percentage < 90 ? percentage : 90;
      });
    }
  }

}

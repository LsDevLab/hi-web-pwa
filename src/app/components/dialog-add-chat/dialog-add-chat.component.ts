import { Component, OnInit } from '@angular/core';
import { NbDialogRef, NbToastrConfig, NbToastrService } from '@nebular/theme';
import { ChatCoreService } from 'src/app/services/chat-core.service';
import { ChatUiService } from '../../services/chat-ui.service';

@Component({
  selector: 'app-dialog-add-chat',
  templateUrl: './dialog-add-chat.component.html',
  styleUrls: ['./dialog-add-chat.component.css']
})
export class DialogAddChatComponent implements OnInit {

  userExists: boolean = false;
  username: string;
  name: string;
  surname: string;
  profileImg: string;
  loadingUserImg: boolean = false;

  constructor(protected dialogRef: NbDialogRef<DialogAddChatComponent>, private chatCoreService: ChatCoreService,
              private toastrService: NbToastrService, public chatUiService: ChatUiService) {
  }

  ngOnInit(): void {
  }

  closeDialog(){
    this.dialogRef.close();
  }

  verifyAddChat(username, alsoAdd){
    this.loadingUserImg = true;

    if (username === null){
      username = this.username;
    }

    this.chatCoreService.getUserByUsername(username).subscribe(user => {
      // verifying if the given user exists
      if (user){
        this.userExists = true;
        this.username = user.username;
        this.name = user.name;
        this.surname = user.surname;
        this.profileImg = user.profile_img_url;
        // if alsoAdd is true, addding the chat
        if (alsoAdd){
          // verifying if a chat with the given user already exists
          if (username === this.chatUiService.currentUser.username){
            console.log("DACC: this is your username")
            this.toastrService.show("Can't create a chat with your username", "Error", new NbToastrConfig({status:"danger"}));
            this.userExists = false;
            this.loadingUserImg = false;
            return;
          }
          if (this.chatCoreService.chatExists(user.uid)){
            console.log("DACC: a chat with this user already exists.")
            this.toastrService.show("Chat already exists", "Error", new NbToastrConfig({status:"danger"}));
            this.userExists = false;
            this.loadingUserImg = false;
            return;
          }
          console.log("DACC: adding chat with", this.username);
          this.chatCoreService.addChat(user.uid).subscribe(_ => {
            console.log("DACC: chat with", this.username, "added");
            this.toastrService.show("User added", "Done", new NbToastrConfig({status:"success"}));
            this.dialogRef.close();
          },(error) => {
            console.log('DACC: ERROR while adding chat', error);
            this.toastrService.show("Error while adding chat", "Error", new NbToastrConfig({status:"danger"}));
          });
        }
      }else{
        console.log("DACC: user not exists")
        this.toastrService.show("User not exists", "Error", new NbToastrConfig({status:"danger"}));
        this.userExists = false;
      }
      this.loadingUserImg = false;
    });

  }

}

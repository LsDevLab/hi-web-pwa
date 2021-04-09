import { DOCUMENT } from '@angular/common';
import { Component, ElementRef, Inject, Input, OnInit, ViewChild } from '@angular/core';
import { NbDialogRef, NbFormFieldModule, NbGlobalPhysicalPosition, NbInputDirective, NbToastrConfig, NbToastrService } from '@nebular/theme';
import { ChatCoreService } from 'src/app/services/chat-core.service';

@Component({
  selector: 'app-dialog-add-chat',
  templateUrl: './dialog-add-chat.component.html',
  styleUrls: ['./dialog-add-chat.component.css']
})
export class DialogAddChatComponent implements OnInit {

  userExists: boolean = false;
  username: string;
  name: string;

  loadingUserImg: boolean = false;

  constructor(protected dialogRef: NbDialogRef<DialogAddChatComponent>, private chatCoreService: ChatCoreService,
              private toastrService: NbToastrService) {
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
    // verifying if the given username is the one of the current user
    if (username === this.chatCoreService.currentUsername){
      console.log("DACC: this is your username")
      this.toastrService.show("Can't create a chat with your username", "Error", new NbToastrConfig({status:"danger"}));
      this.userExists = false;
      this.loadingUserImg = false;
      return;
    }

    // verifying if a chat with the given user already exists
    if (this.chatCoreService.chatExists(username)){
      console.log("DACC: a chat with this user already exists.")
      this.toastrService.show("Chat already exists", "Error", new NbToastrConfig({status:"danger"}));
      this.userExists = false;
      this.loadingUserImg = false;
      return;
    }

    this.chatCoreService.getUserData(username).subscribe(r => {
      var result = r.data["getUser"];
      // verifying if the given user exists
      if (result){
        console.log("DACC: user exists and chat not yet")
        this.userExists = true;
        this.username = result.username;
        this.name =result.name;
        // if alsoAdd is true, addding the chat
        if (alsoAdd){
          console.log("DACC: adding chat with", this.username);
          this.chatCoreService.addChat(this.username);
          this.dialogRef.close();
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

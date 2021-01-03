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


  constructor(protected dialogRef: NbDialogRef<DialogAddChatComponent>, private chatCoreService: ChatCoreService,
              private toastrService: NbToastrService) {
  }

  ngOnInit(): void {
    
  }

  closeDialog(){
    this.dialogRef.close();
  }

  verifyAddChat(username, alsoAdd){
    if (username === null){
      username = this.username;
    }
    // verifying if the given username is the one of the current user
    if (username === this.chatCoreService.currentUsername){
      console.log("DACC: this is your username")
      this.toastrService.show("Can't create a chat with your username", "Error", new NbToastrConfig({status:"danger"}));
      this.userExists = false;
      return;
    }
    // if not, verify if the user exists
    this.chatCoreService.userExists(username).subscribe(r => {
      var result = r.data["getUser"];
      if (result){
        // if exists, verify if the chat with him already exists
        this.chatCoreService.chatExists(this.chatCoreService.currentUsername, username).subscribe(r => {
          var resultChat = r.data["queryChats"];
          console.log(resultChat);
          // if the chat not exists yet, taking the name and the username
          if (resultChat.length == 0){
            console.log("DACC: user exists and chat not yet")
            this.userExists = true;
            this.username = result.username;
            this.name =result.name;
            // if the flag alsoAdd is true add the chat eith the given username
            if (alsoAdd){
              console.log("DACC: adding chat with", this.username);
              this.chatCoreService.addChat(this.username);
              this.dialogRef.close();
            }
          }else{
            console.log("DACC: a chat with this user already exists.")
            this.toastrService.show("Chat already exists", "Error", new NbToastrConfig({status:"danger"}));
            this.userExists = false;
          }
        });
      }else{
        console.log("DACC: user not exists")
        this.toastrService.show("User not exists", "Error", new NbToastrConfig({status:"danger"}));
        this.userExists = false;
      }
    });
  }

}

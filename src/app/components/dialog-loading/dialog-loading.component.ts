import { DOCUMENT } from '@angular/common';
import { Component, ElementRef, Inject, Input, OnInit, ViewChild } from '@angular/core';
import { NbDialogRef, NbFormFieldModule, NbGlobalPhysicalPosition, NbInputDirective, NbToastrConfig, NbToastrService } from '@nebular/theme';
import { ChatCoreService } from 'src/app/services/chat-core.service';

@Component({
  selector: 'app-dialog-add-chat',
  templateUrl: './dialog-loading.component.html',
  styleUrls: ['./dialog-loading.component.css']
})
export class DialogLoadingComponent implements OnInit {

  userExists: boolean = false;
  username: string;
  name: string;


  constructor(protected dialogRef: NbDialogRef<DialogLoadingComponent>, private chatCoreService: ChatCoreService) {
  }

  ngOnInit(): void {
    this.chatCoreService.isLoadingObservable.subscribe(isL => {
      if(!isL){
        //setTimeout(() => this.closeDialog(), 2000);
        this.closeDialog();
      }

    });
  }

  closeDialog(){
    this.dialogRef.close();
  }

}

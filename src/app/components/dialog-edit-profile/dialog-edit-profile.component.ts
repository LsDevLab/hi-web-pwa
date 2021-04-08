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

  constructor(protected dialogRef: NbDialogRef<DialogEditProfileComponent>, private chatCoreService: ChatCoreService,) {
  }

  ngOnInit(): void {
  }

  closeDialog(){
    this.dialogRef.close();
  }

  saveEdits(newName){
    //this.chatCoreService.modifyName(newName).subscribe(result)
  }
}

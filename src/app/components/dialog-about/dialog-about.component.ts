import { Component, OnInit } from '@angular/core';
import {NbDialogRef, NbToastrService} from '@nebular/theme';
import {ChatCoreService} from '../../services/chat-core.service';

@Component({
  selector: 'app-dialog-about',
  templateUrl: './dialog-about.component.html',
  styleUrls: ['./dialog-about.component.css']
})
export class DialogAboutComponent implements OnInit {

  constructor(protected dialogRef: NbDialogRef<DialogAboutComponent>) {
  }

  ngOnInit(): void {
  }

  closeDialog(){
    this.dialogRef.close();
  }
}

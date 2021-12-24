import { Component, OnInit } from '@angular/core';
import { NbDialogRef } from '@nebular/theme';
import { ChatUiService } from '../../services/chat-ui.service';

@Component({
  selector: 'app-dialog-target-info',
  templateUrl: './dialog-target-info.component.html',
  styleUrls: ['./dialog-target-info.component.css']
})
export class DialogTargetInfoComponent implements OnInit {

  loadingUserData = false;
  currentName: string;

  constructor(protected dialogRef: NbDialogRef<DialogTargetInfoComponent>, public chatUiService: ChatUiService) {
  }

  ngOnInit(): void {
  }

  closeDialog(): void{
    this.dialogRef.close();
  }
}

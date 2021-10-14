import { Component, OnInit } from '@angular/core';
import { NbDialogRef } from '@nebular/theme';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-dialog-about',
  templateUrl: './dialog-about.component.html',
  styleUrls: ['./dialog-about.component.css']
})
export class DialogAboutComponent implements OnInit {

  appVersion = environment.appVersion;

  constructor(protected dialogRef: NbDialogRef<DialogAboutComponent>) {
  }

  ngOnInit(): void {
  }

  closeDialog(){
    this.dialogRef.close();
  }
}

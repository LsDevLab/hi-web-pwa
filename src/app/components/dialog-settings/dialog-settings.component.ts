import { Component, OnInit } from '@angular/core';
import {NbDialogRef} from '../../framework/theme/components/dialog/dialog-ref';
import {ChatCoreService} from '../../services/chat-core.service';
import {NbToastrService} from '../../framework/theme/components/toastr/toastr.service';
import {NbToastrConfig} from '../../framework/theme/components/toastr/toastr-config';

@Component({
  selector: 'app-dialog-settings',
  templateUrl: './dialog-settings.component.html',
  styleUrls: ['./dialog-settings.component.css']
})
export class DialogSettingsComponent implements OnInit {

  settings;

  constructor(protected dialogRef: NbDialogRef<DialogSettingsComponent>, private chatCoreService: ChatCoreService,
              private toastrService: NbToastrService) {
    const settingsString = localStorage.getItem('appSettings');
    this.settings = JSON.parse(settingsString);
  }

  ngOnInit(): void {
  }

  closeDialog() {
    this.dialogRef.close();
  }

  saveSettings(){
    localStorage.setItem('appSettings', JSON.stringify(this.settings));
    this.toastrService.show("Settings saved. Some changes require to reload the page.", "Done", new NbToastrConfig({status:"success"}));
  }

}

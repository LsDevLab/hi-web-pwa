import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { NbDialogService } from '@nebular/theme';
import { DialogAddChatComponent } from '../dialog-add-chat/dialog-add-chat.component';
import { ChatUiService } from '../../services/chat-ui.service';


@Component({
  selector: 'app-contacts-list',
  templateUrl: './contacts-list.component.html',
  styleUrls: ['./contacts-list.component.css']
})
export class ContactsListComponent implements OnInit {

  size = 'medium';

  @Output()
  selectedUser: EventEmitter<string> = new EventEmitter<string>();

  constructor(private dialogService: NbDialogService, public chatUiService: ChatUiService) {
  }

  ngOnInit(): void {
  }

  openAddChatDialog(): void{
    this.dialogService.open(DialogAddChatComponent);
  }

}

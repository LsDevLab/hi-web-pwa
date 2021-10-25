import { Component } from '@angular/core';
import { ChatUiService } from '../../services/chat-ui.service';
import {UIMessage} from "../../interfaces/dataTypes";

@Component({
  selector: 'app-chat-form',
  templateUrl: './chat-form.component.html',
  styleUrls: ['./chat-form.component.css']
})
export class ChatFormComponent {

  constructor(public chatUiService: ChatUiService) {
  }

  openOptions(message: UIMessage): void {
    console.log('message options opened', message.uid);
  }

}

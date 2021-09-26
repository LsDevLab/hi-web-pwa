import { Component } from '@angular/core';
import {ChatUiService} from '../../services/chat-ui.service';

@Component({
  selector: 'app-chat-form',
  templateUrl: './chat-form.component.html',
  styleUrls: ['./chat-form.component.css']
})
export class ChatFormComponent {

  constructor(public chatUiService: ChatUiService) {

  }

  ngOnInit() {

  }

}

import { Component, OnInit } from '@angular/core';
import { ChatCoreService } from '../../services/chat-core.service';


@Component({
  selector: 'app-header-comp',
  templateUrl: './header-comp.component.html',
  styleUrls: ['./header-comp.component.css']
})
export class HeaderCompComponent implements OnInit {

  thisUser: string;

  constructor(private chatCoreService: ChatCoreService) { }

  ngOnInit(): void {
    this.chatCoreService.currentUsernameObservable.subscribe(c => this.thisUser = c);
  }

  changeLocation(event) {
    this.chatCoreService.setUsers(event, "kamala");
  }
}

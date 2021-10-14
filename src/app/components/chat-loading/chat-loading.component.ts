import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-chat-loading',
  templateUrl: './chat-loading.component.html',
  styleUrls: ['./chat-loading.component.css']
})
export class ChatLoadingComponent implements OnInit {

  @Input()
  loadingValue: number;

  constructor() {
  }

  ngOnInit(): void {
  }

}

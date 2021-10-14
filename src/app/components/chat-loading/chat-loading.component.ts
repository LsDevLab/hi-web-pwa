import { Component, Input, OnInit } from '@angular/core';
import {environment} from '../../../environments/environment';

@Component({
  selector: 'app-chat-loading',
  templateUrl: './chat-loading.component.html',
  styleUrls: ['./chat-loading.component.css']
})
export class ChatLoadingComponent implements OnInit {

  @Input()
  loadingValue: number;

  appVersion = environment.appVersion;
  appName = environment.appName;

  constructor() {
  }

  ngOnInit(): void {
  }

}

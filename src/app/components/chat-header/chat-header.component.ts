import { BreakpointObserver } from '@angular/cdk/layout';
import { DOCUMENT } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { AuthService } from '@auth0/auth0-angular';
import {ChatNotificationsService} from '../../services/chat-notifications.service';
import {NbMenuService} from '@nebular/theme';
import {AngularFireAuth} from '@angular/fire/auth';
import {ChatUiService} from '../../services/chat-ui.service';

@Component({
  selector: 'logged-app-header',
  templateUrl: './chat-header.component.html',
  styleUrls: ['./chat-header.component.css']
})
export class ChatHeaderComponent implements OnInit {



  constructor() {
  }

  ngOnInit(): void {

  }



}

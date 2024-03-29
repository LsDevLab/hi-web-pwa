/**
 * @license
 * Copyright Akveo. All Rights Reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */

import {ChangeDetectionStrategy, Component, EventEmitter, Input, Output} from '@angular/core';
import { NbMenuService } from '../menu/menu.service';

/**
 * Chat message component.
 */
@Component({
  selector: 'nb-chat-message-text',
  template: `
    <div class="message-div">
      <div class="message-options-div"
           [nbContextMenu]="optionsMenuItems"
           [nbContextMenuTag]="message"
           nbContextMenuTrigger="hover"
           nbContextMenuPlacement="top"
           nbContextMenuAdjustment="clockwise">
        <p></p>
      </div>
      <div class="message-body-status-time-div">
        <div class="status-time-div">
        <p class="sender" *ngIf="status">{{ status }}</p>
        <time class="time">{{ date | date: dateFormat }}</time>
      </div>
      <div class="message-body">
        <ng-content></ng-content>
        <p class="text" *ngIf="message">{{ message }}</p>
      </div>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NbChatMessageTextComponent {

  constructor(private menuService: NbMenuService) {
    this.menuService.onItemClick().subscribe(menu => {
      if (menu.tag === this.message) {
        this.optionsSelected.emit(menu.item.title);
      }
    });
  }

  optionsMenuItems  = [
    { title: 'Reply' },
  ];

  @Output() optionsSelected = new EventEmitter<any>();

  /**
   * Message status
   * @type {string}
   */
  @Input() status: string;

  /**
   * Message reply
   * @type {string}
   */
  @Input() reply: string;

  /**
   * Message status
   * @type {string}
   */
  @Input() message: string;

  /**
   * Message send date
   * @type {Date}
   */
  @Input() date: Date;

  /**
   * Message send date format, default 'shortTime'
   * @type {string}
   */
  @Input() dateFormat: string = 'shortTime';

  /**
   * Message isAQuote
   * @type {string}
   */
  @Input() isAQuote: boolean;


}

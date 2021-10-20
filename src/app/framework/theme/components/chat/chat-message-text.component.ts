/**
 * @license
 * Copyright Akveo. All Rights Reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */

import {ChangeDetectionStrategy, Component, EventEmitter, Input, Output} from '@angular/core';

/**
 * Chat message component.
 */
@Component({
  selector: 'nb-chat-message-text',
  template: `
    <div class="message-div">
      <div class="status-time-div">
        <p class="sender" *ngIf="status">{{ status }}</p>
        <time class="time">{{ date | date: dateFormat }}</time>
        <nb-icon class="reply-button" *ngIf="!reply && !isAQuote" icon="corner-up-right-outline" (click)="messageQuoted.emit()"></nb-icon>
      </div>
      <div class="message-body">
        <ng-content></ng-content>
        <p class="text" *ngIf="message">{{ message }}</p>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NbChatMessageTextComponent {

  /**
   * messageQuoted event
   * @type {EventEmitter}
   */
  @Output() messageQuoted = new EventEmitter<any>();

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

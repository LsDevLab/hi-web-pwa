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
  selector: 'nb-chat-message-quote',
  template: `
    <!--<p class="sender" *ngIf="sender || date">{{ sender }} <time>{{ date | date: dateFormat }}</time></p>-->
    <nb-chat-message-text [sender]="sender" [date]="date" [dateFormat]="dateFormat" [message]="message"
                          [reply]="reply" (messageQuoted)="messageQuoted.emit()">
      <!--<div class="quote">
        {{ quote }}
      </div>-->
      <div class="message-div" *ngIf="quote">
        <div class="status-time-div">
          <time class="time">{{ quote.date | date: dateFormat }}</time>
        </div>
        <p class="text-quote" *ngIf="quote">
          {{ quote.text ? quote.text : (quote.files.length > 1 ?
          (quote.files[0].name + ' and other ' + (quote.files.length - 1) + ' files') : quote.files[0].name) }}
        </p>
      </div>
    </nb-chat-message-text>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NbChatMessageQuoteComponent {

  /**
   * messageQuoted event
   * @type {EventEmitter}
   */
  @Output() messageQuoted = new EventEmitter<any>();

  /**
   * Message reply
   * @type {string}
   */
  @Input() reply: string;

  /**
   * Message sender
   * @type {string}
   */
  @Input() message: string;

  /**
   * Message sender
   * @type {string}
   */
  @Input() sender: string;

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
   * Quoted message
   * @type {any}
   */
  @Input() quote: any;

}

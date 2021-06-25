/**
 * @license
 * Copyright Akveo. All Rights Reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */

import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

/**
 * Chat message component.
 */
@Component({
  selector: 'nb-chat-message-quote',
  template: `
    <!--<p class="sender" *ngIf="sender || date">{{ sender }} <time>{{ date | date: dateFormat }}</time></p>-->
    <nb-chat-message-text [sender]="sender" [date]="date" [dateFormat]="dateFormat" [message]="message">
      <!--<div class="quote">
        {{ quote }}
      </div>-->
      <div class="message-div" *ngIf="quote">
        <div class="status-time-div">
          <p class="sender" *ngIf="sender">{{ sender }}</p>
          <time class="time">{{ date | date: 'shortTime' }}</time>
        </div>
        <p class="text-quote" *ngIf="quote">
          {{ quote }}
        </p>
      </div>
    </nb-chat-message-text>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NbChatMessageQuoteComponent {

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
   * @type {Date}
   */
  @Input() quote: string;

}

/**
 * @license
 * Copyright Akveo. All Rights Reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */

import {ChangeDetectionStrategy, Component, EventEmitter, Input, Output} from '@angular/core';
import { NbChatOptions } from './chat.options';

/**
 * Chat message component.
 */
@Component({
  selector: 'nb-chat-message-map',
  template: `
    <nb-chat-message-file [files]="[file]" [message]="message" [status]="status" [date]="date"
     [dateFormat]="dateFormat" [reply]="reply" (messageQuoted)="messageQuoted.emit($event)" (optionsSelected)="optionsSelected.emit()"></nb-chat-message-file>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NbChatMessageMapComponent {

  /**
   * messageQuoted event
   * @type {EventEmitter}
   */
  @Output() messageQuoted = new EventEmitter<any>();

  @Output() optionsSelected = new EventEmitter<any>();

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
   * Message status
   * @type {string}
   */
  @Input() status: string;

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
   * Map latitude
   * @type {number}
   */
  @Input() latitude: number;

  /**
   * Map longitude
   * @type {number}
   */
  @Input() longitude: number;

  get file() {
    return {
      // tslint:disable-next-line:max-line-length
      url: `https://maps.googleapis.com/maps/api/staticmap?center=${this.latitude},${this.longitude}&zoom=12&size=400x400&key=${this.mapKey}`,
      type: 'image/png',
      icon: 'location',
    };
  }

  mapKey: string;

  constructor(options: NbChatOptions) {
    this.mapKey = options.messageGoogleMapKey;
  }
}

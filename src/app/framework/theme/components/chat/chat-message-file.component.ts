/**
 * @license
 * Copyright Akveo. All Rights Reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */

import {ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, Output} from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

export interface NbChatMessageFileIconPreview {
  url: string;
  name: string;
  type: string;
  icon: string;
  uploadingPercentage: number;
}
export interface NbChatMessageFileImagePreview {
  url: string;
  type: string;
  name: string;
  uploadingPercentage: number;
}
export type NbChatMessageFile = NbChatMessageFileIconPreview | NbChatMessageFileImagePreview;

/**
 * Chat message component.
 */
@Component({
  selector: 'nb-chat-message-file',
  template: `
    <nb-chat-message-text [status]="status" [date]="date" [dateFormat]="dateFormat" [reply]="reply"
                          (messageQuoted)="messageQuoted.emit()">
      <ng-container>
        <div class="files-div">
          <a class="file-div" *ngFor="let file of readyFiles" [href]="file.url" target="_blank">
            <div class="not-img-file" *ngIf="!file.urlStyle && file.icon">
              <circle-progress-bar class="file-uploading-progress-bar" *ngIf="reply && file.uploadingPercentage !== undefined && file.uploadingPercentage !== 100"
                [progress]="file.uploadingPercentage"
                [radius]="7"
                [trackWeight]="2"
                [trackColor]="'#36f'"
                [trackEndShape]="'round'"
              ></circle-progress-bar>
              <nb-icon class="file-icon" [icon]="file.icon"></nb-icon>
              <div class="file-info-div">
                <p class="file-name">{{ file.name }}</p>
                <p class="file-type">{{ file.type }}</p>
              </div>
            </div>
            <div class="img-file" *ngIf="file.urlStyle">
              <img class="file-img" [src]="file.imgUrl" [ngStyle]="{'opacity': (reply && file.uploadingPercentage !== undefined && file.uploadingPercentage !== 100) ? 0.5 : 1 }">
              <!--*ngIf="reply && file.uploadingPercentage !== undefined && file.uploadingPercentage !== 100"-->
              <circle-progress-bar class="file-uploading-progress-bar" *ngIf="reply && file.uploadingPercentage !== undefined && file.uploadingPercentage !== 100"
                                   [progress]="file.uploadingPercentage"
                                   [radius]="7"
                                   [trackWeight]="2"
                                   [trackColor]="'#36f'"
                                   [trackEndShape]="'round'"
              ></circle-progress-bar>
            </div>
          </a>
          <p class="text" *ngIf="message">{{ message }}</p>
        </div>
      </ng-container>
    </nb-chat-message-text>



    <!--<ng-container *ngIf="readyFiles?.length === 1">
      <a [href]="readyFiles[0].url" target="_blank">
        <nb-icon [icon]="readyFiles[0].icon" *ngIf="!readyFiles[0].urlStyle && readyFiles[0].icon"></nb-icon>
        <div *ngIf="readyFiles[0].urlStyle" [style.background-image]="readyFiles[0].urlStyle"></div>
      </a>
    </ng-container>-->
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NbChatMessageFileComponent {

  firstTimeAdded = true;

  /**
   * messageQuoted event
   * @type {EventEmitter}
   */
  @Output() messageQuoted = new EventEmitter<any>();

  readyFiles: any[];

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
   * Message file path
   * @type {Date}
   */
  @Input()
  set files(files: NbChatMessageFile[]) {
    this.readyFiles = (files || []).map((file: any, index: any) => {
      const isImage = this.isImage(file);
      return {
        ...file,
        urlStyle: isImage && file.url,
        isImage: isImage,
        imgUrl: (this.firstTimeAdded || !isImage) ? file.url : this.readyFiles[index].url
      };
    });
    this.firstTimeAdded = false;
    this.cd.detectChanges();
  }

  constructor(protected cd: ChangeDetectorRef, protected domSanitizer: DomSanitizer) {
  }


  isImage(file: NbChatMessageFile): boolean {
    const type = (file as NbChatMessageFileImagePreview).type;
    if (type) {
      return [ 'image/png', 'image/jpeg', 'image/gif' ].includes(type);
    }
    return false;
  }
}

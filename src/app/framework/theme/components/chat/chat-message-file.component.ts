/**
 * @license
 * Copyright Akveo. All Rights Reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */

import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

export interface NbChatMessageFileIconPreview {
  url: string;
  icon: string;
}
export interface NbChatMessageFileImagePreview {
  url: string;
  type: string;
}
export type NbChatMessageFile = NbChatMessageFileIconPreview | NbChatMessageFileImagePreview;

/**
 * Chat message component.
 */
@Component({
  selector: 'nb-chat-message-file',
  template: `
    <nb-chat-message-text [sender]="sender" [date]="date" [dateFormat]="dateFormat">
      <ng-container>
        <div class="files-div">
          <a *ngFor="let file of readyFiles" [href]="file.url" target="_blank">
            <div class="not-img-file" *ngIf="!file.urlStyle && file.icon">
              <nb-icon class="file-icon" [icon]="file.icon"></nb-icon>
              <!--<p class="file-name">Nome file</p>-->
              <!--<p class="file-type">Tipo file</p>-->
            </div>
            <div class="img-file" *ngIf="file.urlStyle">
              <img class="file-img" [src]="file.urlStyle">
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

  readyFiles: any[];

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
   * Message file path
   * @type {Date}
   */
  @Input()
  set files(files: NbChatMessageFile[]) {
    this.readyFiles = (files || []).map((file: any) => {
      const isImage = this.isImage(file);
      return {
        ...file,
        urlStyle: isImage && file.url,
        isImage: isImage,
      };
    });
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
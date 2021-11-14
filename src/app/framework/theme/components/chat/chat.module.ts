/**
 * @license
 * Copyright Akveo. All Rights Reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */

import { ModuleWithProviders, NgModule } from '@angular/core';

import { NbSharedModule } from '../shared/shared.module';
import { NbButtonModule } from '../button/button.module';
import { NbInputModule } from '../input/input.module';
import { NbIconModule } from '../icon/icon.module';

import { NbChatComponent } from './chat.component';
import { NbChatMessageComponent } from './chat-message.component';
import { NbChatFormComponent } from './chat-form.component';
import { NbChatMessageTextComponent } from './chat-message-text.component';
import { NbChatMessageFileComponent } from './chat-message-file.component';
import { NbChatMessageQuoteComponent } from './chat-message-quote.component';
import { NbChatMessageMapComponent } from './chat-message-map.component';
import { NbChatOptions } from './chat.options';
import {CircleProgressComponent} from '../../../../components/circle-progress-bar/circle-progress-bar.component';
import {NbContextMenuModule} from '../context-menu/context-menu.module';
import { NbProgressBarModule } from '../progress-bar/progress-bar.module';

const NB_CHAT_COMPONENTS = [
  NbChatComponent,
  NbChatMessageComponent,
  NbChatFormComponent,
  NbChatMessageTextComponent,
  NbChatMessageFileComponent,
  NbChatMessageQuoteComponent,
  NbChatMessageMapComponent
];

@NgModule({
  imports: [
    NbSharedModule,
    NbIconModule,
    NbInputModule,
    NbButtonModule,
    NbContextMenuModule,
    NbProgressBarModule
  ],
  declarations: [
    ...NB_CHAT_COMPONENTS,
  ],
  exports: [
    ...NB_CHAT_COMPONENTS,
  ],
})
export class NbChatModule {

  static forRoot(options?: NbChatOptions): ModuleWithProviders<NbChatModule> {
    return {
      ngModule: NbChatModule,
      providers: [
        { provide: NbChatOptions, useValue: options || {} },
      ],
    };
  }

  static forChild(options?: NbChatOptions): ModuleWithProviders<NbChatModule> {
    return {
      ngModule: NbChatModule,
      providers: [
        { provide: NbChatOptions, useValue: options || {} },
      ],
    };
  }
}

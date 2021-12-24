/**
 * @license
 * Copyright Akveo. All Rights Reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */

import { NgModule } from '@angular/core';

import { NbSharedModule } from '../shared/shared.module';
import { NbProgressBarComponent } from './progress-bar.component';
import { CircleProgressComponent } from '../../../../components/circle-progress-bar/circle-progress-bar.component';

@NgModule({
  imports: [
    NbSharedModule,
  ],
  declarations: [
    NbProgressBarComponent,
    CircleProgressComponent
  ],
  exports: [
    NbProgressBarComponent,
    CircleProgressComponent
  ],
})
export class NbProgressBarModule { }

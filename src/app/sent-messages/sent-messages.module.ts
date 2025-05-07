import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SentMessagesPageRoutingModule } from './sent-messages-routing.module';

import { SentMessagesPage } from './sent-messages.page';
import { TruncatePipe } from '../pipes/truncate.pipe';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SentMessagesPageRoutingModule
  ],
  declarations: [SentMessagesPage, TruncatePipe]
})
export class SentMessagesPageModule {}

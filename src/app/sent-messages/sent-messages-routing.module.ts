import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SentMessagesPage } from './sent-messages.page';

const routes: Routes = [
  {
    path: '',
    component: SentMessagesPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SentMessagesPageRoutingModule {}

import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { CongressionalStaffSearchPage } from './congressionalstaffsearch';

@NgModule({
  declarations: [
    CongressionalStaffSearchPage,
  ],
  imports: [
    IonicPageModule.forChild(CongressionalStaffSearchPage),
  ],
})
export class CongressionalStaffSearchPageModule {}

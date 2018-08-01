import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ProfilePasswordChangePage } from './profilepasswordchange';

@NgModule({
  declarations: [
    ProfilePasswordChangePage,
  ],
  imports: [
    IonicPageModule.forChild(ProfilePasswordChangePage),
  ],
  exports: [
    ProfilePasswordChangePage
  ]
})
export class ProfilePasswordChangePageModule {}

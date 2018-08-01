// Components, functions, plugins
import { FormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { Database } from '../providers/database/database';
import { Localstorage } from '../providers/localstorage/localstorage';

// Pages
import { CongressionalDetailsPage } from './congressionaldetails';

@NgModule({
  declarations: [CongressionalDetailsPage],
  imports: [
	FormsModule,
	IonicPageModule.forChild(CongressionalDetailsPage)
	],
  exports: [CongressionalDetailsPage]

  })

  export class CongressionalDetailsPageModule {}



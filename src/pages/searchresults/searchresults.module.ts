// Components, functions, plugins
import { FormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { Database } from '../providers/database/database';
import { Localstorage } from '../providers/localstorage/localstorage';

// Pages
import { SearchResultsPage } from './searchresults';

@NgModule({
  declarations: [SearchResultsPage],
  imports: [
	FormsModule,
	IonicPageModule.forChild(SearchResultsPage)
	],
  exports: [
    SearchResultsPage
  ]

  })

  export class SearchResultsPageModule {}



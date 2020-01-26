import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DailyFrequencyTilemapComponent } from './components/daily-frequency-tilemap/daily-frequency-tilemap.component';

const routes: Routes = [
  { path: 'data-visualization', component: DailyFrequencyTilemapComponent },
  { path: '',
    redirectTo: '/',
    pathMatch: 'full'
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

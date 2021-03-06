import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ListenComponent } from './listen/listen.component';
import { QuestionComponent } from './question/question.component';
import { SpeechService } from './speech.service';
import { HttpClientModule } from '@angular/common/http';
import { AngularFireModule } from '@angular/fire';
import { AngularFirestoreModule, AngularFirestore } from '@angular/fire/firestore';
import { environment } from '../environments/environment';
import { TimerService } from './services/timer.service';
import { TimerComponent } from './timer/timer.component';
import { DailyFrequencyTilemapComponent } from './components/daily-frequency-tilemap/daily-frequency-tilemap.component';

@NgModule({
  declarations: [
    AppComponent,
    ListenComponent,
    QuestionComponent,
    TimerComponent,
    DailyFrequencyTilemapComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    AngularFireModule.initializeApp(environment.firebase),
    AngularFirestoreModule,
  ],
  providers: [
    SpeechService,
    AngularFirestore,
    TimerService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }

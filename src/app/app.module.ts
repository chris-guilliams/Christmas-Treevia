import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ListenComponent } from './listen/listen.component';
import { QuestionComponent } from './question/question.component';
import { SpeechService } from './speech.service';
import { HttpClientModule } from '@angular/common/http';
import { TimerService } from './services/timer.service';

@NgModule({
  declarations: [
    AppComponent,
    ListenComponent,
    QuestionComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule
  ],
  providers: [
    SpeechService,
    TimerService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }

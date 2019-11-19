// src/app/listen/listen.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { SpeechService } from './../speech.service';
import { Subscription, Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';

@Component({
  selector: 'app-listen',
  templateUrl: './listen.component.html',
  styleUrls: ['./listen.component.scss']
})
export class ListenComponent implements OnInit, OnDestroy {
  nouns: string[];
  verbs: string[];
  adjs: string[];
  commandSub: Subscription;
  errorsSub: Subscription;
  errorMsg: string;

  constructor(public speech: SpeechService) { }

  ngOnInit() {
    this.speech.init();
    this._listenCommand();
    this._listenErrors();
  }

  get btnLabel(): string {
    return this.speech.listening ? 'Playing Game...' : 'Begin Game';
  }

  private _listenCommand() {
    this.commandSub = this.speech.words$.pipe(
      filter(obj => obj.type === 'command'),
      map(commandObj => commandObj.word)
    ).subscribe(
      command => {
        this._setError();
        console.log('command:', command);
      }
    );
  }

  private _listenErrors() {
    this.errorsSub = this.speech.errors$
      .subscribe(err => this._setError(err));
  }

  private _setError(err?: any) {
    if (err) {
      console.log('Speech Recognition:', err);
      this.errorMsg = err.message;
    } else {
      this.errorMsg = null;
    }
  }

  ngOnDestroy() {
    this.commandSub.unsubscribe();
    this.errorsSub.unsubscribe();
  }
}

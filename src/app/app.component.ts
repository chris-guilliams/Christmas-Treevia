import { Component, OnInit, OnDestroy, OnChanges } from '@angular/core';
import { SpeechService } from './speech.service';
import { Subscription, Observable, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Question } from './domain/question';
import { AngularFirestore } from '@angular/fire/firestore';
import { Timestamp } from '@google-cloud/firestore';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy, OnChanges {
  title = 'Christmas-Treevia';
  private p5;
  spokenWords: Subscription;
  recievedAnswers: string[] = [];
  questions: Question[] = [];
  hasLoaded = false;
  timestamps: Observable<any>;

  constructor(public speech: SpeechService, private http: HttpClient, private db: AngularFirestore) {
  }

  ngOnInit() {
    this.db.collection('triviaPlays').valueChanges().subscribe((change: {when: Timestamp}[]) => {
      // console.log('The collection was changed', change);
      this.timestamps = of(change);
      if (this.hasLoaded) {
        this.speech.startGame();
      } else {
        this.hasLoaded = true;
      }
    });
  }

  startGame() {
    this.http.post('https://us-central1-christmas-treevia.cloudfunctions.net/playTrivia', {
      "data": {}
    }).subscribe();
  }

  ngOnChanges() {
  }

  ngOnDestroy(): void {
    
  }
}

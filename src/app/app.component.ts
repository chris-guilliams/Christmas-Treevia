import { Component, OnInit, OnDestroy, OnChanges } from '@angular/core';
import { SpeechService } from './speech.service';
import { Subscription } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Question } from './domain/question';
import { AngularFirestore } from '@angular/fire/firestore';
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

  constructor(public speech: SpeechService, private http: HttpClient, private db: AngularFirestore) {
    db.collection('triviaPlays').valueChanges().subscribe((change) => {
      console.log('The collection was changed', change);
    });
  }

  ngOnInit() {
    
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

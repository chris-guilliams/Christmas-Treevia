// src/app/speech.service.ts
import { Injectable, NgZone } from '@angular/core';
import { Subject } from 'rxjs';
import { Question } from './domain/question';

// TypeScript declaration for annyang
declare var annyang: any;

@Injectable()
export class SpeechService {
  words$ = new Subject<{[key: string]: string}>();
  errors$ = new Subject<{[key: string]: any}>();
  listening = false;
  questions = new Array<Question>();
  currentQuestion = new Question("", "");
  currentQuestionNumber = 0;

  constructor(private zone: NgZone) {
    this.questions.push(new Question("What is more popular during the holidays?", "depression"));
    this.questions.push(new Question("What is the name of the jolly red man?", "santa"));
    this.questions.push(new Question("What should little children leave out for Santa on Christmas Eve?", "milk and cookies"));

    this.words$.subscribe(phrase => {
      console.log(phrase);
      if (phrase.type === 'start') {
        //Welcome to the Modeah Trivia Tree where you put your holiday knowledge to the ultimate test.
        this.speakWithCallback('Beginning Game', () => {
          this.startQuestion(this.questions[this.currentQuestionNumber], this.currentQuestionNumber);
        });
      } else if (phrase.type === 'answer') {
        if (phrase.answer.toLowerCase() === this.currentQuestion.answerString.toLowerCase()) {
          this.speakWithCallback('You got it correct!!', () => {
            this.startQuestion(this.questions[this.currentQuestionNumber], this.currentQuestionNumber);
          });
        } else {
          const msg = new SpeechSynthesisUtterance('The answer is obviously ' + this.currentQuestion.answerString);
          window.speechSynthesis.speak(msg);
        }
      } else if (phrase.type === 'quit') {

      }
    });
  }

  get speechSupported(): boolean {
    return !!annyang;
  }

  init() {
    const commands = {
      'start game': (start) => {
        this.zone.run(() => {
          this.words$.next({type: 'start'});
        });
      },
      'the answer is *answer': (answer) => {
        this.zone.run(() => {
          this.words$.next({type: 'answer', 'answer': answer});
        });
      }
    };
    annyang.addCommands(commands);

    // Log anything the user says and what speech recognition thinks it might be
    annyang.addCallback('result', (userSaid) => {
      console.log('User may have said:', userSaid);
    });
    annyang.addCallback('errorNetwork', (err) => {
      this._handleError('network', 'A network error occurred.', err);
    });
    annyang.addCallback('errorPermissionBlocked', (err) => {
      this._handleError('blocked', 'Browser blocked microphone permissions.', err);
    });
    annyang.addCallback('errorPermissionDenied', (err) => {
      this._handleError('denied', 'User denied microphone permissions.', err);
    });
    annyang.addCallback('resultNoMatch', (userSaid) => {
      this._handleError(
        'no match',
        'Spoken command not recognized. Say "noun [word]", "verb [word]", OR "adjective [word]".',
        { results: userSaid });
    });
  }

  private _handleError(error, msg, errObj) {
    this.zone.run(() => {
      this.errors$.next({
        error: error,
        message: msg,
        obj: errObj
      });
    });
  }

  startQuestion(question: Question, questionNumber: Number) {
    this.currentQuestion = question;
    this.currentQuestionNumber++;

    this.speakWithCallback("Here is Question number " + this.currentQuestionNumber, () => {
      this.speakWithCallback(question.questionString, () => {
        console.log("Question statement ended. Now Listening for answer.");
        annyang.start();
      });
    });
  }

  startListening() {
    annyang.start();
  }

  abort() {
    annyang.abort();
    this.listening = false;
  }

  speakWithCallback(text, callback) {
    let msg = new SpeechSynthesisUtterance(text);

    // msg.onstart = function (event) {
    //     console.log("Question statement started");
    // };

    msg.onend = function (event) {
      callback();
    };

    window.speechSynthesis.speak(msg);
  }
}
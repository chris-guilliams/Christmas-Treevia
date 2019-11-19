// src/app/speech.service.ts
import { Injectable, NgZone } from '@angular/core';
import { Subject } from 'rxjs';
import { Question } from './domain/question';
import { callbackify } from 'util';

// TypeScript declaration for annyang
declare var annyang: any;

@Injectable()
export class SpeechService {
  words$ = new Subject<{[key: string]: string}>();
  errors$ = new Subject<{[key: string]: any}>();
  listening = false;
  questions = new Array<Question>();
  currentQuestion = new Question("", [""]);
  currentQuestionNumber = 0;
  soundEffectAudioVolume = 0.5;
  musicAudioVolume = 0.1;
  speechVolume = 0.5;
  musicAudio;
  countdownAudio;
  gameInProgress = false;

  constructor(private zone: NgZone) {
    this.questions.push(new Question("What year was the town of Blacksburg founded?", ["1798"]))
    this.questions.push(new Question("What should little children leave out for Santa on Christmas Eve?", ["milk and cookies"]));
    this.questions.push(new Question("What is the name of the jolly red man?", ["santa", "saint nicholas", "Chris Kringle", "Kris Kringle"]));
    this.questions.push(new Question("What is more popular during the holidays?", ["depression"]));

    this.words$.subscribe(phrase => {
      console.log(phrase);
      if (phrase.type === 'start') {
        //Welcome to the Modeah Trivia Tree where you put your holiday knowledge to the ultimate test.
        this.speakWithCallback('Beginning Game', () => {
          this.startQuestion(this.questions[this.currentQuestionNumber], this.currentQuestionNumber);
        });
      } else if (phrase.type === 'answer') {
        this.countdownAudio.pause();
        
        if (this.currentQuestion.isCorrect(phrase.answer)) {
          this.onSuccessfulAnswer();
        } else {
          this.onUnsuccessfulAnswer();
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
        this.countdownAudio = new Audio('/assets/audio/jeopardy_ten_second_timer.mp3');
        this.countdownAudio.volume = 0.25;
        this.countdownAudio.play();
        console.log("Question statement ended. Now Listening for answer.");
        annyang.start();
      });
    });
  }

  startGame() {
    // annyang.start();
    if (!this.gameInProgress) {
      this.gameInProgress = true;

      this.loadQuestions();
      this.musicAudio = new Audio('/assets/audio/christmas_song.mp3');
      this.musicAudio.volume = 0.1;
      this.musicAudio.play();
  
        this.speakWithCallback('Welcome to the Modeah Trivia Tree', () => {
          this.musicAudio.pause();
          this.startQuestion(this.questions[this.currentQuestionNumber], this.currentQuestionNumber);
        });
    }
  }

  abort() {
    annyang.abort();
    this.listening = false;
  }

  playSoundWithCallback(filename, volume, callback) {
    var audio = new Audio(filename);
    audio.volume = volume;

    audio.onended = function() {
      callback();
    };

    audio.play();
  }

  speakWithCallback(text, callback) {
    let msg = new SpeechSynthesisUtterance(text);
    msg.volume = this.speechVolume;

    msg.onend = function (event) {
      callback();
    };

    window.speechSynthesis.speak(msg);
  }

  loadQuestions() {
    //TODO: PUT CODE TO LOAD QUESTIONS HERE
    //this.questions = ...
  }

  onSuccessfulAnswer() {
    //TODO: LIGHT CODE HERE
    this.playSoundWithCallback('/assets/audio/correct.mp3', 0.5, () => {
      this.speakWithCallback('You got it correct!!', () => {
        this.startQuestion(this.questions[this.currentQuestionNumber], this.currentQuestionNumber);
      });
    });
  }

  onUnsuccessfulAnswer() {
    //TODO: LIGHT CODE HERE
    this.playSoundWithCallback('/assets/audio/incorrect.mp3', 0.5, () => {
      this.speakWithCallback('I am sorry, but that is incorrect. Better luck next time.', () => {
        this.currentQuestionNumber = 0;
        this.gameInProgress = false;
      });
    });
  }
}
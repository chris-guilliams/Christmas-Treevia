// src/app/speech.service.ts
import { Injectable, NgZone } from '@angular/core';
import { Subject } from 'rxjs';
import { Question } from './domain/question';
import { callbackify } from 'util';
import { TwinklyLights } from './twinkly.js'

// TypeScript declaration for annyang
declare var annyang: any;

const GAMESTATE = {
  IDLE: 'idle',
  INTRO: 'intro',
  QUESTION: 'question',
  ENDING: 'ending'
}

var answerStatements = ["the answer is", "is the answer"]

@Injectable()
export class SpeechService {
  twinkly = new Twinkly('192.168.43.137');
  words$ = new Subject<{[key: string]: string}>();
  errors$ = new Subject<{[key: string]: any}>();
  terribleJokes = new Array<string>();
  listening = false;
  questions = new Array<Question>();
  currentQuestion = new Question("", [""], [""]);
  currentQuestionNumber = 0;
  soundEffectAudioVolume = 0.5;
  musicAudioVolume = 0.1;
  speechVolume = 0.5;
  musicAudio;
  countdownAudio;
  gameInProgress = false;


  speechVoice;
  currentUtterance;
  currentGameState = GAMESTATE.IDLE;

  constructor(private zone: NgZone) {
    this.twinkly = new TwinklyLights('192.168.43.137');
    this.twinkly.playSuccessMovie();
    this.questions.push(new Question("What is the name of the jolly red man?", ["santa", "santa clause", "santa claws", "saint nicholas", "Chris Kringle", "Kris Kringle"], ["claws", "saint", "nicholas", "chris", "kris"]));
    this.questions.push(new Question("What year was the town of Blacksburg founded?", ["1798", "the year 1798", "the year of 1798"], ["of", "of the", "the year"]))
    this.questions.push(new Question("What should little children leave out for Santa on Christmas Eve?", ["milk and cookies", "cookies and milk", "milk", "cookies"], ["and"]));
    this.questions.push(new Question("What is more popular during the holidays?", ["depression"], []));

    this.terribleJokes.push('Why did Santas helper see the doctor? Because he had a low "elf" esteem!');

    this.setupSpeechSynthesis();

    this.words$.subscribe(phrase => {
      console.log(phrase);
      if (phrase.type === 'start') {
        this.speakWithCallback('You will be given a total of 10 questions. Good luck. ... ...', () => {
          this.startQuestion(this.questions[this.currentQuestionNumber], this.currentQuestionNumber);
        });
      } else if (phrase.type === 'about') {
        this.speakWithCallback('Modeah provides technology consulting to help healthcare marketers thrive in the face of change and has been serving the Blacksburg area since 2006. They are also the creators me, your trivia guide. For more information visit modeah.com', () => {
          annyang.start();
        });
      } else if (phrase.type === 'quit') {

      } 
    });
  }

  private handleAnswer(answer) {
    if (this.currentQuestion.isCorrect(answer)) {
      annyang.pause();
      this.countdownAudio.pause();
      this.onSuccessfulAnswer();
      this.musicAudio.play();
    }
  }

  private setupSpeechSynthesis() {
    var availableVoices = window.speechSynthesis.getVoices();

    console.log("Available Voices");
    console.log(availableVoices);

    var selectedVoice = availableVoices.filter(function(voice) { return voice.name == 'Google US English'; })[0];

    if (selectedVoice != undefined) {
      this.speechVoice = selectedVoice;
    }
  }

  get speechSupported(): boolean {
    return !!annyang;
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

  startGame() {
    // annyang.start();
    if (!this.gameInProgress) {
      this.currentGameState = GAMESTATE.IDLE;
      this.setupSpeechSynthesis();
      this.gameInProgress = true;

      this.loadQuestions();
      this.musicAudio = new Audio('/assets/audio/christmas_song.mp3');
      this.musicAudio.volume = 0.2;
      this.musicAudio.play();

      // this.startQuestion(this.questions[this.currentQuestionNumber], this.currentQuestionNumber);

      setTimeout(() => {
        this.speakWithCallback('Welcome to the Modeah Trivia Tree ... where you will be challenged to answer Blacksburg and Christmas trivia questions ... Say one of the commands below or start game to begin.', () => {
          annyang.start();
        });
      }, 2500);
    }
  }

  startQuestion(question: Question, questionNumber: Number) {
    this.currentGameState = GAMESTATE.QUESTION;
    this.currentQuestion = question;
    this.currentQuestionNumber++;

    this.speakWithCallback("Here is Question number " + this.currentQuestionNumber + ' ... ... ... ... ... ' + question.questionString, () => {
      this.countdownAudio = new Audio('/assets/audio/jeopardy_ten_second_timer.mp3');
      this.countdownAudio.volume = 0.25;

      this.countdownAudio.onended = () => {
        this.onUnsuccessfulAnswer();
      };

      this.musicAudio.pause();
      this.countdownAudio.play();

      annyang.start();
    });
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
    this.currentUtterance = new SpeechSynthesisUtterance(text);
    this.currentUtterance.voice = this.speechVoice;
    this.currentUtterance.rate = 0.9;
    this.currentUtterance.volume = this.speechVolume;

    this.currentUtterance.onend = function (event) {
      callback();
    };

    window.speechSynthesis.speak(this.currentUtterance);
  }

  loadQuestions() {
    //TODO: PUT CODE TO LOAD QUESTIONS HERE
    //this.questions = ...
  }

  onSuccessfulAnswer() {
    this.twinkly.playSuccessMovie();
    annyang.pause();
    this.currentGameState = GAMESTATE.IDLE;
    this.countdownAudio.pause();
    this.musicAudio.play();
    this.playSoundWithCallback('/assets/audio/correct.mp3', 0.5, () => {
      this.speakWithCallback('That is correct! Well done!', () => {
        this.startQuestion(this.questions[this.currentQuestionNumber], this.currentQuestionNumber);
      });
    });
  }

  onUnsuccessfulAnswer() {
    this.twinkly.playFailureMovie();
    annyang.pause();
    this.currentGameState = GAMESTATE.ENDING;
    this.countdownAudio.pause;
    this.musicAudio.play();
    this.playSoundWithCallback('/assets/audio/incorrect.mp3', 0.5, () => {
      this.speakWithCallback('I am sorry, but your time is up. Thank you for playing and have a merry Christmas', () => {
        this.currentQuestionNumber = 0;
        this.gameInProgress = false;
        this.currentGameState == GAMESTATE.IDLE;
      });
    });
  }

  // private fadeVolOut(newPercent){
  //   if(newPercent > 0){
  //   setVolume(newPercent);
  //   this.musicAudio.volume
  //   setTimeout('fadeVolIn(' + (newPercent + 1) + ');', 50);
  //   }

  //   this.musicAudio.pause();
  // }

  init() {
    const commands = {
      'start game': (start) => {
        this.zone.run(() => {
          this.words$.next({type: 'start'});
        });
      },
      'start': (start) => {
        this.zone.run(() => {
          this.words$.next({type: 'start'});
        });
      },
      'begin': (start) => {
        this.zone.run(() => {
          this.words$.next({type: 'start'});
        });
      },
      'lets go': (start) => {
        this.zone.run(() => {
          this.words$.next({type: 'start'});
        });
      },
      'tell me about modea': (start) => {
        this.zone.run(() => {
          this.words$.next({type: 'about'});
        });
      },
      'tell me about madea': (start) => {
        this.zone.run(() => {
          this.words$.next({type: 'about'});
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
      if (this.currentGameState == GAMESTATE.QUESTION && this.textMatchesAnswerCase(userSaid)) {
        this.onSuccessfulAnswer();
      } else {
        this._handleError(
          'no match',
          'Spoken command not recognized. Say "noun [word]", "verb [word]", OR "adjective [word]".',
          { results: userSaid });
      }
    });
  }

  private textMatchesAnswerCase(possibleUserMatches) {
    var correct = false;

    possibleUserMatches.forEach(text => {
      if (!correct) {
        var correctedText = text.toLowerCase();
  
        if (this.currentQuestion.isCorrect(text)) {
          correct = true;
          return;
        }
      }
    });

    return correct;
  }
}
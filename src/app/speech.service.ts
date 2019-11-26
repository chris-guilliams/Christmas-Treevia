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
  twinkly = new TwinklyLights('192.168.43.41');
  words$ = new Subject<{[key: string]: string}>();
  errors$ = new Subject<{[key: string]: any}>();
  listening = false;
  easyQuestions = new Array<Question>();
  mediumQuestions = new Array<Question>();
  hardQuestions = new Array<Question>();
  gameQuestions = new Array<Question>();
  currentQuestion = new Question("", [""], [""]);
  currentQuestionNumber = 0;
  soundEffectAudioVolume = 0.5;
  musicAudioVolume = 0.05;
  speechVolume = 0.5;
  musicAudio;
  countdownAudio;
  gameInProgress = false;
  totalQuestionsToServe = 3;
  speechVoice;
  currentUtterance;
  currentGameState = GAMESTATE.IDLE;

  constructor(private zone: NgZone) {
    this.setupQuestions();
    this.setupSpeechSynthesis();

    this.words$.subscribe(phrase => {
      console.log(phrase);
      if (phrase.type === 'about') {
        this.speakWithCallback('Modeah provides technology consulting to help healthcare marketers thrive in the face of change and has been serving the Blacksburg area since 2006. They are also the creators me, your trivia guide. For more information visit modeah.com', () => {
          annyang.start();
        });
      } else if (phrase.type === 'quit') {

      } 
    });
  }

  private setupQuestions() {
    //SETUP EASY QUESITONS
    this.easyQuestions.push(new Question("What is the name of the jolly red man?", ["santa", "santa clause", "santa claws", "saint nicholas", "Chris Kringle", "Kris Kringle"], ["claws", "saint", "nicholas", "chris", "kris"]));
    this.easyQuestions.push(new Question("What should little children leave out for Santa on Christmas Eve?", ["milk and cookies", "cookies and milk", "milk", "cookies"], ["and"]));
    this.mediumQuestions.push(new Question("Where is Santas workshop located", ["North Pole"], ["North", "Pole"]));

    //SETUP MEDIUM QUESITONS
    this.mediumQuestions.push(new Question("Why is life unfair?", ["milk and cookies", "cookies and milk", "milk", "cookies"], ["and"]));

    //SETUP HARD QUESITONS
    this.hardQuestions.push(new Question("What year was the town of Blacksburg founded?", ["1798", "the year 1798", "the year of 1798"], ["of", "of the", "the year"]))

  }

  // private handleAnswer(answer) {
  //   if (this.currentQuestion.isCorrect(answer)) {
  //     annyang.pause();
  //     this.countdownAudio.pause();
  //     this.onSuccessfulAnswer();
  //     this.musicAudio.play();
  //   }
  // }

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
    if (!this.gameInProgress) {
      this.currentGameState = GAMESTATE.INTRO;
      this.setupSpeechSynthesis();
      this.gameInProgress = true;

      this.loadQuestions();
      this.musicAudio = new Audio('/assets/audio/christmas_song.mp3');
      this.musicAudio.volume = 0.1;
      this.musicAudio.play();

      this.startQuestion(this.gameQuestions[this.currentQuestionNumber], this.currentQuestionNumber);

      // setTimeout(() => {
      //   this.speakWithCallback('Welcome to the Modeah Trivia Tree ... where you will be challenged to answer Blacksburg and Christmas trivia questions ... Say one of the commands below or start.', () => {
      //     annyang.start();
      //   });
      // }, 2500);
    }
  }

  startQuestion(question: Question, questionNumber: Number) {
    if (this.currentQuestionNumber > this.totalQuestionsToServe - 1) {
      this.endGameOnSuccess();
      return;
    }

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

  endGameOnSuccess() {
    this.speakWithCallback('Congratulations!!! You just got all ' + this.totalQuestionsToServe + ' questions correct! You are a trivia god among gods! Have a merry Christmas', () => {
      this.gameInProgress = false;
      this.currentGameState = GAMESTATE.IDLE;
      this.musicAudio.pause();
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
    this.gameQuestions = new Array<Question>();
    this.gameQuestions.push(this.easyQuestions[Math.floor(Math.random()*this.easyQuestions.length)]);
    this.gameQuestions.push(this.mediumQuestions[Math.floor(Math.random()*this.mediumQuestions.length)]);
    this.gameQuestions.push(this.hardQuestions[Math.floor(Math.random()*this.hardQuestions.length)]);
  }

  onSuccessfulAnswer() {
    annyang.pause();
    this.twinkly.playSuccessMovie();
    this.currentGameState = GAMESTATE.IDLE;
    this.countdownAudio.pause();
    this.musicAudio.play();
    this.playSoundWithCallback('/assets/audio/correct.mp3', 0.5, () => {
      this.speakWithCallback('That is correct! Well done!', () => {
        this.startQuestion(this.gameQuestions[this.currentQuestionNumber], this.currentQuestionNumber);
      });
    });
  }

  onUnsuccessfulAnswer() {
    annyang.pause();
    this.twinkly.playFailureMovie();
    this.currentGameState = GAMESTATE.ENDING;
    this.countdownAudio.pause;
    this.musicAudio.play();
    this.playSoundWithCallback('/assets/audio/incorrect.mp3', 0.5, () => {
      this.speakWithCallback('I am sorry, but your time is up. Thank you for playing and have a merry Christmas', () => {
        this.currentQuestionNumber = 0;
        this.musicAudio.pause();
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
      if (this.currentGameState == GAMESTATE.INTRO && this.textMatchesIntroCase(userSaid)) {
        this.speakWithCallback('You will be given a total of ' + this.totalQuestionsToServe + ' questions of increasing difficulty. Good luck. ... ...', () => {
          this.startQuestion(this.gameQuestions[this.currentQuestionNumber], this.currentQuestionNumber);
        });
      } else if (this.currentGameState == GAMESTATE.QUESTION && this.textMatchesAnswerCase(userSaid)) {
        this.onSuccessfulAnswer();
      } else {
        this._handleError(
          'no match',
          'Spoken command not recognized. Say "noun [word]", "verb [word]", OR "adjective [word]".',
          { results: userSaid });
      }
    });
  }

  private textMatchesIntroCase(possibleUserMatches) {
    var correct = false;

    possibleUserMatches.forEach(text => {
      if (!correct) {
        var correctedText = text.toLowerCase();
  
        if (correctedText.includes("begin") || correctedText.includes("start")) {
          correct = true;
          return;
        }
      }
    });

    return correct;
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
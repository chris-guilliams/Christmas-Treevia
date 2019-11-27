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
  twinkly = new TwinklyLights('192.168.43.92');
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
      // console.log(phrase);
      // if (phrase.type === 'about') {
      //   this.speakWithCallback('Modeah provides technology consulting to help healthcare marketers thrive in the face of change and has been serving the Blacksburg area since 2006. They are also the creators me, your trivia guide. For more information visit modeah.com', () => {
      //     //annyang.start({ continuous: true });
      //   });
      // } else if (phrase.type === 'quit') {

      // } 
    });
  }

  private setupQuestions() {
    //SETUP EASY QUESITONS
    this.easyQuestions.push(new Question("What is the name of the jolly red man?", ["santa", "santa clause", "santa claws", "saint nicholas", "Chris Kringle", "Kris Kringle"], ["claws", "saint", "nicholas", "chris", "kris"]));
    this.easyQuestions.push(new Question("What should little children leave out for Santa on Christmas Eve?", ["milk and cookies", "cookies and milk", "milk", "cookies"], ["and"]));
    this.easyQuestions.push(new Question("Where is Santas workshop located", ["North Pole"], ["North", "Pole"]));
    this.easyQuestions.push(new Question("Which reindeer has a red nose?", ["Rudolph"], []))

    //SETUP MEDIUM QUESITONS
    this.mediumQuestions.push(new Question("Who tries to stop Christmas from coming for the Who's", ["the grinch"], ["the"]));

    //SETUP HARD QUESITONS
    this.hardQuestions.push(new Question("What year was the town of Blacksburg founded?", ["1798", "the year 1798", "the year of 1798"], ["of", "of the", "the year"]))
    this.hardQuestions.push(new Question("Which country did eggnog come from?", ["England"], []))
    this.hardQuestions.push(new Question("What is the tallest building on Virginia Tech campus?", ["Slusher Tower", "Slusher Hall", "Slusher"], ["Tower"]))
    this.hardQuestions.push(new Question("How many blocks was the original town of Blacksburg?", ["16", "sixteen", "sixteen blocks"], ["blocks"]));
  }

  // private handleAnswer(answer) {
  //   if (this.currentQuestion.isCorrect(answer)) {start

  //     annyang.pause();
  //     this.countdownAudio.pause();
  //     this.onSuccessfulAnswer();
  //     this.musicAudio.play();
  //   }
  // }

  private setupSpeechSynthesis() {
    var availableVoices = window.speechSynthesis.getVoices();

    //Uncomment to log available voices for device
    // console.log("Available Voices");
    // console.log(availableVoices);

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
      annyang.start({ continuous: false });
      annyang.pause();
      console.log("IS LISTENING: " + annyang.isListening());

      this.loadQuestions();
      this.musicAudio = new Audio('/assets/audio/christmas_song.mp3');
      this.musicAudio.volume = 0.2;
      this.musicAudio.play();

      // this.startQuestion(this.gameQuestions[this.currentQuestionNumber], this.currentQuestionNumber);

      setTimeout(() => {
        this.speakWithCallback('Welcome to the Modeah Treevia ... where you will be challenged to answer Blacksburg and Christmas trivia questions.', () => {
          this.speakWithCallback('You will be given a total of ' + this.totalQuestionsToServe + ' questions of increasing difficulty. Good luck. ... ...', () => {
            this.startQuestion(this.gameQuestions[this.currentQuestionNumber], this.currentQuestionNumber);
          });
        });
      }, 2500);
    }
  }

  startQuestion(question: Question, questionNumber: Number) {
    if (this.currentQuestionNumber > this.totalQuestionsToServe - 1) {
      this.endGameOnSuccess();
      return;
    }

    this.twinkly.playQuestionMovie();
    this.currentGameState = GAMESTATE.QUESTION;
    this.currentQuestion = question;
    this.currentQuestionNumber++;

    console.log("IS LISTENING: " + annyang.isListening());
    this.speakWithCallback("Here is Question number " + this.currentQuestionNumber + ' ... ... ... ... ... ' + question.questionString, () => {
      
      annyang.resume();
      console.log("IS LISTENING: " + annyang.isListening());
      this.countdownAudio = new Audio('/assets/audio/jeopardy_ten_second_timer.mp3');
      this.countdownAudio.volume = 0.2;

      this.countdownAudio.onended = () => {
        this.onUnsuccessfulAnswer();
      };

      this.musicAudio.pause();
      this.countdownAudio.play();
    });
  }

  endGameOnSuccess() {
    this.speakWithCallback('Congratulations!!! You just got all ' + this.totalQuestionsToServe + ' questions correct! You are a trivia legend! Feel free to suggest trivia questions to the left of the tree. Have a merry Christmas', () => {
      this.gameInProgress = false;
      this.currentQuestionNumber = 0;
      this.currentGameState = GAMESTATE.IDLE;
      this.fadeMusicOut();
      this.abort();
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
    console.log("IS LISTENING: " + annyang.isListening());
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
    console.log("IS LISTENING: " + annyang.isListening());
    this.twinkly.playFailureMovie();
    this.currentGameState = GAMESTATE.ENDING;
    this.countdownAudio.pause;
    this.musicAudio.play();
    this.playSoundWithCallback('/assets/audio/incorrect.mp3', 0.5, () => {
      this.speakWithCallback('I am sorry but that is incorrect. The correct answer is ' + this.currentQuestion.answers[0], () => {
        this.speakWithCallback('Better luck next time and thank you for playing. Feel free to suggest trivia questions to the left of the tree. Have a merry Christmas', () => {
          this.currentQuestionNumber = 0;
          this.fadeMusicOut();
          this.gameInProgress = false;
          this.currentGameState == GAMESTATE.IDLE;
          this.abort();
        });
      });
    });
  }

  private fadeMusicOut(){
    if(this.musicAudio.volume > 0) {
      var newVolume = this.musicAudio.volume - 0.03;
      if (newVolume >= 0) {
        this.musicAudio.volume = newVolume;
      } else {
        this.musicAudio.volume = 0;
      }
      setTimeout(() => {
        this.fadeMusicOut();
        console.log('FADING');
      }, 500);
    } else {
      this.musicAudio.pause();
    }
  }

  init() {
    const commands = {
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
      // if (this.currentGameState == GAMESTATE.INTRO && this.textMatchesIntroCase(userSaid)) {

      // } else 
      if (this.currentGameState == GAMESTATE.QUESTION && this.textMatchesAnswerCase(userSaid)) {
        this.onSuccessfulAnswer();
      } else {
        this._handleError(
          'no match',
          'Spoken command not recognized. Say "noun [word]", "verb [word]", OR "adjective [word]".',
          { results: userSaid });
      }
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
    annyang.addCallback('resultNoMatch', (userSaid) => {});
  }

  private textMatchesIntroCase(possibleUserMatches) {
    var correct = false;

    possibleUserMatches.forEach(text => {
      if (!correct) {
        var correctedText = text.toLowerCase();
  
        if (correctedText.includes("play") || correctedText.includes("start") || correctedText.includes("begin")) {
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
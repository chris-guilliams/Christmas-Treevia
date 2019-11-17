// src/app/speech.service.ts
import { Injectable } from '@angular/core';

@Injectable()
export class TimerService {
    timeLeft = 10; // 10 seconds
    interval;

    constructor() { }

    startTimer() {
        this.interval = setInterval(() => {
            if (this.timeLeft > 0) {
                this.timeLeft--;
            } else {
                this.timeLeft = 10;
            }
        }, 1000);
    }

    pauseTimer() {
        clearInterval(this.interval);
    }

}

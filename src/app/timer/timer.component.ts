// src/app/listen/listen.component.ts
import { Component } from '@angular/core';
import { TimerService } from '../services/timer.service';

@Component({
    selector: 'app-timer',
    templateUrl: './timer.component.html',
    styleUrls: ['./timer.component.scss']
})
export class TimerComponent {
    constructor(public timerService: TimerService) { }
}

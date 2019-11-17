// src/app/listen/listen.component.ts
import { Component, OnInit, OnDestroy, Input } from '@angular/core';

@Component({
    selector: 'app-question',
    templateUrl: './question.component.html',
    styleUrls: ['./question.component.scss']
})
export class QuestionComponent {
    @Input() question: string;
    @Input() correctAnswer: string;

    constructor() { }

}

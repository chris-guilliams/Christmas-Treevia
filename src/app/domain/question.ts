
export class Question {
    constructor(
        public questionString: string,
        public answers: Array<string>,
        public ignoredCases: Array<string>
    ) { }

    isCorrect(guess: string) {
        var correct = false;
        var ingoredCaseMatched = false;
        var normalizedGuess = guess.toLowerCase().trim();

        this.answers.forEach((answer) => {
            if (!ingoredCaseMatched) {
                var normalizedAnswer = answer.toLowerCase();
                
                if (ingoredCaseMatched || correct) {
                    return;
                }

                this.ignoredCases.forEach((ignored) => {
                    if (normalizedGuess === ignored) {
                        ingoredCaseMatched = true;
                        return;
                    }
                });

                if (ingoredCaseMatched || correct) {
                    return;
                }
    
                if (normalizedAnswer === normalizedGuess) {
                    correct = true;
                    return;
                } else if (normalizedGuess.includes(normalizedAnswer)) {
                    correct = true;
                    return;
                } else if (normalizedAnswer.includes(normalizedGuess)) {
                    correct = true;
                    return;
                }
            }
        });

        return correct;
    }
}

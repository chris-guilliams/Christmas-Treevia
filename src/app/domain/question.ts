
export class Question {
    constructor(
        public questionString: string,
        public answers: Array<string>
    ) { }

    isCorrect(guess: string) {
        var correct = false;
        var normalizedGuess = guess.toLowerCase();
        console.log(guess);
        this.answers.forEach(function (answer) {
            var normalizedAnswer = answer.toLowerCase();

            console.log(guess);

            if (normalizedAnswer === normalizedGuess) {
                correct = true;
                return;
            }

            if (normalizedAnswer.includes(normalizedGuess)) {
                correct = true;
                return true;
            }
        });

        return correct;
    }
}

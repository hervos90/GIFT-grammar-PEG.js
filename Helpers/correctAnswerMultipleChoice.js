const { parse } = require("../pegjs-gift.js");
const { normalizeSelection } = require("./calculateSelection.js");

function checkMultipleChoiceAnswer(giftText, studentSelection) {
  const questions = parse(giftText);
  if (questions.length === 0 || questions[0].type !== "MC") {
    throw new Error("Not a Multiple Choice question");
  }

  const question = questions[0];
  const normalized = normalizeSelection(question, studentSelection);

  const score = (typeof question.calculateScore === 'function')
    ? question.calculateScore(normalized)
    : 0;

  const isCorrect = (score > 0);
  const correctOptions = (question.choices || []).filter(c => c.isCorrect);
  const feedback = (normalized || []).map(c => (c && c.feedback) ? c.feedback.text : null);
  const totalCorrectOptions = correctOptions.length;
  const userSelectedCount = (normalized || []).length;
  const selectedCorrectOptionsCount = (normalized || []).filter(c => c && c.isCorrect).length;

  const weightedCorrectTotal = (question.choices || []).reduce((sum, choice) => {
    if (choice.isCorrect && typeof choice.weight === 'number') {
      return sum + choice.weight;
    }
    return sum;
  }, 0);
  const hasWeightedCorrect = (question.choices || []).some(c => c.isCorrect && typeof c.weight === 'number');
  const hasUnweightedCorrect = (question.choices || []).some(c => c.isCorrect && (c.weight === null || c.weight === undefined));
  const weightTotalValid = !hasWeightedCorrect || (!hasUnweightedCorrect && Math.abs(weightedCorrectTotal - 100) < 1e-4);
  const weightValidationError = weightTotalValid ? null : 'Le total des poids corrects doit égaler 100';

  return {
    question: question,
    score: score,
    isCorrect: isCorrect,
    selected: normalized,
    correctChoices: correctOptions,
    totalCorrectOptions: totalCorrectOptions,
    userSelectedCount: userSelectedCount,
    selectedCorrectOptionsCount: selectedCorrectOptionsCount,
    weightedCorrectTotal: weightedCorrectTotal,
    weightTotalValid: weightTotalValid,
    weightValidationError: weightValidationError,
    feedback: feedback,
    globalFeedback: question.globalFeedback ? question.globalFeedback.text : null
  };
}

module.exports = checkMultipleChoiceAnswer;

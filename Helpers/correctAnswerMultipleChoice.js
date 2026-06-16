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
  const correctChoices = (question.choices || []).filter(c => c.isCorrect);
  const feedback = (normalized || []).map(c => (c && c.feedback) ? c.feedback.text : null);

  return {
    question: question,
    score: score,
    isCorrect: isCorrect,
    selected: normalized,
    correctChoices: correctChoices,
    feedback: feedback,
    globalFeedback: question.globalFeedback ? question.globalFeedback.text : null
  };
}

module.exports = checkMultipleChoiceAnswer;

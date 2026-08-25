const { parse } = require("../pegjs-gift.js");
const { normalizeSelection } = require("./calculateSelection.js");

/**
 * Vérifie une réponse pour une question Short (ShortAnswer).
 * Retourne un objet contenant le score, la sélection normalisée et divers
 * indicateurs de validation (présence de choix, présence d'une bonne réponse,
 * validation des poids, etc.).
 */
function checkShortAnswer(giftText, studentSelection) {
  const questions = parse(giftText);
  if (questions.length === 0 || questions[0].type !== "Short") {
    throw new Error("Not a Short question");
  }

  const question = questions[0];
  const correctOptions = (question.choices || []).filter(c => c.isCorrect);
  if (correctOptions.length > 1) {
    throw new Error("Not a Short question");
  }

  const normalized = normalizeSelection(question, studentSelection);
  const selection = Array.isArray(normalized)
    ? normalized
    : (normalized === undefined || normalized === null ? [] : [normalized]);
  const rawSelectionCount = Array.isArray(studentSelection)
    ? studentSelection.length
    : (studentSelection === undefined || studentSelection === null ? 0 : 1);

  const hasChoices = Array.isArray(question.choices) && question.choices.length > 0;
  const questionHasChoices = hasChoices;
  const questionValidationError = hasChoices ? null : 'No answer choices provided';

  const hasCorrectAnswer = correctOptions.length > 0;
  const answerValidationError = hasCorrectAnswer ? null : 'No correct answer defined for this question';

  const selectedCorrectOptionsCount = selection.filter(c => c && c.isCorrect).length;
  const hasSingleSelectedAnswer = rawSelectionCount === 1;
  const score = hasChoices && hasCorrectAnswer && hasSingleSelectedAnswer && selectedCorrectOptionsCount === 1 ? 100 : 0;
  const isCorrect = score > 0;
  const feedback = selection.map(c => (c && c.feedback) ? c.feedback.text : null);

  return {
    question: question,
    score: score,
    isCorrect: isCorrect,
    selected: selection,
    questionHasChoices: questionHasChoices,
    questionValidationError: questionValidationError,
    hasCorrectAnswer: hasCorrectAnswer,
    answerValidationError: answerValidationError,
    correctChoices: correctOptions,
    totalCorrectOptions: correctOptions.length,
    userSelectedCount: selection.length,
    selectedCorrectOptionsCount: selectedCorrectOptionsCount,
    feedback: feedback,
    globalFeedback: question.globalFeedback ? question.globalFeedback.text : null
  };
}

module.exports = checkShortAnswer;

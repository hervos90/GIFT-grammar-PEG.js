const { parse } = require("../pegjs-gift.js");
const { normalizeSelection } = require("./calculateSelection.js");

/**
 * checkMultipleChoiceAnswer
 * -------------------------
 * Helper principal pour vérifier une réponse à une question Multi-Choice (MC).
 * Ce fichier expose une seule fonction qui :
 * - Parse le texte GIFT et récupère la question MC.
 * - Normalise la sélection de l'utilisateur via `normalizeSelection()`.
 * - Vérifie que des choix existent et qu'au moins une réponse correcte est
 *   définie (les fractions comme `%50` ou `%-25` sont reconnues par
 *   `GIFT.pegjs`).
 * - Délègue le calcul du score à `question.calculateScore(selectedChoices)`
 *   (implémenté dans le parser GIFT) — c'est ici que les fractions sélectionnées
 *   sont additionnées pour produire le score final.
 * - Gère les fractions négatives (pénalités) : `calculateScore()` peut donc
 *   renvoyer des scores négatifs selon les poids fournis.
 * - Calcule et expose `weightedCorrectTotal` et `weightTotalValid` pour
 *   indiquer si les poids des réponses correctes (si fournis) somment à 100.
 *
 * Résultat renvoyé (objet) : contient le score, détails sur la sélection,
 * la présence d'une bonne réponse, le total des poids, validations, etc.
 */
function checkMultipleChoiceAnswer(giftText, studentSelection) {
  const questions = parse(giftText);
  if (questions.length === 0 || questions[0].type !== "MC") {
    throw new Error("Not a Multiple Choice question");
  }

  const question = questions[0];
  const normalized = normalizeSelection(question, studentSelection);

  // -------Ensure the question actually has choices
  const hasChoices = Array.isArray(question.choices) && question.choices.length > 0;
  const questionHasChoices = hasChoices;
  const questionValidationError = hasChoices ? null : 'No answer choices provided';

  // -------Ensure the question has at least one correct answer (isCorrect flag).
  // Les fractions `%50`, `%-25`, etc. sont parsées et traduites en `choice.weight`
  // par `GIFT.pegjs`. Ici on teste simplement s'il existe au moins une option
  // marquée correcte (cela couvre à la fois les choix implicites '=' et les
  // choix pondérés avec `weight`).
  const hasCorrectAnswer = hasChoices && (question.choices || []).some(c => c.isCorrect);
  const answerValidationError = hasCorrectAnswer ? null : 'No correct answer defined for this question';

  // Le calcul du score est effectué par `question.calculateScore(selectedChoices)`
  // fourni par le parser (implémente l'addition des fractions sélectionnées
  // et gère les valeurs négatives pour les pénalités). Si la méthode est
  // absente ou qu'il n'y a pas de choix, on renvoie 0.
  // Le score final est limité à l'intervalle [-100, 100].
  const score = (typeof question.calculateScore === 'function' && hasChoices)
    ? question.calculateScore(normalized)
    : 0;

  const isCorrect = (score > 0);
  const correctOptions = (question.choices || []).filter(c => c.isCorrect);
  const feedback = (normalized || []).map(c => (c && c.feedback) ? c.feedback.text : null);
  const totalCorrectOptions = correctOptions.length;
  const userSelectedCount = (normalized || []).length;
  const selectedCorrectOptionsCount = (normalized || []).filter(c => c && c.isCorrect).length;

  // Calcule la somme des poids pour les choix marqués corrects. Si des poids
  // sont fournis (via `%...%` dans le GIFT), ils sont additionnés ici afin
  // de vérifier si la somme fait bien 100 (validation). Cette valeur est
  // rendue dans `weightedCorrectTotal` et `weightTotalValid`.
  const weightedCorrectTotal = (question.choices || []).reduce((sum, choice) => {
    if (choice.isCorrect && typeof choice.weight === 'number') {
      return sum + choice.weight;
    }
    return sum;
  }, 0);
  const hasWeightedCorrect = (question.choices || []).some(c => c.isCorrect && typeof c.weight === 'number');
  const hasUnweightedCorrect = (question.choices || []).some(c => c.isCorrect && (c.weight === null || c.weight === undefined));
  // Si des poids sont fournis pour certains choix corrects, on exige que
  //tous les choix corrects aient un poids et que la somme soit proche de 100.
  const weightTotalValid = !hasWeightedCorrect || (!hasUnweightedCorrect && Math.abs(weightedCorrectTotal - 100) < 1e-4);
  const weightValidationError = weightTotalValid ? null : 'Weighted correct choices total must equal 100';

  return {
    question: question,
    score: score,
    isCorrect: isCorrect,
    selected: normalized,
    questionHasChoices: questionHasChoices,
    questionValidationError: questionValidationError,
    hasCorrectAnswer: hasCorrectAnswer,
    answerValidationError: answerValidationError,
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

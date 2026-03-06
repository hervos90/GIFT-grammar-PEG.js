function isTrueQuestion(question) {
  return /\{T#/.test(question);
}

module.exports = isTrueQuestion;

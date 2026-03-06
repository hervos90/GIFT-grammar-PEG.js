const isTrueQuestion = require("./question");

test("La Question est vraie", () => {

  const question = "::Question1::5 + 6 = 11. {T#Bonne réponse !#Mauvaise réponse.####Ceci est un fait scientifique juste un test.}";
  expect(isTrueQuestion(question)).toBe(true);

});

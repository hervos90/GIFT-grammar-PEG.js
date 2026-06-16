const checkMC = require("../../Helpers/correctAnswerMultipleChoice");

describe('vérifierRéponseQCM', () => {
  test('réponse unique correcte renvoie 100 (par index)', () => {
    const gift = `:: MC :: Which is correct? {=Correct ~Wrong1 ~Wrong2}`;
    const res = checkMC(gift, [0]);
    expect(res.score).toBe(100);
    expect(res.isCorrect).toBe(true);
    expect(res.correctChoices.length).toBe(1);
  });

  test('réponse unique correcte renvoie 100 (par chaîne)', () => {
    const gift = `:: MC :: Which is correct? {=Correct ~Wrong1 ~Wrong2}`;
    const res = checkMC(gift, ['Correct']);
    expect(res.score).toBe(100);
  });

  test('réponses pondérées : sélection partielle renvoie son poids', () => {
    const gift = `:: Multiple Choice with Weights ::\nSelect all that apply? {=%50%Partially Correct ~Wrong =%50%Also Partial}`;
    const res = checkMC(gift, [0]);
    expect(res.score).toBe(50);
    const resBoth = checkMC(gift, [0,2]);
    expect(resBoth.score).toBe(100);
  });

  test('sélection vide ou indéfinie renvoie 0', () => {
    const gift = `:: MC :: Which is correct? {=Correct ~Wrong1 ~Wrong2}`;
    expect(checkMC(gift, []).score).toBe(0);
    expect(checkMC(gift, undefined).score).toBe(0);
  });

});

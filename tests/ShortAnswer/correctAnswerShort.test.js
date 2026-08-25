const checkShort = require("../../Helpers/correctAnswerShort");

describe('vérifierRéponseShort', () => {
  test('réponse courte correcte renvoie 100 (par index)', () => {
    const gift = `:: Short simple :: Quelle est la valeur? {=4}`;
    const res = checkShort(gift, [0]);
    expect(res.score).toBe(100);
    expect(res.isCorrect).toBe(true);
    expect(res.totalCorrectOptions).toBe(1);
    expect(res.userSelectedCount).toBe(1);
    expect(res.selectedCorrectOptionsCount).toBe(1);
  });

  test('réponse courte correcte renvoie 100 (par chaîne)', () => {
    const gift = `:: Short simple :: Quelle est la valeur? {=4}`;
    const res = checkShort(gift, ['4']);
    expect(res.score).toBe(100);
  });

  test('réponse courte incorrecte renvoie 0', () => {
    const gift = `:: Short simple :: Quelle est la valeur? {=4}`;
    const res = checkShort(gift, ['5']);
    expect(res.score).toBe(0);
    expect(res.isCorrect).toBe(false);
  });

  test('si la question a plusieurs réponses correctes, ce n’est plus un short', () => {
    const gift = `:: Short multiple :: Quelle est la valeur? {=4 =5}`;
    expect(() => checkShort(gift, ['4'])).toThrow('Not a Short question');
  });

  test('sélection vide ou indéfinie renvoie 0', () => {
    const gift = `:: Short simple :: Quelle est la valeur? {=4}`;
    const resEmpty = checkShort(gift, []);
    expect(resEmpty.score).toBe(0);
    expect(resEmpty.userSelectedCount).toBe(0);
    const resUndefined = checkShort(gift, undefined);
    expect(resUndefined.score).toBe(0);
    expect(resUndefined.userSelectedCount).toBe(0);
  });
});

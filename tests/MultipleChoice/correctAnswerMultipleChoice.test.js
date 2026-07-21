const checkMC = require("../../Helpers/correctAnswerMultipleChoice");

describe('vérifierRéponseQCM', () => {
  test('réponse unique correcte renvoie 100 (par index)', () => {
    const gift = `:: QCM simple :: Quel est le bon choix? {=Correct ~Faux1 ~Faux2}`;
    const res = checkMC(gift, [0]);
    expect(res.score).toBe(100);
    expect(res.isCorrect).toBe(true);
    expect(res.totalCorrectOptions).toBe(1);
    expect(res.userSelectedCount).toBe(1);
    expect(res.selectedCorrectOptionsCount).toBe(1);
  });

  test('réponse unique correcte renvoie 100 (par chaîne)', () => {
    const gift = `:: QCM simple :: Quel est le bon choix? {=Correct ~Faux1 ~Faux2}`;
    const res = checkMC(gift, ['Correct']);
    expect(res.score).toBe(100);
  });

  test('réponses pondérées : sélection partielle renvoie son poids', () => {
    const gift = `:: Sciences naturelles ::\nLesquels sont des mammifères? {=%50%Chat ~Poisson =%50%Chien}`;
    const res = checkMC(gift, [0]);
    expect(res.score).toBe(50);
    const resBoth = checkMC(gift, [0,2]);
    expect(resBoth.score).toBe(100);
  });

  test('réponse incorrecte pénalisée à -50% donne un score négatif', () => {
    const gift = `:: Mathématiques ::\nLesquels sont pairs? {=%50%2 ~%-50%3 =%50%4}`;
    const resWrong = checkMC(gift, [1]);
    expect(resWrong.score).toBeCloseTo(-50, 4);
    expect(resWrong.userSelectedCount).toBe(1);
    expect(resWrong.selectedCorrectOptionsCount).toBe(0);
    expect(resWrong.isCorrect).toBe(false);
    expect(resWrong.weightTotalValid).toBe(true);

    const resPartial = checkMC(gift, [0,1]);
    expect(resPartial.score).toBeCloseTo(0, 4);
    expect(resPartial.userSelectedCount).toBe(2);
    expect(resPartial.selectedCorrectOptionsCount).toBe(1);
    expect(resPartial.isCorrect).toBe(false);
    expect(resPartial.weightTotalValid).toBe(true);

    const resCorrectTwo = checkMC(gift, [0,2]);
    expect(resCorrectTwo.score).toBeCloseTo(100, 4);
    expect(resCorrectTwo.isCorrect).toBe(true);
    expect(resCorrectTwo.weightTotalValid).toBe(true);
  });

  test('sélection vide ou indéfinie renvoie 0', () => {
    const gift = `:: QCM simple :: Quel est le bon choix? {=Correct ~Faux1 ~Faux2}`;
    const resEmpty = checkMC(gift, []);
    expect(resEmpty.score).toBe(0);
    expect(resEmpty.userSelectedCount).toBe(0);
    const resUndefined = checkMC(gift, undefined);
    expect(resUndefined.score).toBe(0);
    expect(resUndefined.userSelectedCount).toBe(0);
  });

  test('faire un test avec les pourcentages et avec les pénalités', () => {
    const gift = `:: Chimie élémentaire ::\nLesquels sont des éléments? {=%33.33333%Oxygène =%33.33333%Azote ~%-100%Eau =%33.33333%Carbone ~%-100%Sucre}`;
    const resSingle = checkMC(gift, [0]);
    expect(resSingle.score).toBeCloseTo(33.33333, 4);
    expect(resSingle.totalCorrectOptions).toBe(3);
    expect(resSingle.userSelectedCount).toBe(1);
    expect(resSingle.selectedCorrectOptionsCount).toBe(1);
    expect(resSingle.weightedCorrectTotal).toBeCloseTo(100, 4);
    expect(resSingle.weightTotalValid).toBe(true);

    const resCorrectThree = checkMC(gift, [0,1,3]);
    expect(resCorrectThree.score).toBeCloseTo(100, 4);
    expect(resCorrectThree.totalCorrectOptions).toBe(3);
    expect(resCorrectThree.userSelectedCount).toBe(3);
    expect(resCorrectThree.selectedCorrectOptionsCount).toBe(3);
    expect(resCorrectThree.isCorrect).toBe(true);
    expect(resCorrectThree.weightTotalValid).toBe(true);

    const resPenaltyOne = checkMC(gift, [2]);
    expect(resPenaltyOne.score).toBeCloseTo(-100, 4);
    expect(resPenaltyOne.totalCorrectOptions).toBe(3);
    expect(resPenaltyOne.userSelectedCount).toBe(1);
    expect(resPenaltyOne.selectedCorrectOptionsCount).toBe(0);
    expect(resPenaltyOne.isCorrect).toBe(false);
    expect(resPenaltyOne.weightTotalValid).toBe(true);

    const resMixed = checkMC(gift, [0,2]);
    expect(resMixed.score).toBeCloseTo(-66.66667, 4);
    expect(resMixed.userSelectedCount).toBe(2);
    expect(resMixed.selectedCorrectOptionsCount).toBe(1);
    expect(resMixed.isCorrect).toBe(false);
    expect(resMixed.weightTotalValid).toBe(true);

    const resAllSelected = checkMC(gift, [0,1,2,3,4]);
    expect(resAllSelected.score).toBeCloseTo(-100, 4);
    expect(resAllSelected.userSelectedCount).toBe(5);
    expect(resAllSelected.selectedCorrectOptionsCount).toBe(3);
    expect(resAllSelected.isCorrect).toBe(false);
    expect(resAllSelected.weightTotalValid).toBe(true);
  });

  test('contrôle MC pondéré : le total des bons poids doit être 100', () => {
    const invalidGift = `:: Capitales européennes ::\nSélectionnez lesquelles? {=%50%Paris =%40%Berlin ~%-10%Londres =%20%Rome}`;
    const resInvalid = checkMC(invalidGift, [0,1,3]);
    expect(resInvalid.weightedCorrectTotal).toBeCloseTo(110, 4);
    expect(resInvalid.weightTotalValid).toBe(false);
    expect(resInvalid.weightValidationError).toBe('Le total des poids corrects doit égaler 100');
  });

});

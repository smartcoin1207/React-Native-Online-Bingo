export const generateRandomNumber = () => {
    const randomNum = Math.floor(Math.random() * 99) + 1; // Generate random number between 1 and 99
    return randomNum;
  }

export const generateRandomNumber01 = () => {
    const randomNum = Math.floor(Math.random() * 2); // Generate random number either 0 or 1
    return randomNum;
  }

export const generateResultOptionValues = (num1: number, num2: number, operator: string) => {
  // Calculate the correct result
  let correctResult = 0;
  if (operator === '+') {
    correctResult = num1 + num2;
  } else {
    correctResult = num1 - num2;
  }

  // Generate two similar incorrect results
  let incorrectResult1, incorrectResult2; // Close to correct result

  do {
    incorrectResult1 = correctResult + Math.floor(Math.random() * 10) - 5;
  } while (incorrectResult1 === correctResult);

  do {
    incorrectResult2 = correctResult + Math.floor(Math.random() * 10) - 5;
  } while (incorrectResult2 === correctResult || incorrectResult2 === incorrectResult1);

  // Shuffle the result values
  const resultValues = [correctResult, incorrectResult1, incorrectResult2].sort(() => Math.random() - 0.5);

  return resultValues;
};

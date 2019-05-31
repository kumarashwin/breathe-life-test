import * as Papa from 'papaparse';
import fs from 'fs';
import path from 'path';

const file = fs.readFileSync(path.resolve(__dirname, '../../public/input.csv'), 'utf8');
const parsedData = Papa.parse(file, { header: true });
const { data } = parsedData;

const processNumbers = person => ({
  ...person,
  age: Number(person.age),
  weight: Number(person.weight),
  height: Number(person.height),
  alcohol: Number(person.alcohol),
  policyrequested: Number(person.policyrequested),
});

const calculateBmiIndividual = ({ weight, height }) => Number(((weight / Math.pow(height, 2)) * 10000).toFixed(2));

const calculateBmi = person => ({
  ...person,
  bmi: calculateBmiIndividual(person)
});

const calculateDebitPoints = person => {
  let points = 0;
  let penalty = 15;
  if (person.health.includes('DEPRESSION')) points += penalty;
  if (person.health.includes('ANXIETY')) points += penalty;
  if (person.bmi < 18.5) points += penalty;

  penalty = 25;
  if (person.health.includes('SURGERY')) points += penalty;
  if (person.bmi > 25) points += penalty
  if (person.smoker === 'S') points += penalty;
  if (person.alcohol > 10) points += penalty

  penalty = 30;
  if (person.health.includes('HEART')) points += penalty;
  if (person.bmi > 30) points += penalty
  if (person.alcohol > 25) points += penalty

  return {
    ...person,
    debit: points,
  }
};

const calculateCoveragePrice = person => {
  let coveragePrice = 0.10;
  if (person.age < 40 && person.smoker === 'NS') { /* No change from base price */ }
  if (person.age < 40 && person.smoker === 'S') coveragePrice = 0.25;
  if (person.age >= 40 && person.smoker === 'NS') coveragePrice = 0.30;
  if (person.age >= 40 && person.smoker === 'S') coveragePrice = 0.55;

  return {
    ...person,
    coveragePrice,
  }
};

const calculatePremiumMultiplier = person => {
  let multiplier = 1.0;
  if (person.debit > 50) { /*-- Follow up interview --*/ }
  if (person.debit > 75) multiplier = 1.15;
  if (person.debit > 100) multiplier = 1.25;

  return {
    ...person,
    multiplier,
  }
};

const calculatePremium = person => ({
  ...person,
  premium: (person.multiplier * (person.coveragePrice * (person.policyrequested / 1000))).toFixed(2)
});

const test = data
  .map(processNumbers)
  .map(calculateBmi)
  .map(calculateDebitPoints)
  .map(calculateCoveragePrice)
  .map(calculatePremiumMultiplier)
  .map(calculatePremium);

console.log(test[0]);

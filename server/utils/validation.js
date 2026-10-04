const mongoose = require('mongoose');

const isValidObjectId = (value) => mongoose.Types.ObjectId.isValid(value);
const isFiniteNumber = (value) => {
  const number = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(number);
};
const isPositiveNumber = (value) => isFiniteNumber(value) && Number(value) > 0;
const isNonNegativeNumber = (value) => isFiniteNumber(value) && Number(value) >= 0;
const isPositiveInteger = (value) => Number.isInteger(Number(value)) && Number(value) > 0;
const isNonNegativeInteger = (value) => Number.isInteger(Number(value)) && Number(value) >= 0;
const isValidDate = (value) => !Number.isNaN(new Date(value).getTime());
const isValidUrl = (value) => {
  try {
    const url = new URL(value);
    return ['http:', 'https:'].includes(url.protocol);
  } catch {
    return false;
  }
};

module.exports = {
  isValidObjectId,
  isFiniteNumber,
  isPositiveNumber,
  isNonNegativeNumber,
  isPositiveInteger,
  isNonNegativeInteger,
  isValidDate,
  isValidUrl,
};

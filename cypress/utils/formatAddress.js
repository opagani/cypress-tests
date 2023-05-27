const formatAddress = ({ houseNumber, directionPrefix = '', streetName, streetSuffix, city, state, postalCode }) => {
  return `${houseNumber} ${
    directionPrefix ? directionPrefix + ' ' : ''
  }${streetName} ${streetSuffix}, ${city}, ${state} ${postalCode}`;
};

module.exports = formatAddress;

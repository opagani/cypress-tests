const uploadDocument = (filePath) => {
  cy.fixture(filePath).then((fileContent) => {
    // cy.eq() - Get A DOM element at a specific index in an array of elements
    cy.get('input[type="file"]').attachFile({
      fileContent,
      filePath: filePath,
      fileName: filePath,
    });
  });
};

const uploadPDF = (filePath) => {
  cy.get('input[type="file"]').attachFile({
    filePath: filePath,
    encoding: 'base64',
  });
};

module.exports = {
  uploadDocument,
  uploadPDF,
};

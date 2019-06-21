// Retrieves API information
module.exports = function* () {

  let spec = this.request.body;
  this.body = {
    validation: false,
    reasons: [
      "Validation not implemented"
    ],
    spec: spec
  }
};

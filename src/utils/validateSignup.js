const validator = require("validator");

function validateSignup(req) {
  const { firstname, lastname, password, email } = req.body;

  if (!firstname || !lastname) {
    throw new Error("firstName and lastName required");
  } else if (!validator.isStrongPassword(password)) {
    throw new Error("Password must be strong and at least 8 char long");
  } else if (!validator.isEmail(email)) {
    throw new Error("Email is invalid");
  }
}

module.exports = validateSignup;

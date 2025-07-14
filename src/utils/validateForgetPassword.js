const validator = require("validator");

const validateForgetPassword = (req) => {
  const { oldPassword, newPassword, confirmPassword } = req.body;

  if (!oldPassword || !newPassword || !confirmPassword) {
    throw new Error("All the fields required..");
  } else if (newPassword !== confirmPassword) {
    throw new Error("Password is not matching");
  } else if (!validator.isStrongPassword(newPassword)) {
    throw new Error("Please use strong password");
  }
};

module.exports = validateForgetPassword;

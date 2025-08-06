const validateProfileEdit = (req) => {
  const allowedItems = [
    "firstname",
    "lastname",
    "age",
    "skills",
    "gender",
    "imageurl",
    "job"
  ];

  const items = Object.keys(req.body);
  const isValidUpdate = items.every((item) => allowedItems.includes(item));
  if (!isValidUpdate) {
    throw new Error("Invalid update");
  }
};

module.exports = validateProfileEdit;

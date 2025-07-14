const adminAuth = (req, res, next) => {
  let token = "xyz";
  let authentication = token === "xyz";
  if(!authentication){
     return res.send("Invalid request");
  } else{
    next();
  }
}

module.exports = adminAuth
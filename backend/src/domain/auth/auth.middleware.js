const checkSession = (req, res, next) => {
  console.log(req.session)
  next()
}

module.exports = {
  checkSession,
}

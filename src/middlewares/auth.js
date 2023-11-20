const jwt = require("jsonwebtoken");

function authenticateToken(req, res, next) {
  const token = req.cookies.access_token;
  if (token == null) return res.sendStatus(401);
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = {
      ...user,
      token: token,
    };
    next();
  });
}

module.exports = authenticateToken;

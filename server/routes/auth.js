const express = require("express");
const router = express.Router();
const c = require("../controllers/auth.controller");

router.post("/login", c.login);
router.post("/register", c.register);

module.exports = router;

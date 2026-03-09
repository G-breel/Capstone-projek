const express = require("express")
const router = express.Router()

router.get("/", (req, res) => {
  res.json({
    message: "Wishlist API working"
  })
})

module.exports = router
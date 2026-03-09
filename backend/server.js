const express = require("express")
const cors = require("cors")

const dashboardRoutes = require("./routes/dashboardRoutes")
const transaksiRoutes = require("./routes/transaksiRoutes")
const wishlistRoutes = require("./routes/wishlistRoutes")

const app = express()

app.use(cors())
app.use(express.json())

app.use("/api/dashboard", dashboardRoutes)
app.use("/api/transaksi", transaksiRoutes)
app.use("/api/wishlist", wishlistRoutes)

app.listen(8000, () => {
  console.log("Server running on port 8000")
})
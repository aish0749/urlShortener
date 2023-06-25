const express = require('express')
const app = express()
const shortid = require('shortid')

app.set('view engine', 'ejs')
app.use(express.urlencoded({ extended: false }))

const redis = require("redis");
// Connect to redis at 127.0.0.1 port 6379 no password.
const client = redis.createClient();
(async () => {
    await client.connect();
})();
console.log("Connecting to the Redis");
client.on("ready", () => {
    console.log("Connected!");
});
client.on("error", (err) => {
    console.log("Error in the Connection");
});



let hostURL = process.env.HOST || "http://localhost:5000/"
let prevUrl = ""

app.get('/', async (req, res) => {
  res.render('index', {prevUrl: prevUrl})
})

app.post('/shortUrls', async (req, res) => {
  let fullUrl = req.body.fullUrl
  let newShortUrl = shortid.generate()
  await client.hSet("short-url:redis", newShortUrl, fullUrl)
  prevUrl = hostURL+newShortUrl
  console.log("Full url : ", fullUrl, " shortened to ", prevUrl);
  res.redirect('/')
})

app.get('/:shortUrl', async (req, res) => {
  let shortUrl = req.params.shortUrl
  let fullUrl = await client.hGet("short-url:redis", shortUrl)
  res.redirect(fullUrl)
})

app.listen(process.env.PORT || 5000);
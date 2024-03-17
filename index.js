require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const mongoose = require('mongoose');
const dns=require('dns')
const urlparser=require('url')
// const {MongoClient}=require('mongodb');

// const client=new MongoClient(process.env.DB_URL);
// const db=client.db("urlshortner")
// const urls=db.collection("urls");
// Basic Configuration

const port = process.env.PORT || 3000;

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('Connected to MongoDB');
}).catch((error) => {
  console.error('Error connecting to MongoDB:', error);
});

// Define URL schema
const urlSchema = new mongoose.Schema({
  originalUrl: String,
  shortUrl: String
});

// Create URL model
const Url = mongoose.model('Url', urlSchema);

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended:true}));

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.post('/api/shorturl', function(req, res) {
  const url=req.body.url;
  const dnslookup=dns.lookup(urlparser.parse(url).hostname,
  async (err,address)=>{
    if(!address){
      res.json({error:"Invalid URL"})
    }
    else{
      const urlCount=await Url.countDocuments({})
      const newUrl = new Url({
        originalUrl: url,
        shortUrl: urlCount
      });
      await newUrl.save();
      // console.log(result);
      res.json({original_url:url,short_url:urlCount})
    }
  })
 });

//  //route to hadle the get request
//  app.get('/api/shorturl/:short_url',async(req,res)=>{
//   const shorturl=req.params.short_url
//   const urlDoc=await Url.findOne({short_url:+shorturl})
//   res.redirect(urlDoc.url)
//  })

// Route to handle the GET request for redirection
 // Route to handle the GET request for redirection
app.get('/api/shorturl/:short_url', async (req, res) => {
  const shorturl = parseInt(req.params.short_url); // Parse short_url as an integer
  const urlDoc = await Url.findOne({ shortUrl: shorturl });

  if (urlDoc) {
    res.redirect(urlDoc.originalUrl); // Redirect to the original URL
  } else {
    res.status(404).json({ error: 'Short URL not found' });
  }
});




app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});

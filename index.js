const cors = require('cors');

const functions = require('firebase-functions');
require("dotenv").config();
const scraper = require("./scraper");
const express = require("express");
const app = express();

const bodyparser = require("body-parser");
const Product = require("./models/product");
const schedule = require("node-schedule");

app.use(cors());
app.use(express.static('build'))
app.use(bodyparser.json());






app.get("/api/products", async (req, res) => {
  Product.find({}).then(products => {
    res.json(products.map(product => product.toJSON()));
  });
});

app.post("/api/products", async (req, res) => {
  const body = req.body;

  console.log(body.url);
  const verkkisData = await scraper.scrapeVkPage('https://www.verkkokauppa.com/fi/product/' + body.url);
  console.log(verkkisData);

  const product = new Product({
    name: verkkisData.name,
    url: verkkisData.url,
    price: verkkisData.price,
    img: verkkisData.image
  });

  product.save().then(savedProduct => {
    res.json(savedProduct.toJSON());
  })
    .catch(error => 
    console.log(error))
});

app.delete('/api/products/:id', (req, res) => {
  Product.findByIdAndDelete(req.params.id)
    .then(result => {
    res.status(204).end()
    })
    .catch(error => {
    console.log(error)
  })
}) 

const UpdateDB = async () => {
  Product.find({}).then(products => {
    console.log(products.map(product => product.toJSON()));

    const toUpDate = products.map(p => p.url);
    const newScrape = async i => {
      const upDatedScrape = await scraper.scrapeVkPage(toUpDate[i]);
      console.log(products[i]._id);
      Product.findByIdAndUpdate(products[i]._id, upDatedScrape[i], { new: true })
        .then(upDatedProduct => {
          console.log(upDatedProduct.toJSON());
        })
        .catch(error => {
          console.log(error);
        });
    };

    for (let i = 0; i < toUpDate.length; i++) {
      newScrape(i);
    }
  });
};

schedule.scheduleJob({ hour: 9, minute: 00 }, function() {
  console.log("Päivitys käynnissä");
  UpdateDB();
});

// const PORT = process.env.PORT;
// app.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
// });


// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
exports.app = functions.https.onRequest(app);
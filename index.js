const { MongoClient, ServerApiVersion, Collection } = require('mongodb');
require('dotenv').config()
const express = require("express")
const cors = require("cors")
const port = process.env.PORT || 5000
const app = express()


// mid ware
app.use(cors())
app.use(express.json())


const usrName = process.env.MONGO_USERNAME
const PASS = process.env.MONGO_PASS


const uri = `mongodb+srv://${usrName}:${PASS}@cluster0.xbiw867.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const collection = client.db("CarDB").collection("CarCollection")
    const cartCollection = client.db("CarDB").collection("CartCollection")


    app.get("/brands", async (req, res) => {
      const cursor = collection.find()
      const result = await cursor.toArray()
      res.send(result)
    })


    app.get("/brands/:brand", async (req, res) => {
      const brandName = req.params.brand;
      const DATA = await collection.find({
        "car_brands.name": brandName
      }).toArray();

      if (DATA.length > 0) {
        const result = DATA[0].car_brands.find(brand => brand.name === brandName);
        res.send(result);
        return
      }

    });






    // this will update model information(update.jsx-45)
    app.put("/brands/:brand", async (req, res) => {
      const brand = req.params.brand
      const value = req.body
      const find = { "car_brands.name": brand }
      const updateCart = { $set: { "car_brands.$.models": value } }

      const result = collection.updateOne(find, updateCart)
      res.send(result)

    })


    //this will update the brand name (update.jsx-53)
    app.put("/brandName/:brand", async (req, res) => {
      const brandName = req.params.brand
      const brandNewName = req.body.name //using .name after body cuz sending {name:"the name"} like this on body while fetching at update.jsx-58
      const findQuery = { "car_brands.name": brandName }
      const update = { $set: { "car_brands.$.name": brandNewName } };
      const result = await collection.updateOne(findQuery, update)
      res.send(result)

    })





    // cart items  

    app.put("/delete/cart/:email", async (req, res) => {
      const email = req.params.email
      const value = req.body
      const findQuery = { email: email }
      const option = { upsert: true }
      const updateCart = {
        $set: {
          cartItem: value
        }
      }

      const result = cartCollection.updateOne(findQuery, updateCart, option)
      res.send(result)

    })

    app.get("/getCartItems/:email", async (req, res) => {
      const email = req.params.email
      const cursor = await cartCollection.findOne({ email: email })
      res.send(cursor)
    })


    app.post("/create/cart/:email", async (req, res) => {
      const email = req.params.email
      const cursor = req.body
      const oldEmail = await cartCollection.findOne({ email: email })

      if (oldEmail) {
        return ""
      }

      else {
        const result = await cartCollection.insertOne(cursor)
        res.send(result)
      }

    })


    app.put("/addItem/:email", async (req, res) => {

      const email = req.params.email
      const value = req.body
      const option = { upsert: true }
      const query = { email: email }
      const updateCart = {
        $set: {
          cartItem: value
        }
      }

      const result = await cartCollection.updateOne(query, updateCart, option)
      res.send(result)
    })


    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error

  }
}
run().catch(console.dir);




app.get("/", (req, res) =>
  res.send("hey")
)


app.listen(port, () => {
  console.log(`port is : ${port}`)
})
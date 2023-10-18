const { MongoClient, ServerApiVersion, Collection } = require('mongodb');
require('dotenv').config()
const express = require("express")
const cors = require("cors")
const port = process.env.PORT || 5000
const app = express()


// mid ware
app.use(cors())
app.use(express())


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
        const result = DATA[0].car_brands.find(brand => brand.name === brandName).models;
        res.send(result);
        return
      }

    });

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
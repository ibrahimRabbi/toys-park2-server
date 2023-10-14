const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const stripe = require('stripe')("sk_test_51NFaHHHYxG7WJPCTo6DyF8n9Ty7LHso58T2LKEWbMN1RnwDs6Vdb8c1AIEk6ywGP4JAayNmD8PMlNtmwQBIsvcjK00SvyfXze0")
var jwt = require('jsonwebtoken');
const express = require('express')
const cors = require('cors')
require('dotenv').config()
const app = express();
const port = process.env.PORT || 5000

//middlewere
app.use(express.json())
app.use(cors())

const accessToken = "11b9f30ffe457554a235d7011288010a3ac858fbbce0b5e3690e41386f14b8c6f54c7466df42066dbb7d66f3a3b40d5352c99badad7914f1813d26aaf2aa033d"



const name = process.env.MONGO_USER
const password = process.env.MONGP_PASS
const uri = `mongodb+srv://${name}:${password}@cluster0.oqkryfl.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

const dataCollaction = client.db('toys-park-2').collection('data')
const cartCollaction = client.db('toys-park-2').collection('cart')
const userCollaction = client.db('toys-park-2').collection('user')
const paymentCollaction = client.db('toys-park-2').collection('payment')
async function run() {
    try {
        // await client.connect();


        app.get('/data/:category', async (req, res) => {

            let query = {}
            let sort = {}

            if (req.params.category) {
                query = { category: req.params.category }
            }
            if (req.params.category === 'marvel') {
                query = { category: "marvel" }
            }
            if (req.params.category === 'avangers' || req.params.category === 'spiderman') {
                query = { subCategory: req.params.category }
            }
            if (req.query.sort === 'Low price') {
                sort = { price: 1 }
            }
            if (req.query.sort === 'High price') {
                sort = { price: -1 }
            }

            if (req.query.sort === 'Rating') {
                query = { rating: 5 }
            }

            const data = dataCollaction.find(query).sort(sort)
            const final = await data.toArray()
            res.send(final)
        })



        app.get('/data', async (req, res) => {
            let query = {}
            let sort = {}
            if (req.query.email) {
                query = { email: req.query.email }
            }

            if (req.query.sort === 'Low price') {
                sort = { price: 1 }
            }
            if (req.query.sort === 'High price') {
                sort = { price: -1 }
            }

            if (req.query.sort === 'Rating') {
                query = { rating: 5 }
            }

            if (req.query.rating) {
                query = { rating: parseFloat(req.query.rating) }

            }

            if (req.query.search) {
                query = { name: { $regex: req.query.search, $options: 'i' } }
            }

            const data = dataCollaction.find(query).sort(sort)
            const final = await data.toArray()
            res.send(final)
        })




        app.post('/data', async (req, res) => {
            const obj = req.body
            const inserted = await dataCollaction.insertOne(obj)
            res.send(inserted)
        })

        app.delete('/data/:id', async (req, res) => {
            const id = { _id: new ObjectId(req.params.id) }
            const delet = await dataCollaction.deleteOne(id)
            res.send(delet)
        })

        app.get('/id/:id', async (req, res) => {
            const id = { _id: new ObjectId(req.params.id) }
            const data = await dataCollaction.findOne(id)
            res.send(data)
        })

        app.post('/cart', async (req, res) => {
            console.log(req.body)
            const inserted = await cartCollaction.insertOne(req.body)
            res.send(inserted)
        })

        app.get('/cart', async (req, res) => {
            const query = { userMail: req.query.email }
            const data = await cartCollaction.find(query).toArray()
            res.send(data)
        })

        app.delete('/cart/:id', async (req, res) => {
            const id = { _id: new ObjectId(req.params.id) }
            const delet = await cartCollaction.deleteOne(id)
            res.send(delet)
        })

        app.post('/user', async (req, res) => {
            const inserted = await userCollaction.insertOne(req.body)
            res.send(inserted)
        })

        app.get('/user', async (req, res) => {
            const query = { email: req.query.email }
            const user = await userCollaction.findOne(query)
            res.send(user)
        })

        app.put('/update/:id', async (req, res) => {
            const id = req.params.id
            const dataobj = req.body
            const filter = { _id: new ObjectId(id) };
            const options = { upsert: true };
            const updateData = {
                $set: {
                    name: dataobj.name,
                    price: dataobj.price,
                    image: dataobj.image,
                    category: dataobj.category,
                    subCategory: dataobj.subCategory,
                    description: dataobj.description,
                },
            };
            const result = await dataCollaction.updateOne(filter, updateData, options);
            res.send(result)
        })





        app.post("/create-payment-intent", async (req, res) => {
            const { price } = req.body;
            const paymentIntent = await stripe.paymentIntents.create({
                amount: price * 100,
                currency: "bdt",
                payment_method_types: ["card"],
            });
            res.send({
                clientSecret: paymentIntent.client_secret,
            });
        });

        app.post('/payment', async (req, res) => {
            const data = req.body
            const inserted = await paymentCollaction.insertOne(data)
            res.send(inserted)
        })



    } finally {
    }
}

run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('hello world')
})

app.listen(port, () => {
    console.log('app is running')
})

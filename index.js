const express = require('express');
const { MongoClient } = require('mongodb');
require('dotenv').config();

const cors = require('cors');
const ObjectId = require('mongodb').ObjectId;

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.r3mg5.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
        //database connection
        await client.connect();
        const database = client.db('bestBuy');
        const usersCollection = database.collection('users');
        const productsCollection = database.collection('products');
        const ordersCollection = database.collection('orders');
        const reviewsCollection = database.collection('reviews');
        // All Users API 
        app.get('/user', async (req, res) => {
            const cursor = usersCollection.find({});
            const users = await cursor.toArray();
            res.send(users);
        })
        //get single User API
        app.get('/user/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email:email }
            const user = await usersCollection.findOne(query)
            let isAdmin = false;
            if(user?.role === 'admin'){
                isAdmin = true;
            }
            res.json({admin:isAdmin})
        })

        //New User API
        app.post('/user', async (req, res) => {
            const user = req.body;
            const result = await usersCollection.insertOne(user);
            res.json(result);
        })
        //Update User API
        app.put('/user', async (req, res) => {
            const user = req.body;
            const query = {email: user.email};
            const options = {upsert: true};
            const updateDoc = {$set:user}
            const result = await usersCollection.updateOne(query, updateDoc, options);
            res.json(result);
        })
        app.put('/user/make-admin', async (req, res) => {
            const user = req.body;
            const query = {email: user.email};
            const updateDoc = {$set:{role:'admin'}}
            const result = await usersCollection.updateOne(query, updateDoc);
            res.json(result);
        })


        // User delete API
        app.delete('/user/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await usersCollection.deleteOne(query);
            res.json(result);
        })

        //get products API

        app.get('/product', async (req, res) => {
            const cursor = productsCollection.find({});
            const products = await cursor.toArray();
            res.send(products)
        })
        //get single product API
        app.get('/product/:productId', async (req, res) => {
            const id = req.params.productId;
            const query = { _id: ObjectId(id) }
            const product = await productsCollection.findOne(query)
            console.log(product)
            res.json(product)
        })

        //POST API
        app.post('/product', async (req, res) => {
            const product = req.body;
            const result = await productsCollection.insertOne(product);
            res.json(result);
        })


        // product delete API
        app.delete('/product/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await productsCollection.deleteOne(query);
            res.json(result);
        })


        // New Order API 
        app.post('/order', async (req, res) => {
            const order = req.body;
            const result = await ordersCollection.insertOne(order);
            res.json(result);
        })
        // All Orders  API 
        app.get('/order', async (req, res) => {
            const cursor = ordersCollection.find({});
            const order = await cursor.toArray();
            res.json(order)
        })
        // Order status API 
        app.put('/order/:id', async (req, res) => {
            const id = req.params.id;
            const data = req.body;
            const result = await ordersCollection.updateOne(
                { "_id": ObjectId(id) },
                { $set: data }
            );
            res.json(result);
        })
        // Delete order API 
        app.delete('/order-delete/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await ordersCollection.deleteOne(query);
            res.json(result);
        })

        // New Review API 
        app.post('/review', async (req, res) => {
            const review = req.body;
            const result = await reviewsCollection.insertOne(review);
            res.json(result);
        })
        // All Review  API 
        app.get('/review', async (req, res) => {
            const cursor = reviewsCollection.find({});
            const review = await cursor.toArray();
            res.json(review)
        })
        // Delete order API 
        app.delete('/review/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await reviewsCollection.deleteOne(query);
            res.json(result);
        })
    }
    finally {
        // await client.close()
    }
}

run().catch(console.dir)

app.get('/', (req, res) => {
    res.send('Best Buy server running')
})

app.listen(port, () => {
    console.log('Server port :', port);
})


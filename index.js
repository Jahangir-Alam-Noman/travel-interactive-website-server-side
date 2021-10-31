const express = require('express');
const { MongoClient } = require('mongodb');
const app = express();
const cors = require('cors');
const ObjectId = require('mongodb').ObjectId;
require('dotenv').config();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.veusr.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });


async function run() {
    try {

        await client.connect();
        const database = client.db("travelDB");
        const packagesCollection = database.collection("packages");
        const bookedPackageCollection = database.collection("booked_Package");

        // get api for all packages
        app.get('/packages', async (req, res) => {
            const cursor = packagesCollection.find({});
            const result = await cursor.toArray();
            res.send(result);
        })

        // get  api for single package
        app.get('/packages/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const package = await packagesCollection.findOne(query);
            res.json(package);
        })

        // get api for manage all booking package
        app.get('/manage', async (req, res) => {
            const cursor = bookedPackageCollection.find({});
            const result = await cursor.toArray();
            res.send(result);
        })

        // get api for My booking  package
        app.get('/booking/:email', async (req, res) => {
            const cursor = bookedPackageCollection.find({
                email: req.params.email
            });
            const result = await cursor.toArray();
            res.send(result);
        })

        // post api for adding package
        app.post('/packages', async (req, res) => {
            const package = req.body;
            const result = await packagesCollection.insertOne(package);
            res.send(result);
        })

        // post  api for Single booking package
        app.post('/packages/:id', async (req, res) => {
            const bookedPackage = req.body;
            const result = await bookedPackageCollection.insertOne(bookedPackage);
            res.send(result);
        })


        // delete api from manage 
        app.delete('/manage/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await bookedPackageCollection.deleteOne(query);
            res.json(result);
        })

        // delete api from My booked package
        app.delete('/manage/booked/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await bookedPackageCollection.deleteOne(query);
            res.json(result);
        })

        //  api for  update status
        app.put('/manage/status/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    status: "Approved"
                },
            };
            const result = await bookedPackageCollection.updateOne(filter, updateDoc, options);
            res.send(result);
        })

    } finally {
        // await client.close();
    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('V-travel Server is running!');
})

app.listen(port, () => {
    console.log('Server running at port', port);
})
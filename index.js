const { MongoClient } = require('mongodb');
const express = require('express')
const cors = require('cors');
const ObjectId = require('mongodb').ObjectId;
const fileUpload = require('express-fileupload')


const app = express()
const port = process.env.PORT || 5000;

require("dotenv").config();


// middleware
app.use(cors());
app.use(express.json());
app.use(fileUpload());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.PASS_USER}@cluster0.fjj4l.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
        await client.connect();
        const database = client.db('healthCare');
        const servicesCollection = database.collection('services');
        const doctorsCollection = database.collection('doctors');
        const appointmentsCollection = database.collection('appointments');
        const usersCollection = database.collection('users');


        // Add Service
        app.post('/services', async (req, res) => {

            const name = req.body.name;
            const description = req.body.description;
            const number = req.body.number;
            const pic = req.files.image;
            const picData = pic.data;
            const encodedPic = picData.toString('base64');
            const imageBuffer = Buffer.from(encodedPic, 'base64');

            const service = {
                name,
                description,
                number,
                image: imageBuffer
            }
            const result = await servicesCollection.insertOne(service);
            console.log('body', req.body);
            console.log('files', req.files);

            res.json(result);
        });

        // Get All Services
        app.get('/services', async (req, res) => {
            const cursor = servicesCollection.find({});
            const services = await cursor.toArray();
            res.json(services);
        });

        // Get Service Details
        app.get("/serviceDetails/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const service = await servicesCollection.findOne(query);
            res.json(service);
        })

        // Add Doctor
        app.post('/doctors', async (req, res) => {

            const doctorName = req.body.doctorName;
            const doctorDetail = req.body.doctorDetail;
            const pic = req.files.doctorImage;
            const picData = pic.data;
            const encodedPic = picData.toString('base64');
            const imageBuffer = Buffer.from(encodedPic, 'base64');

            const doctor = {
                doctorName,
                doctorDetail,
                doctorImage: imageBuffer
            }
            const result = await doctorsCollection.insertOne(doctor);
            console.log('body', req.body);
            console.log('files', req.files);

            res.json(result);
        });

        // Get All Doctors
        app.get('/doctors', async (req, res) => {
            const cursor = doctorsCollection.find({});
            const doctors = await cursor.toArray();
            res.json(doctors);
        });

        // Get Doctors Details
        app.get("/doctorDetails/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const doctor = await doctorsCollection.findOne(query);
            res.json(doctor);
        })

        // Add A Appointment / Add A Booking / Add A Order
        app.post('/appointments', async (req, res) => {
            const appointment = req.body;
            const result = await appointmentsCollection.insertOne(appointment);
            res.json(result)
        });

        
        // Get My Appointments
        app.get("/myAppointments/:email", async (req, res) => {
            const result = await appointmentsCollection
                .find({ email: req.params.email })
                .toArray();
            res.json(result);
        });

        /// Delete My Appointments
        app.delete("/deleteAppointment/:id", async (req, res) => {
            const result = await appointmentsCollection.deleteOne({
                _id: ObjectId(req.params.id),
            });
            res.send(result);
        });
        


        // Add A Users 

        app.post('/users', async (req, res) => {
            const user = req.body;
            const result = await usersCollection.insertOne(user);
            res.json(result);
        });

        // Add A User For Google Sing In and Login

        app.put('/users', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email };
            const options = { upsert: true };
            const updateDoc = { $set: user };
            const result = await usersCollection.updateOne(filter, updateDoc, options);
            res.json(result);
        });

        // Make Admin
        app.put('/users/admin', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email };
            const updateDoc = { $set: { role: 'admin' } };
            const result = await usersCollection.updateOne(filter, updateDoc);
            res.json(result);
        })

        //  Check Admin

        app.get('/users/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const user = await usersCollection.findOne(query);
            let isAdmin = false;
            if (user?.role === 'admin') {
                isAdmin = true;
            }
            res.json({ admin: isAdmin });
        })


    }
    finally {
        // await client.close();
    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Running Health-care-server')
})

app.listen(port, () => {
    console.log(`Example app listening at${port}`)
})
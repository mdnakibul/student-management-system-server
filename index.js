const express = require('express');
const port = 5000;
const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectId
var cors = require('cors')
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express()

// Middle wares 

app.use(cors())
app.use(bodyParser.json());
app.use(express.static('doctors'));

// Connect to mongodb 

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.snl1n.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

client.connect(err => {
  const studentCollection = client.db(process.env.DB_NAME).collection("students");
  // Perform actions here 
  console.log('MongoDB connected');

  // Add a new student 
  app.use(express.json());
  app.post('/addStudent', (req, res) => {
    const newStudent = req.body;
    console.log(req.body);
    studentCollection.insertOne(newStudent)
      .then(result => {
        console.log(result);
        res.send(result.acknowledged)
      })
      .catch(error => {
        console.log(error);
      })
  });

  // Get All Students 
  app.use(express.json());
  app.get('/students', (req, res) => {
    studentCollection.find({})
      .toArray((err, documents) => {
        res.send(documents);
      })
  });

  // Load single student 
  app.use(express.json());
  app.get('/student/:studentId', (req, res) => {
    studentCollection.find({ _id: ObjectId(req.params.studentId) })
      .toArray((err, documents) => {
        res.send(documents[0])
      })
  });

  // Delete student 
  app.use(express.json());
  app.delete('/deleteStudent/:studentId', (req, res) => {
    studentCollection.deleteOne(
      { _id: ObjectId(req.params.studentId) } // specifies the document to delete
    ).then(
      result => {
        console.log(result);
        res.send(result.deletedCount > 0);
      }
    ).catch(error => {
      console.log(error);
    })
  })

  // update student details 
  
  app.patch('/update-student/:studentId', (req, res) => {
    // Getting Data from front-end 
    const updatedData = req.body;
    console.log(updatedData);
    const { name, registration, id, photo } = updatedData;

    // Updating data on the database 
    studentCollection.updateOne({_id:ObjectId(req.params.studentId)},{
      $set:{
          name: name,
          registration: registration,
          id: id,
          photo: photo
      }
    }).then(result => {
        console.log(result);
        res.send(result.modifiedCount > 0);
      })
      .catch(err => console.log(err))
  })

})

app.use(express.json());
// Home Page 
app.get('/', (req, res) => {
  res.send('Hello World!')
})
app.listen(process.env.PORT || port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})
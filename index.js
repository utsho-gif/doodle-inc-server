const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const { MongoClient, ServerApiVersion } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;

//middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster.sp7tsve.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    await client.connect();
    const blogsCollection = client.db('doodle-inc').collection('blogs');
    const commentsCollection = client.db('doodle-inc').collection('comments');

    //get all blogs
    app.get('/blogs', async (req, res) => {
      const query = {};
      const cursor = blogsCollection.find(query);
      const blogs = await cursor.toArray();
      res.send(blogs);
    });

    //get all comments
    app.get('/comments', async (req, res) => {
      const query = {};
      const cursor = commentsCollection.find(query);
      const comments = await cursor.toArray();
      res.send(comments);
    });

    //get individual comments
    app.get('/comments/:blogId', async (req, res) => {
      const blogId = parseInt(req.params.blogId, 10);

      if (!blogId) {
        return res.status(400).send({ message: 'Blog ID is required' });
      }

      try {
        const blog = await blogsCollection.findOne(
          { id: blogId },
          { projection: { _id: 0, body: 1, title: 1 } }
        );

        if (!blog) {
          return res.status(404).send({ message: 'Blog not found' });
        }

        const comments = await commentsCollection
          .find({ blogId: blogId })
          .toArray();

        res.send({ blog, comments });
      } catch (error) {
        res.status(500).send({ message: error.message });
      }
    });
  } finally {
  }
}
run().catch(console.dir);

app.get('/', (req, res) => {
  res.send('working');
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});

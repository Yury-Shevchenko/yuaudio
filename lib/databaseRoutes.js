const Archetype = require('archetype-js');
const BookType = require('./book');
const { ObjectId } = require('mongodb');

const multer = require('multer');
const fs = require('fs');

const express = require('express');
const passport = require('passport');

const router = express.Router();

const mongoose = require('mongoose');

const Record = mongoose.model('record');

router.get('/', async (req, res) => {
  const records = await Record.find({ user: req.user._id }).sort({
    createdAt: -1,
  });
  res.send(records);
});

router.get('/user/:id', async (req, res) => {
  const records = await Record.find({ user: req.params.id }).sort({
    createdAt: -1,
  });
  res.send(records);
});

router.get('/play/:id', async (req, res) => {
  const record = await Record.findOne({
    _id: req.params.id,
  });
  const filename = `./files/${record.filename}.mp3`;
  res.download(filename);
});

router.delete('/:id', async (req, res) => {
  const record = await Record.findOne({
    _id: req.params.id,
  });
  const filename = `${record.filename}.mp3`;
  const path = `./files/${filename}`;
  // delete from the file system
  await fs.unlink(path, err => {
    if (err) {
      console.error(err);
    }
  });
  const { result } = await Record.deleteOne({
    _id: req.params.id,
  });
  res.send(result);
  // return { result }
});

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, 'files');
  },
  filename(req, file, cb) {
    console.log('file', file);
    cb(null, file.originalname);
  },
});

const upload = multer({ storage }).array('file');

router.post('/upload', async (req, res) => {
  upload(req, res, async function(err) {
    if (err instanceof multer.MulterError) {
      return res.status(500).json(err);
    }
    if (err) {
      return res.status(500).json(err);
    }
    const { title, author, filename, survey } = req.body;
    // console.log('req.user', req.user._id)
    console.log('req.body.survey', req.body.survey);
    const record = await new Record({
      title,
      author,
      filename,
      survey,
      user: req.user._id,
    }).save();
    return res.status(200).send(record);
  });
});

module.exports = router;

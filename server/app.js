const express = require('express');
const cors = require('cors');
const logger = require('./middleware/logger');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const { speechToText } = require('./controllers/speechToText');

const app = express();

app.use(cors());
app.use(logger);

app.get('/', (req, res) => {
    res.send('Transcription server online and available!');
});

app.post('/speech-to-text', upload.single('audio'), speechToText);

module.exports = app;
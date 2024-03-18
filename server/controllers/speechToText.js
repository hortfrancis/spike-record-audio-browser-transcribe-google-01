const { transcribeEnglish } = require('../services/googleCloud');
const fs = require('fs');
const path = require('path');

async function speechToText(req, res) {
    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }

    try {
        // Read the audio file
        const fileBuffer = fs.readFileSync(path.join(__dirname, '..', req.file.path));

        // Transcribe the audio file
        const results = await transcribeEnglish(fileBuffer);

        // Send the transcription response
        res.json({ transcriptions: results.map(result => result.alternatives[0].transcript) });
    } catch (error) {
        console.error('Failed to transcribe audio:', error);
        res.status(500).send('Failed to transcribe audio');
    } finally {
        // Optionally, delete the audio file after processing
        fs.unlinkSync(path.join(__dirname, '..', req.file.path));
    }
}

module.exports = { speechToText };
import { useState, useEffect } from 'react';

export default function App() {
    const [recording, setRecording] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [mediaRecorder, setMediaRecorder] = useState(null);
    const [audioChunks, setAudioChunks] = useState([]);
    const [transcriptions, setTranscriptions] = useState([]);

    useEffect(() => {
        if (audioChunks.length > 0 && !recording) {
            (async () => {
                console.log('audioChunks.length:', audioChunks.length)
                sendAudioToServer();
                // Clear the audioChunks after sending the data to the server
                setAudioChunks([]);
            })();
        }
    }, [audioChunks]);

    async function startRecording() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const recorder = new MediaRecorder(stream);
            recorder.ondataavailable = (event) => {
                setAudioChunks((currentChunks) => [...currentChunks, event.data]);
            };
            recorder.start();
            setMediaRecorder(recorder);

            console.log('Recording started');
            setRecording(true);
        } catch (error) {
            console.error('Error accessing audio device:', error);
        }
    }

    function stopRecording() {
        setProcessing(true);
        // Wait 1 second for the MediaRecorder to finish recording
        setTimeout(() => {

            // Now stop the recorder
            mediaRecorder.stop();
            setMediaRecorder(null);
            console.log('Recording stopped');
            setRecording(false);
            setProcessing(false);
        }, 1000);
    }

    async function sendAudioToServer() {
        const audioBlob = new Blob(audioChunks, { type: 'audio/flac' });
        const formData = new FormData();
        formData.append('audio', audioBlob);

        try {
            console.log('Sending audio to server...');
            const response = await fetch('http://localhost:3000/speech-to-text', {
                method: 'POST',
                body: formData,
            });
            const data = await response.json();
            console.log(data);
            setTranscriptions(prev => [...prev, ...data.transcriptions]);
        } catch (error) {
            console.error('Error sending audio to server:', error);
        }
    }

    return (
        <div className="absolute bottom-20">
            <button
                className={`px-4 py-2 text-2xl font-semibold text-white transition-colors duration-200 rounded-lg shadow 
                    ${recording ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'} `}
                onClick={!recording ? startRecording : stopRecording}
            >{!recording ? 'Speak' : 'Send'} {processing ? '⏳' : ''}</button>
            <div className="mt-4">
                {transcriptions.map((transcription, index) => (
                    <p key={index}>{transcription}</p>
                ))}
            </div>
        </div>
    )
}
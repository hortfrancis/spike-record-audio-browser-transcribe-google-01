import { useState } from 'react';

export default function App() {
    const [recording, setRecording] = useState(false);
    const [mediaRecorder, setMediaRecorder] = useState(null);
    const [audioChunks, setAudioChunks] = useState([]);

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
        if (mediaRecorder) {
            mediaRecorder.stop();
            // Reset the mediaRecorder and audioChunks state
            setMediaRecorder(null);
            setAudioChunks([]);
        }

        sendAudioToServer();

        console.log('Recording stopped');
        setRecording(false);
    }

    async function sendAudioToServer() {
        if (audioChunks.length > 0) {
            const audioBlob = new Blob(audioChunks, { type: 'audio/flac' });
            const formData = new FormData();
            formData.append('audio', audioBlob);

            try {
                const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/send-speech-audio`, {
                    method: 'POST',
                    body: formData,
                });
                const data = await response.json();
                console.log(data);
            } catch (error) {
                console.error('Error sending audio to server:', error);
            }
        }
    }

    return (
        <div className="absolute bottom-20">
            <button
                className={`px-4 py-2 text-2xl font-semibold text-white transition-colors duration-200 rounded-lg shadow 
                    ${recording ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'} `}
                onClick={!recording ? startRecording : stopRecording}
            >{!recording ? 'Speak' : 'Send'}</button>
        </div>
    )
}
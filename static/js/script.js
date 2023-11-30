let isRecording = false;
let mediaRecorder;
let audioChunks = [];

document.getElementById('toggleRecordButton').addEventListener('click', () => {
    if (!isRecording) {
        startRecording();
    } else {
        stopRecording();
    }
});

function startRecording() {
    navigator.mediaDevices.getUserMedia({ audio: true })
        .then(stream => {
            mediaRecorder = new MediaRecorder(stream);
            mediaRecorder.start();

            audioChunks = [];
            mediaRecorder.addEventListener("dataavailable", event => {
                audioChunks.push(event.data);
            });

            isRecording = true;
            document.getElementById('toggleRecordButton').textContent = '⏹️ Stop Recording';
        });
}


function stopRecording() {
    mediaRecorder.stop();
    mediaRecorder.addEventListener("stop", () => {
        const audioBlob = new Blob(audioChunks, { 'type' : 'audio/wav' });
        const audioUrl = URL.createObjectURL(audioBlob);

        // Update the existing audio element's source
        const audioPlayer = document.getElementById('audioPlayback');
        audioPlayer.src = audioUrl;
        audioPlayer.style.display = 'block'; // Make it visible if it was hidden

        sendAudioToServer(audioBlob);

        isRecording = false;
        document.getElementById('toggleRecordButton').textContent = '🔴 Start Recording';
    });
}


function sendAudioToServer(blob) {
    const formData = new FormData();
    formData.append("audio", blob);

    fetch('/transcribe', {
        method: 'POST',
        body: formData
    }).then(response => {
        return response.json();
    }).then(data => {
        // Display the transcription
        console.log( data.transcription );
        document.getElementById('transcriptionOutput').value = data.transcription;
    });
}


let isLanguageRecording = false;
let languageMediaRecorder;
let languageAudioChunks = [];

document.getElementById('toggleLanguageRecordButton').addEventListener('click', () => {
    if (!isLanguageRecording) {
        startLanguageRecording();
    } else {
        stopLanguageRecording();
    }
});

function startLanguageRecording() {
    navigator.mediaDevices.getUserMedia({ audio: true })
        .then(stream => {
            languageMediaRecorder = new MediaRecorder(stream);
            languageMediaRecorder.start();

            languageAudioChunks = [];
            languageMediaRecorder.addEventListener("dataavailable", event => {
                languageAudioChunks.push(event.data);
            });

            isLanguageRecording = true;
            document.getElementById('toggleLanguageRecordButton').textContent = 'Stop Recording';
        });
}

function stopLanguageRecording() {
    languageMediaRecorder.stop();
    languageMediaRecorder.addEventListener("stop", () => {
        const audioBlob = new Blob(languageAudioChunks, { 'type' : 'audio/wav' });
        const audioUrl = URL.createObjectURL(audioBlob);

        const audioPlayer = document.getElementById('languageAudioPlayback');
        audioPlayer.src = audioUrl;
        audioPlayer.style.display = 'block';

        sendLanguageAudioToServer(audioBlob);

        isLanguageRecording = false;
        document.getElementById('toggleLanguageRecordButton').textContent = 'Start Recording';
    });
}

function sendLanguageAudioToServer(blob) {
    const formData = new FormData();
    formData.append("audio", blob);

    fetch('/detect_language', {
        method: 'POST',
        body: formData
    }).then(response => response.json())
    .then(data => {
        document.getElementById('detectedLanguageOutput').value = data.detected_language;
        // Call translateText() after obtaining the detected language
        translateText();
    })
    .catch(error => console.error('Error:', error));
}


function translateText() {
    const originalText = document.getElementById('transcriptionOutput').value;
    const detectedLanguage = document.getElementById('detectedLanguageOutput').value;

    fetch('/translate', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: originalText, target_language: detectedLanguage })
    })
    .then(response => response.json())
    .then(data => {
        document.getElementById('translationOutput').value = data.translated_text;
    })
    .catch(error => console.error('Error:', error));
}

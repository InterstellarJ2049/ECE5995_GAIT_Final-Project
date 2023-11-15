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
        document.getElementById('transcriptionOutput').value = data.transcription;
    });
}


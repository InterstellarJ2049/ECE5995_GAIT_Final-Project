let isRecording_left = false;
let mediaRecorder_left;
let audioChunks_left = [];

let isRecording_right = false;
let mediaRecorder_right;
let audioChunks_right = [];

document.getElementById('toggleRecordButton_left').addEventListener('click', () => {
    if (!isRecording_left) {
        startRecording('toggleRecordButton_left', 'mediaRecorder_left', 'audioChunks_left', 'isRecording_left');
    } else {
        stopRecording('toggleRecordButton_left', 'mediaRecorder_left', 'audioPlayback_left', 'isRecording_left');
    }
});

document.getElementById('toggleRecordButton_right').addEventListener('click', () => {
    if (!isRecording_right) {
        startRecording('toggleRecordButton_right', 'mediaRecorder_right', 'audioChunks_right', 'isRecording_right');
    } else {
        stopRecording('toggleRecordButton_right', 'mediaRecorder_right', 'audioPlayback_right', 'isRecording_right');
    }
});

function testLog() {
    console.log('isRecording_left: ', isRecording_left)
    console.log('isRecording_right: ', isRecording_right)
    console.log('mediaRecorder_left:', mediaRecorder_left)
    console.log('mediaRecorder_right:', mediaRecorder_right)
}

function startRecording(buttonId, mediaRecorderRef, audioChuncksRef, isRecordingRef) {
    navigator.mediaDevices.getUserMedia({ audio: true })
        .then(stream => {
            if (mediaRecorderRef === 'mediaRecorder_left') {
                mediaRecorder_left = new MediaRecorder(stream);
                mediaRecorder_left.start();
            } else if (mediaRecorderRef === 'mediaRecorder_right') {
                mediaRecorder_right = new MediaRecorder(stream);
                mediaRecorder_right.start();
            }

            if (audioChuncksRef === 'audioChunks_left') {
                audioChunks_left = [];
                mediaRecorder_left.addEventListener("dataavailable", event => {
                    audioChunks_left.push(event.data);
                });
            } else if (audioChuncksRef === 'audioChunks_right') {
                audioChunks_right = [];
                mediaRecorder_right.addEventListener("dataavailable", event => {
                    audioChunks_right.push(event.data);
                });
            }

            if (isRecordingRef === 'isRecording_left') {
                isRecording_left = true;
            } else if (isRecordingRef === 'isRecording_right') {
                isRecording_right = true;
            }
            document.getElementById(buttonId).textContent = '⏹️ Stop Recording';
        });
}


function stopRecording(buttonId, mediaRecorderRef, audioPlayerId, isRecordingRef) {
    if (mediaRecorderRef === 'mediaRecorder_left') {
        mediaRecorder_left.stop();
        mediaRecorder_left.addEventListener("stop", () => {
            const audioBlob = new Blob(audioChunks_left, { 'type' : 'audio/wav' });
            const audioUrl = URL.createObjectURL(audioBlob);

            // Update the existing audio element's source
            const audioPlayer = document.getElementById(audioPlayerId);
            audioPlayer.src = audioUrl;
            audioPlayer.style.display = 'block'; // Make it visible if it was hidden

            sendAudioToServer(audioBlob, 'transcriptionOutput_left', 'left');

            isRecording_left = false;

            document.getElementById(buttonId).textContent = '🔴 Start Recording';
        });
    } else if (mediaRecorderRef === 'mediaRecorder_right') {
        mediaRecorder_right.stop();
        mediaRecorder_right.addEventListener("stop", () => {
            const audioBlob = new Blob(audioChunks_right, { 'type' : 'audio/wav' });
            const audioUrl = URL.createObjectURL(audioBlob);

            // Update the existing audio element's source
            const audioPlayer = document.getElementById(audioPlayerId);
            audioPlayer.src = audioUrl;
            audioPlayer.style.display = 'block'; // Make it visible if it was hidden

            sendAudioToServer(audioBlob, 'transcriptionOutput_right', 'right');

            isRecording_right = false;
            
            document.getElementById(buttonId).textContent = '🔴 Start Recording';
        });
    }
}


function sendAudioToServer(blob, transcriptionOutputId, sectionId) {
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
        document.getElementById(transcriptionOutputId).value = data.transcription;
        checkAndTranslate(sectionId);
    });
}


let isLanguageRecording_left = false;
let languageMediaRecorder_left;
let languageAudioChunks_left = [];

let isLanguageRecording_right = false;
let languageMediaRecorder_right;
let languageAudioChunks_right = [];

document.getElementById('toggleLanguageRecordButton_left').addEventListener('click', () => {
    if (!isLanguageRecording_left) {
        startLanguageRecording('toggleLanguageRecordButton_left');
    } else {
        stopLanguageRecording('toggleLanguageRecordButton_left');
    }
});

document.getElementById('toggleLanguageRecordButton_right').addEventListener('click', () => {
    if (!isLanguageRecording_right) {
        startLanguageRecording('toggleLanguageRecordButton_right');
    } else {
        stopLanguageRecording('toggleLanguageRecordButton_right');
    }
});

function startLanguageRecording(buttonId) {
    navigator.mediaDevices.getUserMedia({ audio: true })
        .then(stream => {
            if (buttonId === 'toggleLanguageRecordButton_left') {
                languageMediaRecorder_left = new MediaRecorder(stream);
                languageMediaRecorder_left.start();

                languageAudioChunks_left = [];
                languageMediaRecorder_left.addEventListener("dataavailable", event => {
                    languageAudioChunks_left.push(event.data);
                });

                isLanguageRecording_left = true;
                document.getElementById(buttonId).textContent = '⏹️ Stop Recording';

            } else if (buttonId === 'toggleLanguageRecordButton_right') {
                languageMediaRecorder_right = new MediaRecorder(stream);
                languageMediaRecorder_right.start();

                languageAudioChunks_right = [];
                languageMediaRecorder_right.addEventListener("dataavailable", event => {
                    languageAudioChunks_right.push(event.data);
                });

                isLanguageRecording_right = true;
                document.getElementById(buttonId).textContent = '⏹️ Stop Recording';
            }
            
        });
}

function stopLanguageRecording(buttonId) {
    if (buttonId === 'toggleLanguageRecordButton_left') {
        languageMediaRecorder_left.stop();
        languageMediaRecorder_left.addEventListener("stop", () => {
            const audioBlob = new Blob(languageAudioChunks_left, { 'type' : 'audio/wav' });
            const audioUrl = URL.createObjectURL(audioBlob);

            const audioPlayer = document.getElementById('languageAudioPlayback_left');
            audioPlayer.src = audioUrl;
            audioPlayer.style.display = 'block';

            sendLanguageAudioToServer(audioBlob, 'detectedLanguageOutput_left', 'left');

            isLanguageRecording_left = false;
            document.getElementById('toggleLanguageRecordButton_left').textContent = '🔴 Start Recording';
        });
    } else if (buttonId === 'toggleLanguageRecordButton_right') {
        languageMediaRecorder_right.stop();
        languageMediaRecorder_right.addEventListener("stop", () => {
            const audioBlob = new Blob(languageAudioChunks_right, { 'type' : 'audio/wav' });
            const audioUrl = URL.createObjectURL(audioBlob);

            const audioPlayer = document.getElementById('languageAudioPlayback_right');
            audioPlayer.src = audioUrl;
            audioPlayer.style.display = 'block';

            sendLanguageAudioToServer(audioBlob, 'detectedLanguageOutput_right', 'right');

            isLanguageRecording_right = false;
            document.getElementById('toggleLanguageRecordButton_right').textContent = '🔴 Start Recording';
        });
    }
    
}

function sendLanguageAudioToServer(blob, detectedLanguageOutputId, sectionId) {
    const formData = new FormData();
    formData.append("audio", blob);

    fetch('/detect_language', {
        method: 'POST',
        body: formData
    }).then(response => response.json())
    .then(data => {
        document.getElementById(detectedLanguageOutputId).value = data.detected_language;
        // Call translateText() after obtaining the detected language
        checkAndTranslate(sectionId);
    })
    .catch(error => console.error('Error:', error));
}


function translateText(sectionId) {
    if (sectionId === 'left') {
        const originalText = document.getElementById('transcriptionOutput_left').value;
        const detectedLanguage = document.getElementById('detectedLanguageOutput_left').value;

        fetch('/translate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ text: originalText, target_language: detectedLanguage })
        })
        .then(response => response.json())
        .then(data => {
            // Set the translated text in the textbox
            const translationOutput = document.getElementById('translationOutput_left');
            translationOutput.value = data.translated_text;

            // Request text-to-speech for the translated text
            requestTextToSpeech(data.translated_text, 'translatedAudioPlayback_left');
    })
    .catch(error => console.error('Error:', error));
    } else if (sectionId === 'right') {
        const originalText = document.getElementById('transcriptionOutput_right').value;
        const detectedLanguage = document.getElementById('detectedLanguageOutput_right').value;

        fetch('/translate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ text: originalText, target_language: detectedLanguage })
        })
        .then(response => response.json())
        .then(data => {
            // Set the translated text in the textbox
            const translationOutput = document.getElementById('translationOutput_right');
            translationOutput.value = data.translated_text;

            // Request text-to-speech for the translated text
            requestTextToSpeech(data.translated_text, 'translatedAudioPlayback_right');
        })
        .catch(error => console.error('Error:', error));
    }
    
}


function checkAndTranslate(sectionId) {
    if (sectionId === "left") {
        const originalText_left = document.getElementById("transcriptionOutput_left").value;
        const detectedLanguage_left = document.getElementById("detectedLanguageOutput_left").value;

        // Check if both text and language are available
        if (originalText_left && detectedLanguage_left) {
            translateText("left");
        }        
    } else if (sectionId === "right") {
        const originalText_right = document.getElementById("transcriptionOutput_right").value;
        const detectedLanguage_right = document.getElementById("detectedLanguageOutput_right").value;

        if (originalText_right && detectedLanguage_right) {
            translateText("right");
        }
    }
    
}


function requestTextToSpeech(translatedText, translatedAudioPlaybackRef) {
    fetch('/text_to_speech', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: translatedText })
    })
    .then(response => response.blob())
    .then(blob => {
        const url = URL.createObjectURL(blob);
        const audioPlayer = document.getElementById(translatedAudioPlaybackRef);
        audioPlayer.src = url;
        audioPlayer.style.display = 'block'; // Make the audio control visible
        // Optionally, you can automatically start playing
        // audioPlayer.play();
    })
    .catch(error => console.error('Error:', error));
}
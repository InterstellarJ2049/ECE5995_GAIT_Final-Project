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
        audioPlayer.play();
    })
    .catch(error => console.error('Error:', error));
}

// The following is for the webCam-GPT4V.

// Global variable to store the base64 image data
let base64Image = '';

// Initialize the webcam and set event listeners
function initializeWebcam() {
    const video = document.getElementById('webcam');
    const captureButton = document.getElementById('capture');

    // Initially disable the capture button
    captureButton.disabled = true;

    navigator.mediaDevices.getUserMedia({ video: true })
        .then(stream => {
            video.srcObject = stream;
            video.onloadedmetadata = () => {
                // Enable the capture button only when the video stream is ready
                captureButton.disabled = false;
            };
        })
        .catch(error => {
            console.error('getUserMedia error:', error);
            // You can update this to show an error message to the user in the UI.
        });
}

// // Function to capture image from webcam and process it
// function captureImage() {
//     const video = document.getElementById('webcam');
//     const canvas = document.getElementById('canvas');

//     const captureButton = document.getElementById('capture');
//     const capturedImage = document.getElementById('capturedImage');

//     const context = canvas.getContext('2d');

//     captureButton.onclick = () => {
//         context.drawImage(video, 0, 0, canvas.width, canvas.height);
//         base64Image = canvas.toDataURL('image/jpeg').split(',')[1];
//         imageDataURL = canvas.toDataURL('image/jpeg')
//         capturedImage.src = imageDataURL;
//         processImage(base64Image);
//     };            
// }

// Fixed the above function to the following, so that the image is captured at the first time click.
// Function to capture image from webcam and process it
function captureImage() {
    const video = document.getElementById('webcam');
    const canvas = document.getElementById('canvas');
    const context = canvas.getContext('2d');

    // Draw the video frame to the canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Get the image data URL from the canvas
    base64Image = canvas.toDataURL('image/jpeg').split(',')[1];
    imageDataURL = canvas.toDataURL('image/jpeg');

    // Optionally display the captured image on the page
    const capturedImage = document.getElementById('capturedImage');
    if (capturedImage) {
        capturedImage.src = imageDataURL;
    }

    // Process the image data
    processImage(base64Image);
}


// Function to update the file name next to the Choose File button
function updateFileName() {
    var fileInput = document.getElementById('fileInput');
    var fileChosen = document.getElementById('file-chosen');
    if (fileInput.files.length > 0) {
        fileChosen.textContent = fileInput.files[0].name;
    } else {
        fileChosen.textContent = 'No file chosen'; // Default text if no file is selected
    }
}

// Function to handle the file upload
function uploadFile() {
    const fileInput = document.getElementById('fileInput');
    const capturedImage = document.getElementById('capturedImage');
    const file = fileInput.files[0];

    if (file) {
        const reader = new FileReader();
        reader.onloadend = function() {
            // const base64Image = reader.result.split(',')[1];
            capturedImage.src = reader.result
            base64Image = reader.result.split(',')[1];
            processImage(base64Image);  // Call processImage with the base64 string
        };

        reader.readAsDataURL(file);  // Read the file and trigger reader.onloadend
    }
}

// Send the image to the server for processing
function processImage(base64Image) {
    toggleLoader(true); // Show the loader

    fetch('process_image', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ image: base64Image })
    })
    .then(response => response.json())
    .then(handleResponse)
    .catch(handleError);
}

// Handle the server response
function handleResponse(data) {
    toggleLoader(false); // Hide the loader
    if(data.error) {
        console.error(data.error);
        appendToChatbox(`Error: ${data.error}`, true);
        return;
    }
    appendToChatbox(data.choices[0].message.content);
}

// Handle any errors during fetch
function handleError(error) {
    toggleLoader(false); // Hide the loader
    console.error('Fetch error:', error);
    appendToChatbox(`Error: ${error.message}`, true);
}

// Toggle the visibility of the loader
function toggleLoader(show) {
    const loader = document.querySelector('.loader');
    if (loader) {
        if (show) {
            loader.classList.remove('d-none');
        } else {
            loader.classList.add('d-none');
        }
    }
}

function appendToChatbox(message, isUserMessage) {
    const chatbox = document.getElementById('messages');
    const messageElement = document.createElement('div');
    messageElement.className = isUserMessage ? 'text-right' : 'text-left';
    
    const bubble = document.createElement('span');
    bubble.className = `message-bubble ${isUserMessage ? 'user-message' : 'assistant-message'}`;
    bubble.textContent = message;
    bubble.innerHTML = message; // Use innerHTML to render HTML content
    // bubble.innerHTML = `<div class="message-content">${message}</div>
    //                     <div class="timestamp">${timestamp}</div>`;

    messageElement.appendChild(bubble);
    chatbox.appendChild(messageElement);
    chatbox.scrollTop = chatbox.scrollHeight; // Scroll to the bottom
}

function sendMessage() {
    const userInputField = document.getElementById('userInput');
    const userMessage = userInputField.value.trim();

    // Clear the input field immediately after the "Send" button is clicked or Enter is pressed
    userInputField.value = '';

    if (userMessage) {
        toggleLoader(true); // Show the loader
        // Append user's question to the chatbox regardless of whether an image is present
        appendToChatbox(userMessage, true); // true indicating it's a user message

        // // Prepare the payload, whether or not there is an image present
        // const payload = {
        //     image: base64Image, // this will be an empty string if no image is present
        //     message: userMessage
        // };
        // Prepare the payload, if there's an image include it, otherwise just send the message
        const payload = base64Image ? { image: base64Image, message: userMessage } : { message: userMessage };

        // Make the request to the server
        fetch('/process_image_chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        })
        .then(response => response.json())
        .then(data => {
            toggleLoader(false); // Hide the loader
            // Append the AI response to the chatbox
            // appendToChatbox(data.response, false); // false indicating it's not a user message
            console.log(data); // Check what data you're receiving
            if (data.response !== undefined) {
                appendToChatbox(data.response, false); // Display AI response in chatbox
            } else {
                appendToChatbox("No response received from the server.", false);
            }
        })
        .catch(error => {
            toggleLoader(false); // Hide the loader
            console.error('Error:', error);
            appendToChatbox(`Error: ${error.message}`, false);
        });
    } else {
        // If the user has not entered any message, inform them
        appendToChatbox('Please enter a message to send.', true);
    }
}

// Function to handle the Enter key press in the text input field
function handleEnterKeyPress(event) {
    if (event.key === 'Enter') {
        event.preventDefault(); // Prevent the default action to stop form submission
        sendMessage();
    }
}


// Function to switch the camera source
function switchCamera() {
    const video = document.getElementById('webcam');
    let usingFrontCamera = true; // This assumes the initial camera is the user-facing one

    return function() {
        // Toggle the camera type
        usingFrontCamera = !usingFrontCamera;
        const constraints = {
            video: { facingMode: (usingFrontCamera ? 'user' : 'environment') }
        };
        
        // Stop any previous stream
        if (video.srcObject) {
            video.srcObject.getTracks().forEach(track => track.stop());
        }
        
        // Start a new stream with the new constraints
        navigator.mediaDevices.getUserMedia(constraints)
            .then(stream => {
                video.srcObject = stream;
            })
            .catch(error => {
                console.error('Error accessing media devices.', error);
            });
    };
}

// Event listeners
document.addEventListener('DOMContentLoaded', function() {
    initializeWebcam();

    document.getElementById('capture').addEventListener('click', captureImage);
    document.getElementById('upload').addEventListener('click', uploadFile);
    document.getElementById('switch-camera').addEventListener('click', switchCamera());    
    document.getElementById('sendButton').addEventListener('click', sendMessage); // Event listener for the send button
    document.getElementById('userInput').addEventListener('keypress', handleEnterKeyPress); // Event listener for the Enter key press
    document.getElementById('fileInput').addEventListener('change', updateFileName); // Event listener for the file input change event

    // Other event listeners here...
});
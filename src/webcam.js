
// Global variable to store the base64 image data
let base64Image = '';

// Initialize the webcam and set event listeners
function initializeWebcam() {
    const video = document.getElementById('webcam');
    navigator.mediaDevices.getUserMedia({ video: true })
        .then(stream => {
            video.srcObject = stream;
        })
        .catch(error => {
            console.error('getUserMedia error:', error);
            // You can update this to show an error message to the user in the UI.
        });
}

// Function to capture image from webcam and process it
function captureImage() {
    const video = document.getElementById('webcam');
    const canvas = document.getElementById('canvas');
    const context = canvas.getContext('2d');
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // const base64Image = canvas.toDataURL('image/jpeg').split(',')[1];
    base64Image = canvas.toDataURL('image/jpeg').split(',')[1];
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
    const file = fileInput.files[0];
    // if (file) {
    //     // Code to send the file to the Flask backend for processing
    //     // This might involve creating a FormData object and using fetch() or XMLHttpRequest
    //     // Example: this part is incorrect, because it is already in "function processImage(base64Image)"
    //     const formData = new FormData();
    //     formData.append('file', file);        
    //     fetch('/process_image', {
    //         method: 'POST',
    //         body: formData
    //     })
    //     .then(response => response.json())
    //     .then(data => {
    //         // Handle the response from the server
    //         console.log(data);
    //     })
    //     .catch(error => console.error('Error:', error));
    // }
    if (file) {
        const reader = new FileReader();
        reader.onloadend = function() {
            // const base64Image = reader.result.split(',')[1];
            base64Image = reader.result.split(',')[1];
            processImage(base64Image);  // Call processImage with the base64 string
        };
        reader.readAsDataURL(file);  // Read the file and trigger reader.onloadend
    }
}

// Event listener for the upload button
// document.getElementById('upload').addEventListener('click', uploadFile);

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
    document.querySelector('.loader').style.display = show ? 'block' : 'none';
}

// // Append messages to the chatbox
// function appendToChatbox(message, isUserMessage = false) {
//     const chatbox = document.getElementById('chatbox');
//     const messageElement = document.createElement('div');
//     const timestamp = new Date().toLocaleTimeString(); // Get the current time as a string
    
//     // Assign different classes based on the sender for CSS styling
//     messageElement.className = isUserMessage ? 'user-message' : 'assistant-message';

//     messageElement.innerHTML = `<div class="message-content">${message}</div>
//                                 <div class="timestamp">${timestamp}</div>`;
//     if (chatbox.firstChild) {
//         chatbox.insertBefore(messageElement, chatbox.firstChild);
//     } else {
//         chatbox.appendChild(messageElement);
//     }
// }

// // Function to send user message to the server and display the response
// function sendMessage() {
//     const userInput = document.getElementById('userInput').value;
//     // Send the user input to the server
//     fetch('/process_user_input', {
//         method: 'POST',
//         headers: {
//             'Content-Type': 'application/json'
//         },
//         body: JSON.stringify({ message: userInput })
//     })
//     .then(response => response.json())
//     .then(data => {
//         // Display the response in the chatbox
//         appendToChatbox(data.response, false); // false indicating it's not a user message
//         document.getElementById('userInput').value = ''; // Clear the input field
//     })
//     .catch(error => console.error('Error:', error));
// }

// function appendToChatbox(message, isUserMessage) {
//     const chatbox = document.getElementById('chatbox');
//     const messageElement = document.createElement('div');
//     const timestamp = new Date().toLocaleTimeString(); // Get the current time as a string

//     // Different classes for user and AI messages for styling
//     messageElement.className = isUserMessage ? 'user-message' : 'assistant-message';
//     messageElement.innerHTML = `<div class="message-content">${message}</div>
//                                 <div class="timestamp">${timestamp}</div>`;

//     chatbox.appendChild(messageElement);
//     chatbox.scrollTop = chatbox.scrollHeight; // Scroll to the bottom
// }

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

// function sendMessage() {
//     const userInputField = document.getElementById('userInput');
//     // const userMessage = userInputField.value;
//     const userMessage = userInputField.value.trim();

//     if (userMessage) {
//         // Append user's question to the chatbox
//         appendToChatbox(userMessage, true); // true indicating it's a user message
//         userInputField.value = ''; // Clear the input field

//         // Send the user input to the server
//         fetch('/process_user_input', {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json'
//             },
//             body: JSON.stringify({ message: userMessage })
//         })
//         .then(response => response.json())
//         .then(data => {
//             // Append the AI response to the chatbox
//             appendToChatbox(data.response, false); // false indicating it's not a user message
//             // userInputField.value = ''; // Clear the input field
//         })
//         .catch(error => {
//             console.error('Error:', error);
//             appendToChatbox(`Error: ${error.message}`, false);
//         });
//     }
// }

// // Function to send the message and image data to the server
// function sendMessage() {
//     const userMessage = document.getElementById('userInput').value.trim();

//     if (userMessage && base64Image) {
//         appendToChatbox(userMessage, true); // true indicating it's a user message
//         const payload = {
//             image: base64Image,
//             message: userMessage
//         };

//         fetch('/process_image_chat', {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json'
//             },
//             body: JSON.stringify(payload)
//         })
//         .then(response => response.json())
//         .then(data => {
//             appendToChatbox(data.response, false); // Display AI response in chatbox
//         })
//         .catch(error => {
//             console.error('Error:', error);
//             appendToChatbox(`Error: ${error.message}`, false);
//         });

//         document.getElementById('userInput').value = ''; // Clear the input field
//     }
// }

function sendMessage() {
    const userInputField = document.getElementById('userInput');
    const userMessage = userInputField.value.trim();

    // Clear the input field immediately after the "Send" button is clicked or Enter is pressed
    userInputField.value = '';

    if (userMessage) {
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
            console.error('Error:', error);
            appendToChatbox(`Error: ${error.message}`, false);
        });
    } else {
        // If the user has not entered any message, inform them
        appendToChatbox('Please enter a message to send.', true);
    }
}

// function sendMessage() {
//     const userInputField = document.getElementById('userInput');
//     const userMessage = userInputField.value.trim();

//     // Clear the input field immediately after the "Send" button is clicked or Enter is pressed
//     userInputField.value = '';

//     if (userMessage) {
//         // Append user's question to the chatbox regardless of whether an image is present
//         appendToChatbox(userMessage, true); // true indicating it's a user message

//         // Prepare the payload, whether or not there is an image present
//         const payload = {
//             image: base64Image, // this could be an empty string if no image is present
//             message: userMessage
//         };

//         // Make the request to the server
//         fetch('/process_image_chat', {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json'
//             },
//             body: JSON.stringify(payload)
//         })
//         .then(response => {
//             if (!response.ok) {
//                 throw new Error('Network response was not ok');
//             }
//             return response.json();
//         })
//         .then(data => {
//             console.log('Data received:', data); // Log the data for debugging purposes
//             // Append the AI response to the chatbox
//             if (data.response) {
//                 appendToChatbox(data.response, false); // false indicating it's not a user message
//             } else {
//                 // If there is no 'response' key in the data, show a default message or log it
//                 console.error('No response key in the received data');
//                 appendToChatbox('No response received from the server.', false);
//             }
//         })
//         .catch(error => {
//             console.error('Error:', error);
//             appendToChatbox(`Error: ${error.message}`, false);
//         });
//     } else {
//         // If the user has not entered any message, inform them
//         appendToChatbox('Please enter a message to send.', true);
//     }
// }



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

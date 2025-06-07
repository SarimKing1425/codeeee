<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Instant Video/Audio Transcriber with History</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <style>
        body {
            font-family: 'Inter', sans-serif;
        }
        .drop-zone {
            border: 2px dashed #4a5568;
            border-radius: 0.5rem;
            padding: 2.5rem;
            text-align: center;
            cursor: pointer;
            transition: background-color 0.2s ease-in-out, border-color 0.2s ease-in-out;
        }
        .drop-zone.drag-over {
            background-color: #2d3748;
            border-color: #6366f1;
        }
        .loader {
            border: 4px solid #f3f3f3;
            border-top: 4px solid #6366f1;
            border-radius: 50%;
            width: 40px;
            height: 40px;
            animation: spin 1s linear infinite;
        }
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        /* Custom scrollbar for history */
        #history-list::-webkit-scrollbar {
            width: 8px;
        }
        #history-list::-webkit-scrollbar-track {
            background: #2d3748;
        }
        #history-list::-webkit-scrollbar-thumb {
            background-color: #4a5568;
            border-radius: 10px;
            border: 2px solid #2d3748;
        }
    </style>
</head>
<body class="bg-gray-900 text-white flex items-center justify-center min-h-screen p-4 sm:p-6">

    <div class="w-full max-w-3xl mx-auto bg-gray-800 rounded-lg shadow-2xl p-6 sm:p-8">
        
        <!-- Header -->
        <div class="text-center mb-8">
            <h1 class="text-3xl sm:text-4xl font-bold text-white mb-2">Instant Transcriber</h1>
            <p class="text-gray-400 text-base">Upload a video or audio file to get a transcription powered by Gemini.</p>
        </div>

        <!-- File Upload Section -->
        <div id="upload-container">
            <input type="file" id="file-input" class="hidden" accept="audio/*,video/*">
            <div id="drop-zone" class="drop-zone bg-gray-800 hover:bg-gray-700">
                <div class="flex flex-col items-center">
                    <svg class="w-12 h-12 text-gray-500 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M12 16.5V9.75m0 0l-3.75 3.75M12 9.75l3.75 3.75M3 17.25V6.75A2.25 2.25 0 015.25 4.5h13.5A2.25 2.25 0 0121 6.75v10.5A2.25 2.25 0 0118.75 19.5H5.25A2.25 2.25 0 013 17.25z" /></svg>
                    <p class="font-semibold text-gray-300">Drag & drop your file here</p>
                    <p class="text-sm text-gray-500">or <span class="text-indigo-400 font-medium">click to browse</span></p>
                </div>
            </div>
            <div id="file-info" class="text-center mt-4 text-gray-400 hidden">
                <p>Selected file: <span id="filename" class="font-medium text-gray-200"></span></p>
            </div>
        </div>

        <!-- Action Button -->
        <div class="mt-6 text-center">
            <button id="transcribe-btn" class="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-900 disabled:text-gray-400 disabled:cursor-not-allowed text-white font-bold py-3 px-8 rounded-lg shadow-md transition-all duration-300 transform hover:scale-105 w-full sm:w-auto" disabled>Transcribe File</button>
        </div>
        
        <!-- Result Section -->
        <div id="result-container" class="mt-8 hidden">
            <div id="loading-spinner" class="flex flex-col items-center justify-center text-center hidden"><div class="loader"></div><p class="mt-4 text-gray-300 font-medium">Transcribing, please wait...</p><p class="text-sm text-gray-500">This may take a moment for larger files.</p></div>
            <div id="transcription-output" class="hidden">
                 <h2 class="text-2xl font-bold text-white mb-4">Transcription Result</h2>
                 <div id="transcription-text" class="bg-gray-900 rounded-lg p-4 h-64 overflow-y-auto border border-gray-700 whitespace-pre-wrap"></div>
                 <div class="mt-6 flex flex-col sm:flex-row gap-4">
                     <button id="save-btn" class="flex-1 bg-teal-600 hover:bg-teal-700 text-white font-bold py-2 px-4 rounded-lg transition-colors hidden">Save to History</button>
                     <button id="copy-btn" class="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition-colors">Copy Text</button>
                     <button id="download-btn" class="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors">Download .txt</button>
                 </div>
            </div>
        </div>

        <!-- Error Message -->
        <div id="error-message" class="mt-6 bg-red-900 border border-red-700 text-red-300 px-4 py-3 rounded-lg relative hidden" role="alert"><strong class="font-bold">Error: </strong><span id="error-text" class="block sm:inline">Something went wrong.</span></div>

        <!-- History Section -->
        <div id="history-section" class="mt-10 pt-6 border-t border-gray-700">
             <h2 class="text-2xl font-bold text-white mb-4">My Saved Transcriptions</h2>
             <div id="history-list" class="max-h-80 overflow-y-auto space-y-3 pr-2">
                <!-- History items will be injected here -->
             </div>
             <p id="no-history-msg" class="text-center text-gray-500 py-4">No transcriptions saved yet.</p>
        </div>
    </div>

    <!-- Firebase SDK -->
    <script type="module">
        // --- Firebase Imports ---
        import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
        import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
        import { getFirestore, doc, collection, addDoc, onSnapshot, deleteDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

        // --- DOM Element References ---
        const dropZone = document.getElementById('drop-zone');
        const fileInput = document.getElementById('file-input');
        const fileInfo = document.getElementById('file-info');
        const filenameSpan = document.getElementById('filename');
        const transcribeBtn = document.getElementById('transcribe-btn');
        const resultContainer = document.getElementById('result-container');
        const loadingSpinner = document.getElementById('loading-spinner');
        const transcriptionOutput = document.getElementById('transcription-output');
        const transcriptionTextDiv = document.getElementById('transcription-text');
        const saveBtn = document.getElementById('save-btn');
        const copyBtn = document.getElementById('copy-btn');
        const downloadBtn = document.getElementById('download-btn');
        const errorMessage = document.getElementById('error-message');
        const errorText = document.getElementById('error-text');
        const historyList = document.getElementById('history-list');
        const noHistoryMsg = document.getElementById('no-history-msg');

        // --- App State ---
        let selectedFile = null;
        let base64AudioData = '';
        let currentTranscriptionText = '';

        // --- Firebase State ---
        let db, auth, userId, transcriptionCollectionRef;
        const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-transcriber-app';
        
        // --- Firebase Initialization ---
        try {
            const firebaseConfig = JSON.parse(typeof __firebase_config !== 'undefined' ? __firebase_config : '{}');
            const app = initializeApp(firebaseConfig);
            db = getFirestore(app);
            auth = getAuth(app);
            setupAuthListener();
        } catch(e) {
            console.error("Firebase initialization failed:", e);
            showError("Could not connect to the database. Saving will be disabled.");
        }

        /**
         * Sets up the authentication listener to get user ID and then fetches data.
         */
        function setupAuthListener() {
            onAuthStateChanged(auth, async (user) => {
                if (user) {
                    userId = user.uid;
                    transcriptionCollectionRef = collection(db, `artifacts/${appId}/users/${userId}/transcriptions`);
                    listenForHistoryChanges();
                } else {
                    // If no user, sign in.
                    try {
                        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
                            await signInWithCustomToken(auth, __initial_auth_token);
                        } else {
                            await signInAnonymously(auth);
                        }
                    } catch (error) {
                        console.error("Anonymous sign-in failed: ", error);
                        showError("Authentication failed. Cannot save or load history.");
                    }
                }
            });
        }

        /**
         * Listens for realtime updates to the user's saved transcriptions.
         */
        function listenForHistoryChanges() {
            if (!transcriptionCollectionRef) return;
            onSnapshot(transcriptionCollectionRef, (snapshot) => {
                const historyItems = [];
                snapshot.forEach((doc) => {
                    historyItems.push({ id: doc.id, ...doc.data() });
                });
                // Sort by creation date, newest first
                historyItems.sort((a, b) => b.createdAt?.seconds - a.createdAt?.seconds);
                renderHistory(historyItems);
            }, (error) => {
                console.error("Error listening to history:", error);
                showError("Could not load transcription history.");
            });
        }
        
        /**
         * Renders the list of saved transcriptions.
         * @param {Array} items - The array of transcription documents from Firestore.
         */
        function renderHistory(items) {
            historyList.innerHTML = ''; // Clear current list
            if (items.length === 0) {
                noHistoryMsg.classList.remove('hidden');
            } else {
                noHistoryMsg.classList.add('hidden');
                items.forEach(item => {
                    const div = document.createElement('div');
                    div.className = 'bg-gray-700 p-3 rounded-lg flex justify-between items-center cursor-pointer hover:bg-gray-600 transition-colors';
                    div.innerHTML = `
                        <div>
                            <p class="font-semibold text-white">${item.originalFilename || 'Untitled'}</p>
                            <p class="text-xs text-gray-400">${item.createdAt ? new Date(item.createdAt.seconds * 1000).toLocaleString() : 'Just now'}</p>
                        </div>
                        <button class="delete-btn p-2 rounded-full hover:bg-red-500/20 text-gray-400 hover:text-red-400" title="Delete">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                        </button>
                    `;

                    // Event listener to view the transcription
                    div.addEventListener('click', (e) => {
                        if (!e.target.closest('.delete-btn')) {
                            displayTranscription(item.transcriptionText);
                            filenameSpan.textContent = item.originalFilename;
                            fileInfo.classList.remove('hidden');
                            saveBtn.classList.add('hidden'); // Hide save when viewing history
                        }
                    });
                    
                    // Event listener for the delete button
                    div.querySelector('.delete-btn').addEventListener('click', async (e) => {
                        e.stopPropagation(); // Prevent card click
                        try {
                           await deleteDoc(doc(db, `artifacts/${appId}/users/${userId}/transcriptions`, item.id));
                        } catch (err) {
                           console.error("Error deleting document: ", err);
                           showError("Failed to delete transcription.");
                        }
                    });

                    historyList.appendChild(div);
                });
            }
        }


        // --- Event Listeners ---
        dropZone.addEventListener('click', () => fileInput.click());
        dropZone.addEventListener('dragover', (e) => { e.preventDefault(); dropZone.classList.add('drag-over'); });
        dropZone.addEventListener('dragleave', () => dropZone.classList.remove('drag-over'));
        dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropZone.classList.remove('drag-over');
            if (e.dataTransfer.files.length > 0) handleFileSelect(e.dataTransfer.files[0]);
        });
        fileInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) handleFileSelect(e.target.files[0]);
        });
        transcribeBtn.addEventListener('click', transcribeAudio);
        copyBtn.addEventListener('click', copyTranscription);
        downloadBtn.addEventListener('click', downloadTranscription);
        saveBtn.addEventListener('click', saveTranscription);
        
        // --- Core Functions ---
        function handleFileSelect(file) {
            hideError();
            if (!file.type.startsWith('audio/') && !file.type.startsWith('video/')) {
                showError('Invalid file type. Please select an audio or video file.');
                return;
            }
            selectedFile = file;
            filenameSpan.textContent = file.name;
            fileInfo.classList.remove('hidden');
            transcribeBtn.disabled = false;
            const reader = new FileReader();
            reader.onloadend = () => { base64AudioData = reader.result.split(',')[1]; };
            reader.onerror = () => { showError('Error reading the file. Please try again.'); };
            reader.readAsDataURL(file);
        }

        async function transcribeAudio() {
            if (!selectedFile || !base64AudioData) {
                showError('No file selected or file data is missing.');
                return;
            }
            transcribeBtn.disabled = true;
            transcribeBtn.textContent = 'Transcribing...';
            resultContainer.classList.remove('hidden');
            loadingSpinner.classList.remove('hidden');
            transcriptionOutput.classList.add('hidden');
            saveBtn.classList.add('hidden');
            hideError();
            
            const apiKey = ""; // Provided by Canvas
            const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
            const payload = { contents: [{ role: "user", parts: [{ text: "Transcribe this audio file completely and accurately. Provide only the transcribed text." }, { inlineData: { mimeType: selectedFile.type, data: base64AudioData } }] }] };

            try {
                const response = await fetch(apiUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error?.message || `HTTP error! Status: ${response.status}`);
                }
                const result = await response.json();
                if (result.candidates && result.candidates[0]?.content?.parts[0]) {
                    const text = result.candidates[0].content.parts[0].text;
                    displayTranscription(text.trim());
                    saveBtn.classList.remove('hidden'); // Show save button on success
                } else {
                    const reason = result.promptFeedback?.blockReason || 'No content';
                    displayTranscription(reason.toLowerCase() === 'safety' ? `Transcription failed due to safety reasons.` : `Transcription failed. The API returned an empty response. Reason: ${reason}`);
                }
            } catch (err) {
                console.error('Transcription failed:', err);
                showError(`An error occurred during transcription: ${err.message}`);
                displayTranscription('Failed to retrieve transcription.');
            } finally {
                loadingSpinner.classList.add('hidden');
                transcribeBtn.disabled = false;
                transcribeBtn.textContent = 'Transcribe File';
            }
        }
        
        /**
         * Saves the current transcription to Firestore.
         */
        async function saveTranscription() {
            if (!currentTranscriptionText || !selectedFile || !transcriptionCollectionRef) {
                showError("No transcription to save or database not ready.");
                return;
            }
            saveBtn.disabled = true;
            saveBtn.textContent = "Saving...";
            try {
                await addDoc(transcriptionCollectionRef, {
                    originalFilename: selectedFile.name,
                    transcriptionText: currentTranscriptionText,
                    createdAt: serverTimestamp()
                });
                saveBtn.textContent = "Saved!";
                setTimeout(() => {
                    saveBtn.classList.add('hidden');
                    saveBtn.textContent = "Save to History";
                    saveBtn.disabled = false;
                }, 2000);
            } catch (err) {
                console.error("Error saving to Firestore:", err);
                showError("Could not save transcription.");
                saveBtn.textContent = "Save to History";
                saveBtn.disabled = false;
            }
        }

        function displayTranscription(text) {
            currentTranscriptionText = text;
            transcriptionTextDiv.textContent = text;
            loadingSpinner.classList.add('hidden');
            transcriptionOutput.classList.remove('hidden');
        }

        function copyTranscription() {
            navigator.clipboard.writeText(transcriptionTextDiv.textContent).then(() => {
                copyBtn.textContent = 'Copied!';
                setTimeout(() => { copyBtn.textContent = 'Copy Text'; }, 2000);
            }).catch(err => showError('Could not copy text to clipboard.'));
        }
        
        function downloadTranscription() {
            const blob = new Blob([transcriptionTextDiv.textContent], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            const originalName = filenameSpan.textContent || selectedFile?.name || 'transcription';
            const safeFilename = originalName.split('.')[0].replace(/[^a-z0-9]/gi, '_').toLowerCase();
            a.download = `${safeFilename}_transcription.txt`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }

        function showError(message) {
            errorText.textContent = message;
            errorMessage.classList.remove('hidden');
        }
        function hideError() {
            errorMessage.classList.add('hidden');
        }
    </script>
</body>
</html>

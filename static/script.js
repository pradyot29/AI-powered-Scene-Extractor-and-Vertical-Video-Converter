document.addEventListener('DOMContentLoaded', function() {
    const videoForm = document.getElementById('videoForm');
    const submitBtn = document.getElementById('submitBtn');
    const progressContainer = document.getElementById('progressContainer');
    const progressBar = document.getElementById('progressBar');
    const progressText = document.getElementById('progressText');
    const resultContainer = document.getElementById('resultContainer');
    const resultInfo = document.getElementById('resultInfo');
    const downloadBtn = document.getElementById('downloadBtn');
    const newVideoBtn = document.getElementById('newVideoBtn');

    let currentProcessId = null;
    let statusCheckInterval = null;

    // Form submission handler
    videoForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const videoSource = document.getElementById('video_source').value.trim();
        const query = document.getElementById('query').value.trim();
        
        if (!videoSource) {
            showError('Please enter a video source (YouTube URL or file path)');
            return;
        }
        
        // Validate URL format (basic validation)
        if (videoSource.startsWith('http') && !isValidUrl(videoSource)) {
            showError('Please enter a valid URL');
            return;
        }
        
        startProcessing(videoSource, query);
    });

    // Start video processing
    function startProcessing(videoSource, query) {
        // Hide previous results and show progress
        hideElement(resultContainer);
        showElement(progressContainer);
        
        // Disable form
        disableForm();
        
        // Reset progress
        updateProgress(0, 'Starting video processing...');
        
        // Send request to backend
        fetch('/process_video', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                video_source: videoSource,
                query: query
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                throw new Error(data.error);
            }
            
            currentProcessId = data.process_id;
            // Start checking status
            checkStatus();
        })
        .catch(error => {
            console.error('Error:', error);
            showError('Failed to start processing: ' + error.message);
            enableForm();
            hideElement(progressContainer);
        });
    }

    // Check processing status
    function checkStatus() {
        if (!currentProcessId) return;
        
        statusCheckInterval = setInterval(() => {
            fetch(`/status/${currentProcessId}`)
                .then(response => response.json())
                .then(data => {
                    updateProgressFromStatus(data);
                    
                    if (data.status === 'completed') {
                        clearInterval(statusCheckInterval);
                        showResults(data);
                    } else if (data.status === 'error') {
                        clearInterval(statusCheckInterval);
                        showError(data.message || 'Processing failed');
                        enableForm();
                        hideElement(progressContainer);
                    }
                })
                .catch(error => {
                    console.error('Status check error:', error);
                    clearInterval(statusCheckInterval);
                    showError('Failed to check processing status');
                    enableForm();
                    hideElement(progressContainer);
                });
        }, 2000); // Check every 2 seconds
    }

    // Update progress based on status
    function updateProgressFromStatus(data) {
        const statusMessages = {
            'uploading': 'Uploading video to VideoDB...',
            'indexing': 'Indexing video scenes...',
            'searching': 'Searching for matching scenes...',
            'generating': 'Generating video stream...',
            'converting': 'Converting to vertical format...'
        };
        
        const message = statusMessages[data.status] || `Processing: ${data.status}`;
        const progress = data.progress || 0;
        
        updateProgress(progress, message);
    }

    // Update progress bar and text
    function updateProgress(percentage, message) {
        progressBar.style.width = percentage + '%';
        progressText.innerHTML = `${message} <span class="loading-dots"></span>`;
        
        // Add some visual feedback
        if (percentage === 100) {
            progressText.textContent = 'Processing complete! 🎉';
        }
    }

    // Show results
    function showResults(data) {
        hideElement(progressContainer);
        showElement(resultContainer);
        
        // Update result info
        const sceneFound = data.found_scene !== undefined ? data.found_scene : 'Unknown';
        const sceneFoundText = sceneFound === true ? 
            '✅ Yes - Found matching scene' : 
            '⚠️ No - Using default first 30 seconds';
        
        resultInfo.innerHTML = `
            <p><strong>Processing Status:</strong> ✅ Completed Successfully</p>
            <p><strong>Scene Query Result:</strong> ${sceneFoundText}</p>
            <p><strong>Video Format:</strong> 📱 Converted to Vertical (9:16)</p>
            <p><strong>Ready for Download:</strong> 📥 Your vertical clip is ready!</p>
        `;
        
        // Set up download button
        downloadBtn.onclick = () => downloadVideo(currentProcessId);
        
        // Add fade-in animation
        resultContainer.classList.add('fade-in');
        
        // Enable new video button
        newVideoBtn.onclick = resetForm;
    }

    // Download video
    function downloadVideo(processId) {
        if (!processId) {
            showError('No video available for download');
            return;
        }
        
        // Change button text to show downloading
        const originalText = downloadBtn.textContent;
        downloadBtn.textContent = '⏳ Preparing Download...';
        downloadBtn.disabled = true;
        
        // Create download link
        const downloadUrl = `/download/${processId}`;
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = `vertical_clip_${processId}.mp4`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Reset button after a delay
        setTimeout(() => {
            downloadBtn.textContent = originalText;
            downloadBtn.disabled = false;
        }, 3000);
    }

    // Reset form for new video
    function resetForm() {
        // Clear form
        videoForm.reset();
        
        // Hide result containers
        hideElement(resultContainer);
        hideElement(progressContainer);
        
        // Enable form
        enableForm();
        
        // Clear intervals
        if (statusCheckInterval) {
            clearInterval(statusCheckInterval);
        }
        
        // Reset variables
        currentProcessId = null;
        
        // Scroll to top
        window.scrollTo(0, 0);
    }

    // Show error message
    function showError(message) {
        // Create or update error div
        let errorDiv = document.querySelector('.error-message');
        
        if (!errorDiv) {
            errorDiv = document.createElement('div');
            errorDiv.className = 'error-message fade-in';
            videoForm.parentNode.insertBefore(errorDiv, videoForm.nextSibling);
        }
        
        errorDiv.innerHTML = `<strong>❌ Error:</strong> ${message}`;
        errorDiv.style.display = 'block';
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
            if (errorDiv && errorDiv.parentNode) {
                errorDiv.style.display = 'none';
            }
        }, 5000);
    }

    // Show success message
    function showSuccess(message) {
        const successDiv = document.createElement('div');
        successDiv.className = 'success-message fade-in';
        successDiv.innerHTML = `<strong>✅ Success:</strong> ${message}`;
        
        videoForm.parentNode.insertBefore(successDiv, videoForm.nextSibling);
        
        // Auto-hide after 3 seconds
        setTimeout(() => {
            if (successDiv && successDiv.parentNode) {
                successDiv.parentNode.removeChild(successDiv);
            }
        }, 3000);
    }

    // Form state management
    function disableForm() {
        submitBtn.disabled = true;
        submitBtn.textContent = '⏳ Processing...';
        document.getElementById('video_source').disabled = true;
        document.getElementById('query').disabled = true;
    }

    function enableForm() {
        submitBtn.disabled = false;
        submitBtn.textContent = '🎬 Generate Vertical Clip';
        document.getElementById('video_source').disabled = false;
        document.getElementById('query').disabled = false;
    }

    // Utility functions
    function showElement(element) {
        if (element) {
            element.classList.remove('hidden');
        }
    }

    function hideElement(element) {
        if (element) {
            element.classList.add('hidden');
        }
    }

    function isValidUrl(string) {
        try {
            new URL(string);
            return true;
        } catch (_) {
            return false;
        }
    }

    // Add keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        // Enter key submits form when focused on inputs
        if (e.key === 'Enter' && (e.target.id === 'video_source' || e.target.id === 'query')) {
            e.preventDefault();
            videoForm.dispatchEvent(new Event('submit'));
        }
        
        // Escape key resets form
        if (e.key === 'Escape') {
            resetForm();
        }
    });

    // Add input validation feedback
    const videoSourceInput = document.getElementById('video_source');
    const queryInput = document.getElementById('query');

    videoSourceInput.addEventListener('blur', function() {
        const value = this.value.trim();
        if (value && value.startsWith('http') && !isValidUrl(value)) {
            this.style.borderColor = '#e53e3e';
            showError('Please enter a valid URL');
        } else {
            this.style.borderColor = '#e2e8f0';
        }
    });

    // Clear error on input focus
    videoSourceInput.addEventListener('focus', function() {
        const errorDiv = document.querySelector('.error-message');
        if (errorDiv) {
            errorDiv.style.display = 'none';
        }
        this.style.borderColor = '#667eea';
    });

    queryInput.addEventListener('focus', function() {
        this.style.borderColor = '#667eea';
    });

    queryInput.addEventListener('blur', function() {
        this.style.borderColor = '#e2e8f0';
    });
});

// Add some fun console messages
console.log('🎬 VideoDB Vertical Clip Generator loaded!');
console.log('💡 Tip: You can use Escape key to reset the form');
console.log('🚀 Ready to create amazing vertical clips!');

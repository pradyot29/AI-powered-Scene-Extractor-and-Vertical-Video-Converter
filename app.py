from flask import Flask, render_template, request, jsonify, send_file
from config import Config
from video_processor import VideoProcessor
from vertical_converter import VerticalConverter
import tempfile
import os
import threading
import time

app = Flask(__name__)
app.config.from_object(Config)

# Initialize processors
video_processor = VideoProcessor(app.config['VIDEODB_API_KEY'])
vertical_converter = VerticalConverter()

# Store processing status
processing_status = {}

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/process_video', methods=['POST'])
def process_video():
    try:
        data = request.get_json()
        video_source = data.get('video_source')
        query = data.get('query', '').strip()
        
        if not video_source:
            return jsonify({'error': 'Video source is required'}), 400
        
        # Generate processing ID
        process_id = str(int(time.time()))
        processing_status[process_id] = {'status': 'uploading', 'progress': 10}
        
        # Start processing in background
        thread = threading.Thread(
            target=process_video_background, 
            args=(process_id, video_source, query)
        )
        thread.start()
        
        return jsonify({'process_id': process_id})
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

def process_video_background(process_id, video_source, query):
    """Background video processing function"""
    try:
        # Step 1: Upload video
        processing_status[process_id] = {'status': 'uploading', 'progress': 20}
        video = video_processor.upload_video(video_source)
        
        if not video:
            processing_status[process_id] = {'status': 'error', 'message': 'Failed to upload video'}
            return
        
        # Step 2: Index scenes
        processing_status[process_id] = {'status': 'indexing', 'progress': 40}
        index_id = video_processor.index_video_scenes(video)
        
        timeline = None
        
        # Step 3: Search for query if provided
        if query:
            processing_status[process_id] = {'status': 'searching', 'progress': 60}
            shots = video_processor.search_scenes(video, query, index_id)
            
            if shots:
                # Use first matching shot
                shot = shots[0]
                timeline = [[shot.start, shot.end]]
                processing_status[process_id]['found_scene'] = True
            else:
                # Use default clip
                timeline = video_processor.get_default_clip(video, 30)
                processing_status[process_id]['found_scene'] = False
        else:
            # Use default clip
            timeline = video_processor.get_default_clip(video, 30)
            processing_status[process_id]['found_scene'] = False
        
        # Step 4: Generate video stream
        processing_status[process_id] = {'status': 'generating', 'progress': 80}
        stream_url = video.generate_stream(timeline=timeline)
        
        # Step 5: Convert to vertical
        processing_status[process_id] = {'status': 'converting', 'progress': 90}
        vertical_path = vertical_converter.convert_to_vertical(stream_url)
        
        if vertical_path:
            processing_status[process_id] = {
                'status': 'completed', 
                'progress': 100,
                'video_path': vertical_path,
                'original_stream': stream_url
            }
        else:
            processing_status[process_id] = {'status': 'error', 'message': 'Failed to convert to vertical'}
            
    except Exception as e:
        processing_status[process_id] = {'status': 'error', 'message': str(e)}

@app.route('/status/<process_id>')
def get_status(process_id):
    status = processing_status.get(process_id, {'status': 'not_found'})
    return jsonify(status)

@app.route('/download/<process_id>')
def download_video(process_id):
    status = processing_status.get(process_id)
    if status and status.get('status') == 'completed':
        video_path = status.get('video_path')
        if video_path and os.path.exists(video_path):
            return send_file(video_path, as_attachment=True, 
                           download_name=f'vertical_clip_{process_id}.mp4')
    
    return jsonify({'error': 'Video not found'}), 404

if __name__ == '__main__':
    app.run(debug=True, port=5000)

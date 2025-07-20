import videodb
from videodb import connect, IndexType, SearchType, SceneExtractionType
import time

class VideoProcessor:
    def __init__(self, api_key):
        self.conn = connect(api_key=api_key)
        self.collection = self.conn.get_collection()
    
    def upload_video(self, source):
        """Upload video from URL or local file"""
        try:
            if source.startswith(('http://', 'https://')):
                video = self.collection.upload(url=source)
            else:
                video = self.collection.upload(file_path=source)
            
            print(f"Video uploaded successfully with ID: {video.id}")
            return video
        except Exception as e:
            print(f"Error uploading video: {e}")
            return None
    
    def index_video_scenes(self, video, prompt="Describe the scene in detail"):
        """Index video scenes for visual search"""
        try:
            # Index scenes with time-based extraction
            index_id = video.index_scenes(
                extraction_type=SceneExtractionType.time_based,
                extraction_config={"time": 5, "frame_count": 3},
                prompt=prompt
            )
            
            # Wait for indexing to complete
            scene_index = video.get_scene_index(index_id)
            print(f"Scene indexing completed with ID: {index_id}")
            return index_id
        except Exception as e:
            print(f"Error indexing scenes: {e}")
            return None
    
    def search_scenes(self, video, query, index_id=None):
        """Search for specific scenes in the video"""
        try:
            # Search using scene index
            results = video.search(
                query=query,
                search_type=SearchType.semantic,
                index_type=IndexType.scene,
                index_id=index_id
            )
            
            shots = results.get_shots()
            if shots:
                print(f"Found {len(shots)} matching scenes")
                return shots
            else:
                print("No matching scenes found")
                return []
                
        except Exception as e:
            print(f"Error searching scenes: {e}")
            return []
    
    def get_default_clip(self, video, duration=30):
        """Get default first 30 seconds if no query matches"""
        try:
            timeline = [[0, duration]]  # First 30 seconds
            return timeline
        except Exception as e:
            print(f"Error creating default clip: {e}")
            return [[0, 30]]

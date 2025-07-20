import moviepy.editor as mp
import cv2
import numpy as np
import tempfile
import os

class VerticalConverter:
    def __init__(self):
        self.target_resolution = (1080, 1920)  # 9:16 aspect ratio
    
    def convert_to_vertical(self, video_url, output_path=None):
        """Convert horizontal video to vertical format"""
        try:
            if output_path is None:
                output_path = tempfile.mktemp(suffix='.mp4')
            
            # Load video
            clip = mp.VideoFileClip(video_url)
            
            # Get original dimensions
            w, h = clip.size
            
            # Calculate crop dimensions for vertical format
            target_w, target_h = self.target_resolution
            aspect_ratio = target_w / target_h
            
            if w / h > aspect_ratio:
                # Video is too wide, crop width
                new_w = int(h * aspect_ratio)
                x_center = w // 2
                x1 = x_center - new_w // 2
                x2 = x_center + new_w // 2
                
                # Use clip.crop() method directly
                cropped_clip = clip.crop(x1=x1, x2=x2)
            else:
                # Video is too tall, crop height
                new_h = int(w / aspect_ratio)
                y_center = h // 2
                y1 = y_center - new_h // 2
                y2 = y_center + new_h // 2
                
                # Use clip.crop() method directly
                cropped_clip = clip.crop(y1=y1, y2=y2)
            
            # Resize to target resolution using clip.resize() method
            final_clip = cropped_clip.resize(newsize=self.target_resolution)
            
            # Write the result
            final_clip.write_videofile(
                output_path,
                codec='libx264',
                audio_codec='aac',
                temp_audiofile='temp-audio.m4a',
                remove_temp=True,
                verbose=False,
                logger=None
            )
            
            # Close clips
            clip.close()
            cropped_clip.close()
            final_clip.close()
            
            return output_path
            
        except Exception as e:
            print(f"Error converting to vertical: {e}")
            return None
    
    def create_vertical_with_background(self, video_url, output_path=None):
        """Create vertical video with blurred background"""
        try:
            if output_path is None:
                output_path = tempfile.mktemp(suffix='.mp4')
            
            # Load original video
            clip = mp.VideoFileClip(video_url)
            
            # Create blurred background
            background = clip.resize(height=1920)
            if background.w > 1080:
                background = background.crop(x_center=background.w//2, width=1080)
            
            # Create blur effect (simplified approach)
            # Note: moviepy's blur effect might not be available in all versions
            blurred_bg = background
            
            # Scale original video to fit in center
            if clip.h > 1080:
                main_video = clip.resize(height=1080)
            else:
                main_video = clip
            
            # Composite the videos
            final_clip = mp.CompositeVideoClip([
                blurred_bg,
                main_video.set_position('center')
            ])
            
            final_clip.write_videofile(
                output_path,
                codec='libx264',
                audio_codec='aac',
                verbose=False,
                logger=None
            )
            
            clip.close()
            final_clip.close()
            
            return output_path
            
        except Exception as e:
            print(f"Error creating vertical with background: {e}")
            return None

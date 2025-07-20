# 🎬 AI-powered Scene Extractor and Vertical Video Converter

An intelligent web application that automatically converts horizontal videos into **mobile-optimized vertical format (9:16)**—perfect for TikTok, Instagram Reels, and YouTube Shorts. This tool leverages **VideoDB's AI capabilities** to find specific scenes using natural language queries, saving countless hours of manual editing.

🔗 Live Repo: [AI-powered-Scene-Extractor-and-Vertical-Video-Converter](https://github.com/pradyot29/AI-powered-Scene-Extractor-and-Vertical-Video-Converter)

---

## ✨ Key Features

- 🔍 **Smart Scene Detection** – Use queries like `"person talking"` or `"car chase"` to locate relevant video moments  
- 📱 **Automatic Vertical Conversion** – Crop and convert any horizontal video to vertical (1080x1920, 9:16)  
- 🎯 **YouTube Integration** – Process videos directly from YouTube URLs  
- ⚡ **Real-time Progress Updates** – Watch the status change as the video is processed  
- 🎛️ **Fallback System** – No scene match? App generates the first 30 seconds automatically  
- 💾 **One-click Download** – Instantly download your social-ready vertical clip  

---

## 🚀 Quick Start

### 🧰 Prerequisites

- Python 3.8+
- [FFmpeg](https://ffmpeg.org/) installed and added to PATH
- VideoDB API Key – Get one from [VideoDB](https://videodb.io)  

---
### 🛠 Installation

```bash
git clone https://github.com/pradyot29/AI-powered-Scene-Extractor-and-Vertical-Video-Converter.git
cd AI-powered-Scene-Extractor-and-Vertical-Video-Converter
pip install -r requirements.txt
```
---

## 🔐 Environment Setup
Create a .env file in the root directory:

```bash
VIDEODB_API_KEY=your_videodb_api_key_here
SECRET_KEY=your_flask_secret_key_here
```

### Generate a Flask SECRET_KEY:
```bash
import secrets
print(secrets.token_hex(16))
```

### ▶️ Run the App
```bash
python app.py
```
Visit http://localhost:5000 in your browser.

---

## 🏗️ Project Structure

AI-powered-Scene-Extractor-and-Vertical-Video-Converter/
├── app.py                 # Flask app entry point
├── config.py              # Configurations
├── video_processor.py     # VideoDB API integration logic
├── vertical_converter.py  # Smart cropping & conversion
├── requirements.txt       # Dependencies
├── templates/
│   └── index.html         # Web UI
├── static/
│   ├── style.css          # Styling
│   └── script.js          # JS logic
├── .env.example           # Env variable template
├── .gitignore             # Ignore sensitive files
└── README.md              # You’re reading it!

---

## 💡 How It Works

Input Video – Enter a YouTube URL or upload a local file
Scene Analysis – AI indexes and finds relevant moments using semantic search
Fallback – If no scene matches, default to the first 30 seconds
Vertical Conversion – Smart crop & resize to 9:16 format (1080x1920)
Download – One-click export in MP4 format


## 💻 Example Usage
```bash
python app.py
```
Enter:
Video Source: https://www.youtube.com/watch?v=dQw4w9WgXcQ
Scene Query: "person singing" (optional)


Progress:
⏳ Uploading video (20%)
🔍 Indexing scenes (40%)
🎯 Searching for query (60%)
🎬 Generating stream (80%)
📱 Converting to vertical (100%)

Done! Download your vertical clip 🎉

---

##  🔌 API Example (VideoDB)
```bash
from videodb import connect, SearchType, SceneExtractionType

conn = connect(api_key="your_api_key")
collection = conn.get_collection()

video = collection.upload(url="https://youtube.com/watch?v=...")

index_id = video.index_scenes(
    extraction_type=SceneExtractionType.time_based,
    prompt="Describe the scene in detail"
)

results = video.search(query="person talking", search_type=SearchType.semantic)
stream_url = video.generate_stream(timeline=[[start, end]])
```
--- 

## 🎯 Use Cases
Content Creators – Repurpose long-form YouTube videos
Social Media Managers – Instantly generate reels/shorts
Video Editors – Automate time-consuming tasks
Marketing Teams – Create promo clips from demo videos
Educators – Extract key lecture moments

--- 

## 🧪 Future Enhancements
✅ Batch video support
✅ Support for other aspect ratios (1:1, 4:5)
✅ Custom filters and effects
⏳ Direct social media upload
⏳ Adjustable video quality settings

---

## 🤝 Contributing
Fork the repository
Create a new branch (git checkout -b feature/YourFeature)
Commit your changes (git commit -m 'Add feature')
Push to the branch (git push origin feature/YourFeature)
Open a Pull Request 🙌

---

## 🙏 Acknowledgments
VideoDB for powerful video processing APIs
MoviePy for video manipulation
Flask for the web framework

---

<div align="center">
Made with ❤️ by Pradyot for content creators worldwide
📱 Turn any video into scroll-stopping vertical gold ✨
</div>

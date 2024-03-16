
import sys, os
from flask import Flask, render_template, url_for
from flask_frozen import Freezer

app = Flask(__name__)
freezer = Freezer(app)

# Add this line to generate .html files
app.config['FREEZER_EXTENSION'] = '.html'

@app.route('/')
def home():
    return render_template('home.html')

@app.route('/hardware')
def hardware():
    return render_template('hardware.html', current_page='hardware')

@app.route('/materials')
def materials():
    return render_template('materials.html', current_page='materials')

@app.route('/audio') ## testing audio samples players on this page
def audio():
    directory = "static/wav/"  # replace with your actual directory
    audio_files = [url_for('static', filename='wav/' + f) for f in os.listdir(directory) if f.endswith('.wav')]
    # audio_files = [url_for('static', filename='wav/Drone 03.wav')]
    return render_template('audio.html', current_page='audio', audio_files=audio_files)

@app.route('/theremin')
def theremin():
    return render_template('theremin.html', current_page='theremin')

@app.route('/contact')
def contact():
    return render_template('contact.html', current_page='contact')

if __name__ == '__main__':
    if len(sys.argv) > 1 and sys.argv[1] == "build":
        freezer.freeze()
    else:
        app.run(debug=True)
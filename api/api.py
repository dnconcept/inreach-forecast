from flask import Flask, request, jsonify
import os
import tempfile
from app import open_grib, extract_grib_data

app = Flask(__name__)

@app.after_request
def add_cors_headers(response):
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'
    return response

@app.route('/', methods=['GET'])
def welcome():
    response = {
        'welcome': 'welcome to nicoco grib app',
        'version': '1.0'
    }
    return jsonify(response)

@app.route('/process_grib', methods=['POST'])
def process_grib():
    return process_grib_request(open_grib)

@app.route('/extract_grib', methods=['POST'])
def extract_grib():
    return process_grib_request(extract_grib_data)

def process_grib_request(fn):
    # Vérifier si un fichier a été uploadé
    if 'file' not in request.files:
        return jsonify({'error': 'No file uploaded'}), 400

    file = request.files['file']

    try:
        # Save the uploaded file to a temporary location
        with tempfile.NamedTemporaryFile(delete=False, suffix=".grib") as temp_file:
            temp_file.write(file.read())
            temp_file_path = temp_file.name

        # Extract data from the GRIB file
        grib_data = fn(temp_file_path)

        # Clean up: Remove the temporary file
        os.remove(temp_file_path)

        # Return the extracted data as JSON
        return jsonify(grib_data)

    except Exception as e:
        return jsonify({'error': str(e)}), 500


if __name__ == '__main__':
    # Get the port from the environment variable, default to 8080 if not set
    port = int(os.environ.get('PORT', 8080))
    app.run(host='0.0.0.0', port=port)

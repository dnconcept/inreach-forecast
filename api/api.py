from flask import Flask, request, jsonify
import os
from app import open_grib

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
    # Vérifier si un fichier a été uploadé
    if 'file' not in request.files:
        return jsonify({'error': 'No file uploaded'}), 400

    file = request.files['file']
    file_path = os.path.join('/app/data', file.filename)
    file.save(file_path)

    # file_path = os.path.join('/app/data', "data.grb")
    try:
        result = open_grib(file_path)
        response = {
            'message': result
        }
        return jsonify(response)

    except Exception as e:
        return jsonify({'error': str(e)}), 500


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000)

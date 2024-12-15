from flask import Flask, request, jsonify
import os
from app import open_grib

app = Flask(__name__)

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

    try:
        result = open_grib()
        response = {
            'message': result
        }
        return jsonify(response)

    except Exception as e:
        return jsonify({'error': str(e)}), 500


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000)
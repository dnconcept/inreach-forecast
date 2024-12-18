from flask import Flask, request, jsonify
import os
import tempfile
from app import encode_grib_file, extract_grib_file
from saildocs import send_grib_request, download_grib_attachment

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

@app.route('/encode_grib', methods=['POST'])
def encode_grib():
    return process_grib_request(encode_grib_file)

@app.route('/extract_grib', methods=['POST'])
def extract_grib():
    return process_grib_request(extract_grib_file)

@app.route('/grip_request', methods=['POST'])
def grip_request():
    try:
        # Extract latitude and longitude from JSON payload
        data = request.json
        if not data:
            return jsonify({'message': 'Latitude and longitude are required'}), 400

        lat = data.get('lat') # latitude in numeric value ( 90° N et -90° S )
        lng = data.get('lng') # longitude in numeric value ( 180° E et -180° W )
        offsetDegrees = data.get('offsetDegrees') # offset degrees from center

        # Validate latitude and longitude
        if lat is None or lng is None or offsetDegrees is None:
            return jsonify({'message': 'Latitude, longitude and offsetDegrees are required'}), 400
        try:
            lat = float(lat)
            lng = float(lng)
            offsetDegrees = float(offsetDegrees)
        except ValueError:
            return jsonify({'message': 'Latitude, longitude and offsetDegrees must be numeric'}), 400

        # Send the GRIB request
        request_message, request_subject, receiver_email = send_grib_request(lat, lng, offsetDegrees)
        return jsonify({
          'message': f'Le message a été envoyé {receiver_email}',
          'grib_request': request_message,
          'grib_subject': request_subject,
          'center': { 'lat': lat, 'lng': lng }
        }), 200
    except Exception as e:
      return jsonify({
                         "error": f"Erreur lors de l'envoi de l'email : {e}",
                         "status": 400
                     }), 400

@app.route('/grip_check', methods=['GET'])
def grip_check():
    try:
        # Récupérer le paramètre de requête 'search_subject'
        search_subject = request.args.get('search_subject')

        if not search_subject:
            return jsonify({
                "message": "Le paramètre 'search_subject' est requis.",
                "status": 400
            }), 400
        file = download_grib_attachment(search_subject)
        if file is None:
            return jsonify({
                "message": f"Impossible de trouver le ficher GRIB demandé avec l'objet {search_subject}",
                "status": 404
            }), 404

        data = encode_grib_file(file)

        return jsonify({ 'file': file, **data })
    except Exception as e:
      return jsonify({
                         "error": f"Erreur lors de la récupération de l'email : {e}",
                         "status": 400
                     }), 400

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

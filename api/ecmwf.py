from ecmwfapi import ECMWFDataServer

server = ECMWFDataServer()

def getSample(request):
    try:
        return server.retrieve(request)
    except Exception as e:  # Proper syntax for exception handling
        print(f"An error occurred: {e}")  # Optionally print the error
        return None

requestSample = \
  {
    'origin'    : "ecmf",
    'levtype'   : "sfc",
    'number'    : "1",
    'expver'    : "prod",
    'dataset'   : "tigge",
    'step'      : "0/6/12/18",
    'area'      : "70/-130/30/-60",
    'grid'      : "2/2",
    'param'     : "167",
    'time'      : "00/12",
    'date'      : "2014-11-01",
    'type'      : "pf",
    'class'     : "ti",
    'target'    : "data/tigge_2014-11-01_0012.grib"
  }

requestEra = {
    'class': 'od',  # Open data
    'expver': '1',  # Experiment version
    'stream': 'oper',  # Operational stream
    'type': 'fc',  # Forecast type
    'dataset': 'oper',
    #'dataset': 'III-iii-a',
    'step': '0/to/240/by/6',  # Forecast steps (e.g., 0 to 240 hours by 6 hours)
    'levtype': 'sfc',  # Surface level
    'param': '167.128',  # Parameter (e.g., 2m temperature)
    'date': '20241218/to/20241220',  # Date range
    'time': '00:00:00/12:00:00',  # Times of the day
    'area': '41/-3/39/3',  # Area (North/West/South/East) around the point of interest
    'grid': '1/1',  # Grid resolution
    'format': 'grib',  # Data format
    'target': 'data/forecast_data.grib',  # Output file
}

getSample(requestEra)

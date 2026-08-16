from flask import Flask, request, jsonify
from flask_cors import CORS
from pathlib import Path
import sys
import time
from pipeline.scam_detector.detector import ScamDetector
from utils import get_logger

# Add project root to path
project_root = Path(__file__).parent
sys.path.append(str(project_root))

logger = get_logger(__name__)

app = Flask(__name__)
CORS(app)

# Initialize the detector once
detector = ScamDetector()

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'service': 'scam-detection-service',
        'model': 'gemini-3.6-flash'
    })

@app.route('/detect', methods=['POST'])
def detect():
    """Detect scam in a message"""
    try:
        data = request.get_json()
        
        if not data or 'message' not in data:
            return jsonify({
                'success': False,
                'error': 'Message is required'
            }), 400
        
        message = data['message']
        
        if not message or not message.strip():
            return jsonify({
                'success': False,
                'error': 'Message cannot be empty'
            }), 400
        
        logger.info(f"Received detection request for message length: {len(message)}")
        
        # Measure processing time
        start_time = time.time()
        
        # Run detection
        result = detector.detect(message)
        
        processing_time = time.time() - start_time
        
        # Add metadata
        result['processing_time'] = processing_time
        result['model_used'] = 'gemini-3.6-flash'
        result['strategy'] = 'react'
        
        logger.info(f"Detection completed: {result.get('label', 'Unknown')}")
        
        return jsonify({
            'success': True,
            'data': result
        })
        
    except Exception as e:
        logger.error(f"Detection error: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/detect/batch', methods=['POST'])
def detect_batch():
    """Detect scams in multiple messages"""
    try:
        data = request.get_json()
        
        if not data or 'messages' not in data:
            return jsonify({
                'success': False,
                'error': 'Messages array is required'
            }), 400
        
        messages = data['messages']
        
        if not isinstance(messages, list) or len(messages) == 0:
            return jsonify({
                'success': False,
                'error': 'Messages must be a non-empty array'
            }), 400
        
        logger.info(f"Received batch detection request for {len(messages)} messages")
        
        # Run batch detection
        results = detector.detect_batch(messages)
        
        # Add metadata to each result
        for result in results:
            result['model_used'] = 'gemini-3.6-flash'
            result['strategy'] = 'react'
        
        logger.info(f"Batch detection completed")
        
        return jsonify({
            'success': True,
            'data': results
        })
        
    except Exception as e:
        logger.error(f"Batch detection error: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

if __name__ == '__main__':
    logger.info("Starting Scam Detection Service on port 8000")
    app.run(host='0.0.0.0', port=8000, debug=True)
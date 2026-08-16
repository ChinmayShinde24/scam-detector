import ScamDetection from '../models/scamDetection.model.js';
import User from '../models/users.model.js';
import mongoose from 'mongoose';

// Python service URL (will be configured via environment)
const PYTHON_SERVICE_URL = process.env.PYTHON_SERVICE_URL || 'http://localhost:8000';

// Detect scam in a message
export const detectScam = async (req, res) => {
  try {
    const { message } = req.body;
    const userId = req.user?.id; // Will come from auth middleware

    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Message is required'
      });
    }

    // Call Python service for scam detection
    const pythonResponse = await fetch(`${PYTHON_SERVICE_URL}/detect`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ message })
    });

    if (!pythonResponse.ok) {
      const errorText = await pythonResponse.text();
      console.error('Python service error:', errorText);
      throw new Error(`Python service error: ${pythonResponse.status}`);
    }

    const detectionResult = await pythonResponse.json();

    if (!detectionResult.success) {
      throw new Error(detectionResult.error || 'Python service returned error');
    }

    const resultData = detectionResult.data;

    // Calculate confidence score based on label
    const confidenceScore = resultData.label === 'Scam' ? 85 : 
                           resultData.label === 'Not Scam' ? 92 : 60;

    // Create scam detection record
    const scamDetection = new ScamDetection({
      user: userId,
      message: message.trim(),
      label: resultData.label,
      reasoning: resultData.reasoning,
      intent: resultData.intent,
      risk_factors: resultData.risk_factors || [],
      confidence_score: confidenceScore,
      metadata: {
        model_used: resultData.model_used || 'gemini-3.6-flash',
        strategy: resultData.strategy || 'react',
        processing_time: resultData.processing_time || 0
      }
    });

    await scamDetection.save();

    res.status(201).json({
      success: true,
      message: 'Scam detection completed',
      data: {
        id: scamDetection._id,
        message: scamDetection.message,
        label: scamDetection.label,
        reasoning: scamDetection.reasoning,
        intent: scamDetection.intent,
        risk_factors: scamDetection.risk_factors,
        confidence_score: scamDetection.confidence_score,
        created_at: scamDetection.createdAt
      }
    });
  } catch (error) {
    console.error('Scam detection error:', error);
    res.status(500).json({
      success: false,
      message: 'Error during scam detection',
      error: error.message
    });
  }
};

// Get user's scam detection history
export const getScamHistory = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { limit = 20, skip = 0, label } = req.query;

    const query = { user: userId };
    if (label) {
      query.label = label;
    }

    const history = await ScamDetection.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip))
      .select('message label reasoning intent risk_factors confidence_score createdAt');

    const total = await ScamDetection.countDocuments(query);

    res.status(200).json({
      success: true,
      message: 'Scam history retrieved',
      data: {
        history,
        pagination: {
          total,
          limit: parseInt(limit),
          skip: parseInt(skip),
          has_more: total > parseInt(skip) + parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get history error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving scam history',
      error: error.message
    });
  }
};

// Get scam detection by user ID
export const getScamsByUserId = async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 20, skip = 0, label } = req.query;

    // Verify the requesting user has permission to view this user's data
    if (req.user?.id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const query = { user: userId };
    if (label) {
      query.label = label;
    }

    const scams = await ScamDetection.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip))
      .select('message label reasoning intent risk_factors confidence_score createdAt');

    const total = await ScamDetection.countDocuments(query);

    res.status(200).json({
      success: true,
      message: 'User scam detections retrieved',
      data: {
        scams,
        pagination: {
          total,
          limit: parseInt(limit),
          skip: parseInt(skip),
          has_more: total > parseInt(skip) + parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get scams by user ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving user scam detections',
      error: error.message
    });
  }
};

// Get specific detection result
export const getScamDetection = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    const detection = await ScamDetection.findOne({
      _id: id,
      user: userId
    });

    if (!detection) {
      return res.status(404).json({
        success: false,
        message: 'Detection result not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Detection result retrieved',
      data: detection
    });
  } catch (error) {
    console.error('Get detection error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving detection result',
      error: error.message
    });
  }
};

// Delete detection result
export const deleteScamDetection = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    const detection = await ScamDetection.findOneAndDelete({
      _id: id,
      user: userId
    });

    if (!detection) {
      return res.status(404).json({
        success: false,
        message: 'Detection result not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Detection result deleted successfully'
    });
  } catch (error) {
    console.error('Delete detection error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting detection result',
      error: error.message
    });
  }
};

// Get scam statistics for user
export const getScamStats = async (req, res) => {
  try {
    const userId = req.user?.id;

    const stats = await ScamDetection.aggregate([
      { $match: { user: mongoose.Types.ObjectId(userId) } },
      {
        $group: {
          _id: '$label',
          count: { $sum: 1 }
        }
      }
    ]);

    const totalDetections = await ScamDetection.countDocuments({ user: userId });

    const statsMap = {
      'Scam': 0,
      'Not Scam': 0,
      'Uncertain': 0
    };

    stats.forEach(stat => {
      statsMap[stat._id] = stat.count;
    });

    res.status(200).json({
      success: true,
      message: 'Scam statistics retrieved',
      data: {
        total: totalDetections,
        breakdown: statsMap,
        scam_rate: totalDetections > 0 ? (statsMap['Scam'] / totalDetections * 100).toFixed(1) : 0
      }
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving scam statistics',
      error: error.message
    });
  }
};
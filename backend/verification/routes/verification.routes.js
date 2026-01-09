const express = require('express');
const multer = require('multer');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const router = express.Router();
// Simple verification engine mock for demo
class SimpleVerificationEngine {
  async processVerification(request, attemptNumber) {
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Mock OCR and matching results
    const mockExtractedData = {
      documentType: 'DEGREE_CERTIFICATE',
      name: request.claimedName,
      institution: request.claimedInstitution,
      program: request.claimedProgram,
      startYear: request.claimedStartYear,
      endYear: request.claimedEndYear,
      confidence: 0.85
    };

    // Mock matching with some randomness for demo
    const institutionScore = Math.random() > 0.3 ? 0.9 : 0.6;
    const nameScore = Math.random() > 0.2 ? 0.95 : 0.7;
    const timelineScore = Math.random() > 0.4 ? 0.8 : 0.5;
    const programScore = Math.random() > 0.5 ? 0.75 : 0.4;

    const matchingResults = {
      institutionMatch: {
        score: institutionScore,
        passed: institutionScore > 0.7,
        details: institutionScore > 0.7 ? 'Institution name matches' : 'Institution name mismatch'
      },
      nameMatch: {
        score: nameScore,
        passed: nameScore > 0.7,
        details: nameScore > 0.7 ? 'Name matches exactly' : 'Name similarity low'
      },
      timelineMatch: {
        score: timelineScore,
        passed: timelineScore > 0.6,
        details: timelineScore > 0.6 ? 'Timeline overlaps correctly' : 'Timeline mismatch'
      },
      programMatch: {
        score: programScore,
        passed: programScore > 0.4,
        details: programScore > 0.4 ? 'Program matches' : 'Program differs'
      },
      overallScore: (institutionScore * 0.4 + nameScore * 0.3 + timelineScore * 0.2 + programScore * 0.1)
    };

    // Decision logic
    let decision = 'REJECTED';
    if (matchingResults.institutionMatch.passed && matchingResults.nameMatch.passed) {
      if (matchingResults.overallScore >= 0.8) {
        decision = 'APPROVED';
      } else if (matchingResults.overallScore >= 0.6) {
        decision = attemptNumber >= 2 ? 'PENDING_REVIEW' : 'REJECTED';
      } else {
        decision = attemptNumber >= 3 ? 'PENDING_REVIEW' : 'REJECTED';
      }
    } else {
      decision = attemptNumber >= 3 ? 'PENDING_REVIEW' : 'REJECTED';
    }

    return {
      id: generateId(),
      verificationRequestId: request.id,
      attemptNumber,
      status: 'COMPLETED',
      ocrText: `Mock OCR text for ${request.claimedName} from ${request.claimedInstitution}`,
      extractedData: mockExtractedData,
      matchingResults,
      decision,
      failureReason: decision === 'REJECTED' ? 'Verification criteria not met' : null,
      createdAt: new Date(),
      completedAt: new Date()
    };
  }
}

const verificationEngine = new SimpleVerificationEngine();

// Configure multer for PDF uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads/verification');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${crypto.randomBytes(6).toString('hex')}.pdf`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  }
});

// In-memory storage for demo (replace with database in production)
const verificationRequests = new Map<string, VerificationRequest>();
const verificationAttempts = new Map<string, VerificationAttempt[]>();

// POST /api/verification/submit - Submit verification request
router.post('/submit', upload.single('document'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'PDF document is required' });
    }

    const {
      userId,
      institutionId,
      claimedName,
      claimedInstitution,
      claimedProgram,
      claimedStartYear,
      claimedEndYear
    } = req.body;

    // Validate required fields
    if (!userId || !claimedName || !claimedInstitution || !claimedProgram || !claimedStartYear || !claimedEndYear) {
      return res.status(400).json({ error: 'All claim fields are required' });
    }

    // Calculate document hash to prevent duplicates
    const fileBuffer = fs.readFileSync(req.file.path);
    const documentHash = crypto.createHash('sha256').update(fileBuffer).digest('hex');

    // Check for duplicate document
    const existingRequest = Array.from(verificationRequests.values())
      .find(r => r.documentHash === documentHash && r.userId === userId);
    
    if (existingRequest) {
      fs.unlinkSync(req.file.path); // Clean up uploaded file
      return res.status(409).json({ 
        error: 'This document has already been submitted',
        existingRequestId: existingRequest.id
      });
    }

    // Create verification request
    const verificationRequest: VerificationRequest = {
      id: generateId(),
      userId,
      institutionId: institutionId || 'default',
      claimedName,
      claimedInstitution,
      claimedProgram,
      claimedStartYear: parseInt(claimedStartYear),
      claimedEndYear: parseInt(claimedEndYear),
      documentPath: req.file.path,
      documentHash,
      status: 'PENDING',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    verificationRequests.set(verificationRequest.id, verificationRequest);
    verificationAttempts.set(verificationRequest.id, []);

    res.status(201).json({
      message: 'Verification request submitted successfully',
      requestId: verificationRequest.id,
      status: verificationRequest.status
    });

    // Start processing asynchronously
    processVerificationAsync(verificationRequest.id);

  } catch (error) {
    console.error('Verification submission error:', error);
    res.status(500).json({ error: 'Failed to submit verification request' });
  }
});

// GET /api/verification/status/:requestId - Get verification status
router.get('/status/:requestId', (req, res) => {
  try {
    const { requestId } = req.params;
    const request = verificationRequests.get(requestId);
    
    if (!request) {
      return res.status(404).json({ error: 'Verification request not found' });
    }

    const attempts = verificationAttempts.get(requestId) || [];
    const lastAttempt = attempts[attempts.length - 1];

    res.json({
      requestId: request.id,
      status: request.status,
      totalAttempts: attempts.length,
      canAppeal: attempts.length < 3 && request.status === 'REJECTED',
      canManualReview: attempts.length >= 3,
      lastAttempt: lastAttempt ? {
        attemptNumber: lastAttempt.attemptNumber,
        decision: lastAttempt.decision,
        failureReason: lastAttempt.failureReason,
        matchingResults: lastAttempt.matchingResults,
        completedAt: lastAttempt.completedAt
      } : null,
      createdAt: request.createdAt,
      updatedAt: request.updatedAt
    });
  } catch (error) {
    console.error('Status check error:', error);
    res.status(500).json({ error: 'Failed to get verification status' });
  }
});

// POST /api/verification/appeal/:requestId - Submit appeal
router.post('/appeal/:requestId', async (req, res) => {
  try {
    const { requestId } = req.params;
    const { reason, additionalInfo } = req.body;

    const request = verificationRequests.get(requestId);
    if (!request) {
      return res.status(404).json({ error: 'Verification request not found' });
    }

    const attempts = verificationAttempts.get(requestId) || [];
    if (attempts.length >= 3) {
      return res.status(400).json({ error: 'Maximum appeal attempts reached' });
    }

    if (request.status !== 'REJECTED') {
      return res.status(400).json({ error: 'Can only appeal rejected requests' });
    }

    res.json({
      message: 'Appeal submitted successfully',
      requestId,
      appealNumber: attempts.length + 1
    });

    // Start new processing attempt
    processVerificationAsync(requestId, attempts.length + 1);

  } catch (error) {
    console.error('Appeal submission error:', error);
    res.status(500).json({ error: 'Failed to submit appeal' });
  }
});

// GET /api/verification/admin/pending - Get requests pending manual review (mocked admin)
router.get('/admin/pending', (req, res) => {
  try {
    const pendingRequests = Array.from(verificationRequests.values())
      .filter(r => r.status === 'MANUAL_REVIEW')
      .map(r => ({
        requestId: r.id,
        userId: r.userId,
        claimedName: r.claimedName,
        claimedInstitution: r.claimedInstitution,
        claimedProgram: r.claimedProgram,
        totalAttempts: verificationAttempts.get(r.id)?.length || 0,
        createdAt: r.createdAt
      }));

    res.json({ pendingRequests });
  } catch (error) {
    console.error('Admin pending requests error:', error);
    res.status(500).json({ error: 'Failed to get pending requests' });
  }
});

// POST /api/verification/admin/review/:requestId - Admin manual review (mocked)
router.post('/admin/review/:requestId', (req, res) => {
  try {
    const { requestId } = req.params;
    const { decision, notes } = req.body; // decision: 'APPROVED' | 'REJECTED'

    const request = verificationRequests.get(requestId);
    if (!request) {
      return res.status(404).json({ error: 'Verification request not found' });
    }

    if (request.status !== 'MANUAL_REVIEW') {
      return res.status(400).json({ error: 'Request is not pending manual review' });
    }

    // Update request status
    request.status = decision;
    request.updatedAt = new Date();
    verificationRequests.set(requestId, request);

    res.json({
      message: `Manual review completed: ${decision}`,
      requestId,
      decision,
      reviewedAt: new Date()
    });

  } catch (error) {
    console.error('Admin review error:', error);
    res.status(500).json({ error: 'Failed to complete manual review' });
  }
});

// Async processing function
async function processVerificationAsync(requestId: string, attemptNumber: number = 1) {
  try {
    const request = verificationRequests.get(requestId);
    if (!request) return;

    // Update status to processing
    request.status = 'PROCESSING';
    request.updatedAt = new Date();
    verificationRequests.set(requestId, request);

    // Process verification
    const attempt = await verificationEngine.processVerification(request, attemptNumber);
    
    // Store attempt
    const attempts = verificationAttempts.get(requestId) || [];
    attempts.push(attempt);
    verificationAttempts.set(requestId, attempts);

    // Update request status based on decision
    if (attempt.decision === 'APPROVED') {
      request.status = 'APPROVED';
    } else if (attempt.decision === 'PENDING_REVIEW') {
      request.status = 'MANUAL_REVIEW';
    } else {
      request.status = 'REJECTED';
    }

    request.updatedAt = new Date();
    verificationRequests.set(requestId, request);

    console.log(`Verification ${requestId} completed with decision: ${attempt.decision}`);

  } catch (error) {
    console.error(`Verification processing error for ${requestId}:`, error);
    
    // Update request to failed status
    const request = verificationRequests.get(requestId);
    if (request) {
      request.status = 'REJECTED';
      request.updatedAt = new Date();
      verificationRequests.set(requestId, request);
    }
  }
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

module.exports = router;

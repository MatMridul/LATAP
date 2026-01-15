const TextractService = require('./backend/verification/ocr/TextractService');
const fs = require('fs');
const path = require('path');

async function testOCR() {
    console.log('🧪 Testing AWS Textract OCR Pipeline...\n');

    // Check AWS credentials
    if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
        console.log('❌ AWS credentials not configured');
        console.log('Set AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY in environment');
        return;
    }

    console.log('✅ AWS credentials found');
    console.log(`Region: ${process.env.AWS_REGION || 'us-east-1'}\n`);

    // Create test PDF path
    const testPdfPath = path.join(__dirname, 'test-document.pdf');
    
    if (!fs.existsSync(testPdfPath)) {
        console.log('❌ Test PDF not found at:', testPdfPath);
        console.log('Create a test PDF file or update the path');
        return;
    }

    console.log('✅ Test PDF found:', testPdfPath);
    console.log('File size:', Math.round(fs.statSync(testPdfPath).size / 1024), 'KB\n');

    try {
        const textractService = new TextractService();
        
        console.log('🔄 Calling AWS Textract...');
        const ocrResult = await textractService.extractTextFromPDF(testPdfPath);

        if (ocrResult.success) {
            console.log('✅ OCR Successful!\n');
            
            console.log('📄 Raw Text Extracted:');
            console.log('─'.repeat(50));
            console.log(ocrResult.rawText);
            console.log('─'.repeat(50));
            console.log(`Total blocks: ${ocrResult.blocks.length}\n`);

            console.log('🔍 Normalizing to Identity Record...');
            const identityRecord = textractService.normalizeToIdentityRecord(
                ocrResult.rawText, 
                ocrResult.blocks
            );

            console.log('📋 Extracted Identity Fields:');
            console.log('─'.repeat(50));
            console.log('Full Name:', identityRecord.fullName?.value || 'Not found', 
                       `(confidence: ${identityRecord.fullName?.confidence || 0})`);
            console.log('Institution:', identityRecord.institution?.value || 'Not found',
                       `(confidence: ${identityRecord.institution?.confidence || 0})`);
            console.log('Program:', identityRecord.program?.value || 'Not found',
                       `(confidence: ${identityRecord.program?.confidence || 0})`);
            console.log('Start Year:', identityRecord.startYear?.value || 'Not found',
                       `(confidence: ${identityRecord.startYear?.confidence || 0})`);
            console.log('End Year:', identityRecord.endYear?.value || 'Not found',
                       `(confidence: ${identityRecord.endYear?.confidence || 0})`);
            console.log('─'.repeat(50));

            // Test matching
            console.log('\n🎯 Testing Matching Engine...');
            const MatchingEngine = require('./backend/verification/matching/MatchingEngine');
            const { IdentityRecord } = require('./backend/verification/domain/IdentityRecord');

            // Create mock user claims
            const userClaims = {
                claimed_name: 'John Doe',
                claimed_institution: 'Test University',
                claimed_program: 'Bachelor of Technology',
                claimed_start_year: 2018,
                claimed_end_year: 2022
            };

            const userRecord = IdentityRecord.fromUserClaims(userClaims);
            const matchResult = MatchingEngine.compareIdentityRecords(userRecord, identityRecord);

            console.log('Match Score:', matchResult.matchScore + '%');
            console.log('Overall Result:', matchResult.overallResult);
            
            if (matchResult.mismatches.length > 0) {
                console.log('\nMismatches:');
                matchResult.mismatches.forEach(mismatch => {
                    console.log(`- ${mismatch.field}: "${mismatch.userValue}" vs "${mismatch.ocrValue}"`);
                });
            }

            console.log('\n✅ OCR Pipeline Test Complete!');

        } else {
            console.log('❌ OCR Failed:');
            console.log('Error:', ocrResult.error);
            console.log('Error Code:', ocrResult.errorCode);
            
            if (ocrResult.errorCode === 'InvalidParameterException') {
                console.log('\n💡 Possible causes:');
                console.log('- PDF is corrupted or invalid');
                console.log('- PDF is password protected');
                console.log('- PDF exceeds size limits');
            } else if (ocrResult.errorCode === 'UnauthorizedOperation' || ocrResult.errorCode === 'CredentialsError') {
                console.log('\n💡 AWS Access Issue:');
                console.log('- Check AWS credentials');
                console.log('- Verify Textract permissions');
                console.log('- Check AWS region');
            }
        }

    } catch (error) {
        console.log('❌ Test Failed:');
        console.log('Error:', error.message);
        console.log('Stack:', error.stack);
    }
}

// Load environment variables
process.env.AWS_REGION = process.env.AWS_REGION || 'us-east-1';

// Run test
testOCR().catch(console.error);

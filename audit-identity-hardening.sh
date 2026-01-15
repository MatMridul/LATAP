#!/bin/bash

# LATAP Backend Identity Audit Script
# Scans for violations of immutable user identity principles

echo "🔍 LATAP Backend Identity Audit"
echo "================================"
echo ""

BACKEND_DIR="/mnt/c/Users/mridu/OneDrive/Documents/Mridul/Infinitra/alumni-connect/backend"
VIOLATIONS_FOUND=0

# Function to report violations
report_violation() {
    echo "❌ VIOLATION: $1"
    echo "   File: $2"
    echo "   Line: $3"
    echo ""
    VIOLATIONS_FOUND=$((VIOLATIONS_FOUND + 1))
}

# Function to report good practices
report_good() {
    echo "✅ GOOD: $1"
}

echo "1. Checking for email-based user identification..."
echo "------------------------------------------------"

# Check for email as identifier in queries
EMAIL_VIOLATIONS=$(grep -rn "WHERE.*email.*=" "$BACKEND_DIR" --include="*.js" | grep -v "SELECT.*FROM users WHERE email" | grep -v "email = \$" | head -5)
if [ ! -z "$EMAIL_VIOLATIONS" ]; then
    while IFS= read -r line; do
        FILE=$(echo "$line" | cut -d: -f1)
        LINE_NUM=$(echo "$line" | cut -d: -f2)
        report_violation "Using email as identifier instead of user_id" "$FILE" "$LINE_NUM"
    done <<< "$EMAIL_VIOLATIONS"
else
    report_good "No email-based user identification found"
fi

echo "2. Checking for user_id from request body..."
echo "--------------------------------------------"

# Check for user_id from request body
BODY_VIOLATIONS=$(grep -rn "req\.body\.user_id\|req\.body\.userId" "$BACKEND_DIR" --include="*.js")
if [ ! -z "$BODY_VIOLATIONS" ]; then
    while IFS= read -r line; do
        FILE=$(echo "$line" | cut -d: -f1)
        LINE_NUM=$(echo "$line" | cut -d: -f2)
        report_violation "Accepting user_id from request body" "$FILE" "$LINE_NUM"
    done <<< "$BODY_VIOLATIONS"
else
    report_good "No user_id from request body found"
fi

echo "3. Checking for hardcoded user references..."
echo "--------------------------------------------"

# Check for hardcoded UUIDs or user references
HARDCODE_VIOLATIONS=$(grep -rn "'[0-9a-f]\{8\}-[0-9a-f]\{4\}-[0-9a-f]\{4\}-[0-9a-f]\{4\}-[0-9a-f]\{12\}'" "$BACKEND_DIR" --include="*.js")
if [ ! -z "$HARDCODE_VIOLATIONS" ]; then
    while IFS= read -r line; do
        FILE=$(echo "$line" | cut -d: -f1)
        LINE_NUM=$(echo "$line" | cut -d: -f2)
        report_violation "Hardcoded UUID found" "$FILE" "$LINE_NUM"
    done <<< "$HARDCODE_VIOLATIONS"
else
    report_good "No hardcoded UUIDs found"
fi

echo "4. Checking JWT token structure..."
echo "---------------------------------"

# Check for proper JWT structure
JWT_GOOD=$(grep -rn "sub.*userId\|userId.*sub" "$BACKEND_DIR" --include="*.js")
if [ ! -z "$JWT_GOOD" ]; then
    report_good "JWT using 'sub' claim found"
else
    echo "⚠️  WARNING: Check JWT implementation for 'sub' claim usage"
fi

echo "5. Checking for req.user.id usage..."
echo "-----------------------------------"

# Check for proper req.user.id usage
REQ_USER_GOOD=$(grep -rn "req\.user\.id" "$BACKEND_DIR" --include="*.js" | wc -l)
if [ "$REQ_USER_GOOD" -gt 0 ]; then
    report_good "Found $REQ_USER_GOOD instances of req.user.id usage"
else
    echo "⚠️  WARNING: No req.user.id usage found - check authentication implementation"
fi

echo "6. Checking for audit logging..."
echo "-------------------------------"

# Check for audit logging usage
AUDIT_GOOD=$(grep -rn "AuditLogger\|audit_logs" "$BACKEND_DIR" --include="*.js" | wc -l)
if [ "$AUDIT_GOOD" -gt 0 ]; then
    report_good "Found $AUDIT_GOOD instances of audit logging"
else
    echo "⚠️  WARNING: No audit logging found"
fi

echo "7. Checking for UUID validation..."
echo "---------------------------------"

# Check for UUID validation
UUID_VALIDATION=$(grep -rn "uuidRegex\|isValidUUID" "$BACKEND_DIR" --include="*.js" | wc -l)
if [ "$UUID_VALIDATION" -gt 0 ]; then
    report_good "Found UUID validation"
else
    echo "⚠️  WARNING: No UUID validation found"
fi

echo "8. Checking for foreign key constraints..."
echo "-----------------------------------------"

# Check database files for foreign key constraints
FK_CONSTRAINTS=$(grep -rn "REFERENCES.*users(id)" "$BACKEND_DIR/../database" --include="*.sql" | wc -l)
if [ "$FK_CONSTRAINTS" -gt 0 ]; then
    report_good "Found $FK_CONSTRAINTS foreign key constraints to users(id)"
else
    echo "⚠️  WARNING: Check foreign key constraints in database schema"
fi

echo ""
echo "🔍 AUDIT SUMMARY"
echo "================"
echo "Total violations found: $VIOLATIONS_FOUND"
echo ""

if [ "$VIOLATIONS_FOUND" -eq 0 ]; then
    echo "🎉 EXCELLENT! No identity violations found."
    echo "   Backend follows immutable user identity principles."
else
    echo "🚨 ATTENTION REQUIRED!"
    echo "   Found $VIOLATIONS_FOUND violations that need to be fixed."
    echo "   Review and fix all violations before production deployment."
fi

echo ""
echo "📋 NEXT STEPS:"
echo "1. Fix all reported violations"
echo "2. Run database migration: identity-hardening-migration.sql"
echo "3. Test authentication flow end-to-end"
echo "4. Verify audit logs are being created"
echo "5. Re-run this audit script to confirm fixes"

exit $VIOLATIONS_FOUND

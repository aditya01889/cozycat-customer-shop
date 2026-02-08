#!/usr/bin/env node

/**
 * Performance Audit Execution Script
 * Runs the performance audit and saves results to a file
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configuration
const RESULTS_DIR = path.join(__dirname, '../results');
const AUDIT_FILE = path.join(RESULTS_DIR, `performance-audit-${new Date().toISOString().split('T')[0]}.json`);
const SQL_FILE = path.join(__dirname, 'audit.sql');

// Create results directory if it doesn't exist
if (!fs.existsSync(RESULTS_DIR)) {
    fs.mkdirSync(RESULTS_DIR, { recursive: true });
}

console.log('🔍 Starting Performance Audit...');
console.log(`📁 Results will be saved to: ${AUDIT_FILE}`);

try {
    // Check if audit.sql exists
    if (!fs.existsSync(SQL_FILE)) {
        throw new Error(`Audit SQL file not found: ${SQL_FILE}`);
    }

    // Read the audit SQL
    const auditSQL = fs.readFileSync(SQL_FILE, 'utf8');
    
    console.log('📊 Performance audit SQL loaded successfully');
    console.log('⚠️  To execute this audit, run the following in Supabase SQL Editor:');
    console.log('\n' + '='.repeat(80));
    console.log('COPY AND PASTE THE FOLLOWING INTO SUPABASE SQL EDITOR:');
    console.log('='.repeat(80));
    console.log(auditSQL);
    console.log('='.repeat(80));
    console.log('\n📝 After running the audit, save the results to a file and run:');
    console.log(`node ${path.join(__dirname, 'analyze-results.js')}`);
    
    // Save audit instructions
    const instructions = `
PERFORMANCE AUDIT INSTRUCTIONS
=============================
Date: ${new Date().toISOString()}

1. Go to Supabase Dashboard → SQL Editor
2. Copy the SQL above and paste it into the editor
3. Run the query
4. Export results as CSV or JSON
5. Save results to: ${AUDIT_FILE}
6. Run: node ${path.join(__dirname, 'analyze-results.js')}

Expected Results Sections:
- Slow Queries Analysis
- Table Size Analysis  
- Missing Indexes Analysis
- Index Usage Analysis
- Connection Analysis
- Table Bloat Analysis
- Cache Performance Analysis
- Optimization Recommendations
`;

    fs.writeFileSync(path.join(RESULTS_DIR, 'audit-instructions.md'), instructions);
    console.log('\n📋 Instructions saved to:', path.join(RESULTS_DIR, 'audit-instructions.md'));
    
} catch (error) {
    console.error('❌ Error running performance audit:', error.message);
    process.exit(1);
}

console.log('\n✅ Performance audit script completed successfully!');
console.log('🚀 Next step: Execute the SQL in Supabase and then run the results analyzer.');

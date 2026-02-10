const fs = require('fs')
const path = require('path')

// Baseline performance metrics (from initial optimization)
const BASELINE_METRICS = {
  pageLoadTime: {
    home: 1200,      // ms
    products: 1500,  // ms
    admin: 1000,     // ms
    productionQueue: 1300 // ms
  },
  apiResponseTime: {
    products: 800,    // ms
    dashboard: 600,   // ms
    cache: 100        // ms
  },
  cacheHitRate: 95,      // %
  errorRate: 2,         // %
  bundleSize: {
    total: 800,         // KB
    largest: 50         // KB
  }
}

// Regression detection thresholds
const REGRESSION_THRESHOLDS = {
  pageLoadTime: 1.5,    // 50% increase
  apiResponseTime: 1.5,  // 50% increase
  cacheHitRate: 0.8,      // 20% decrease
  errorRate: 2.0,        // 2x increase
  bundleSize: 1.5        // 50% increase
}

class RegressionDetector {
  constructor() {
    this.regressions = []
    this.warnings = []
    this.improvements = []
  }

  async analyzePerformance(testResults) {
    console.log('🔍 Analyzing performance for regressions...')
    
    const analysis = {
      timestamp: new Date().toISOString(),
      regressions: [],
      warnings: [],
      improvements: [],
      summary: {
        totalIssues: 0,
        criticalIssues: 0,
        warningsCount: 0,
        improvementsCount: 0
      }
    }

    // Analyze page load times
    if (testResults.performance?.pageLoads) {
      const pageLoads = testResults.performance.pageLoads
      
      Object.entries(BASELINE_METRICS.pageLoadTime).forEach(([page, baseline]) => {
        const current = pageLoads.average || 0
        const regressionFactor = current / baseline
        
        if (regressionFactor > REGRESSION_THRESHOLDS.pageLoadTime) {
          analysis.regressions.push({
            type: 'pageLoadTime',
            page,
            baseline,
            current,
            regressionFactor,
            severity: regressionFactor > 2 ? 'critical' : 'high'
          })
          analysis.summary.criticalIssues++
        } else if (regressionFactor > 1.2) {
          analysis.warnings.push({
            type: 'pageLoadTime',
            page,
            baseline,
            current,
            regressionFactor,
            severity: 'medium'
          })
          analysis.summary.warningsCount++
        } else if (regressionFactor < 0.8) {
          analysis.improvements.push({
            type: 'pageLoadTime',
            page,
            baseline,
            current,
            improvementFactor: 1 / regressionFactor,
            severity: 'positive'
          })
          analysis.summary.improvementsCount++
        }
      })
    }

    // Analyze API response times
    if (testResults.performance?.apiCalls) {
      const apiCalls = testResults.performance.apiCalls
      
      Object.entries(BASELINE_METRICS.apiResponseTime).forEach(([api, baseline]) => {
        const current = apiCalls.average || 0
        const regressionFactor = current / baseline
        
        if (regressionFactor > REGRESSION_THRESHOLDS.apiResponseTime) {
          analysis.regressions.push({
            type: 'apiResponseTime',
            api,
            baseline,
            current,
            regressionFactor,
            severity: regressionFactor > 2 ? 'critical' : 'high'
          })
          analysis.summary.criticalIssues++
        } else if (regressionFactor > 1.2) {
          analysis.warnings.push({
            type: 'apiResponseTime',
            api,
            baseline,
            current,
            regressionFactor,
            severity: 'medium'
          })
          analysis.summary.warningsCount++
        } else if (regressionFactor < 0.8) {
          analysis.improvements.push({
            type: 'apiResponseTime',
            api,
            baseline,
            current,
            improvementFactor: 1 / regressionFactor,
            severity: 'positive'
          })
          analysis.summary.improvementsCount++
        }
      })
    }

    // Analyze cache performance
    if (testResults.performance?.cache) {
      const cacheHitRate = parseFloat(testResults.performance.cache.hitRate)
      const baseline = BASELINE_METRICS.cacheHitRate
      const regressionFactor = baseline / cacheHitRate
      
      if (regressionFactor > REGRESSION_THRESHOLDS.cacheHitRate) {
        analysis.regressions.push({
          type: 'cacheHitRate',
          baseline,
          current: cacheHitRate,
          regressionFactor,
          severity: regressionFactor > 2 ? 'critical' : 'high'
        })
        analysis.summary.criticalIssues++
      } else if (regressionFactor > 1.2) {
        analysis.warnings.push({
          type: 'cacheHitRate',
          baseline,
          current: cacheHitRate,
          regressionFactor,
          severity: 'medium'
        })
        analysis.summary.warningsCount++
      } else if (cacheHitRate > baseline) {
        analysis.improvements.push({
          type: 'cacheHitRate',
          baseline,
          current: cacheHitRate,
          improvementFactor: cacheHitRate / baseline,
          severity: 'positive'
        })
        analysis.summary.improvementsCount++
      }
    }

    // Analyze error rate
    if (testResults.performance?.errors) {
      const errorRate = parseFloat(testResults.performance.errors.rate)
      const baseline = BASELINE_METRICS.errorRate
      const regressionFactor = errorRate / baseline
      
      if (regressionFactor > REGRESSION_THRESHOLDS.errorRate) {
        analysis.regressions.push({
          type: 'errorRate',
          baseline,
          current: errorRate,
          regressionFactor,
          severity: regressionFactor > 3 ? 'critical' : 'high'
        })
        analysis.summary.criticalIssues++
      } else if (errorRate > baseline * 1.5) {
        analysis.warnings.push({
          type: 'errorRate',
          baseline,
          current: errorRate,
          regressionFactor,
          severity: 'medium'
        })
        analysis.summary.warningsCount++
      } else if (errorRate < baseline && errorRate > 0) {
        analysis.improvements.push({
          type: 'errorRate',
          baseline,
          current: errorRate,
          improvementFactor: baseline / errorRate,
          severity: 'positive'
        })
        analysis.summary.improvementsCount++
      }
    }

    analysis.summary.totalIssues = analysis.regressions.length + analysis.warnings.length

    return analysis
  }

  async analyzeBundleSize() {
    console.log('📦 Analyzing bundle size for regressions...')
    
    try {
      // Try to find bundle analysis results
      const bundleAnalysisPath = 'bundle-analysis-results.json'
      
      if (fs.existsSync(bundleAnalysisPath)) {
        const bundleData = JSON.parse(fs.readFileSync(bundleAnalysisPath, 'utf8'))
        
        const analysis = {
          timestamp: new Date().toISOString(),
          bundleAnalysis: bundleData,
          regressions: [],
          warnings: [],
          improvements: []
        }

        // Check total bundle size
        if (bundleData.totalSize) {
          const currentSize = bundleData.totalSize
          const baseline = BASELINE_METRICS.bundleSize.total
          const regressionFactor = currentSize / baseline
          
          if (regressionFactor > REGRESSION_THRESHOLDS.bundleSize) {
            analysis.regressions.push({
              type: 'bundleSize',
              component: 'total',
              baseline,
              current: currentSize,
              regressionFactor,
              severity: regressionFactor > 2 ? 'critical' : 'high'
            })
          } else if (regressionFactor > 1.2) {
            analysis.warnings.push({
              type: 'bundleSize',
              component: 'total',
              baseline,
              current: currentSize,
              regressionFactor,
              severity: 'medium'
            })
          } else if (regressionFactor < 0.8) {
            analysis.improvements.push({
              type: 'bundleSize',
              component: 'total',
              baseline,
              current: currentSize,
              improvementFactor: 1 / regressionFactor,
              severity: 'positive'
            })
          }
        }

        // Check largest component
        if (bundleData.largestComponent) {
          const currentSize = bundleData.largestComponent.size
          const baseline = BASELINE_METRICS.bundleSize.largest
          const regressionFactor = currentSize / baseline
          
          if (regressionFactor > REGRESSION_THRESHOLDS.bundleSize) {
            analysis.regressions.push({
              type: 'bundleSize',
              component: bundleData.largestComponent.name,
              baseline,
              current: currentSize,
              regressionFactor,
              severity: regressionFactor > 2 ? 'critical' : 'high'
            })
          }
        }

        return analysis
      } else {
        return {
          timestamp: new Date().toISOString(),
          message: 'Bundle analysis results not found',
          recommendations: ['Run bundle analysis first: node scripts/analyze-bundle.js']
        }
      }
    } catch (error) {
      return {
        timestamp: new Date().toISOString(),
        error: error.message,
        recommendations: ['Check bundle analysis configuration']
      }
    }
  }

  async analyzeCodeQuality() {
    console.log('🔍 Analyzing code quality for potential issues...')
    
    const analysis = {
      timestamp: new Date().toISOString(),
      issues: [],
      recommendations: []
    }

    try {
      // Check for common code quality issues
      const projectRoot = process.cwd()
      
      // Check for console.log statements (should be removed in production)
      const { execSync } = require('child_process')
      
      try {
        const consoleLogs = execSync(`grep -r "console\\.log" ${projectRoot}/app --include="*.tsx" --include="*.ts" | wc -l`, { encoding: 'utf8' })
        const consoleLogCount = parseInt(consoleLogs.trim())
        
        if (consoleLogCount > 10) {
          analysis.issues.push({
            type: 'codeQuality',
            severity: 'medium',
            issue: `Found ${consoleLogCount} console.log statements in app directory`,
            recommendation: 'Remove or replace with proper logging'
          })
        }
      } catch (error) {
        // grep not available, skip this check
      }

      // Check for TODO comments
      try {
        const todos = execSync(`grep -r "TODO\\|FIXME\\|HACK" ${projectRoot} --include="*.tsx" --include="*.ts" | wc -l`, { encoding: 'utf8' })
        const todoCount = parseInt(todos.trim())
        
        if (todoCount > 5) {
          analysis.issues.push({
            type: 'codeQuality',
            severity: 'low',
            issue: `Found ${todoCount} TODO/FIXME/HACK comments`,
            recommendation: 'Address outstanding TODO items'
          })
        }
      } catch (error) {
        // grep not available, skip this check
      }

      // Check for large files
      try {
        const largeFiles = execSync(`find ${projectRoot}/app -name "*.tsx" -o -name "*.ts" -exec wc -l {} + | sort -nr | head -10`, { encoding: 'utf8' })
        const lines = largeFiles.split('\n').filter(line => line.trim())
        
        lines.forEach(line => {
          const match = line.trim().match(/^(\d+)\s+(.+)$/)
          if (match) {
            const lineCount = parseInt(match[1])
            const filePath = match[2]
            
            if (lineCount > 500) {
              analysis.issues.push({
                type: 'codeQuality',
                severity: 'medium',
                issue: `Large file: ${filePath} (${lineCount} lines)`,
                recommendation: 'Consider splitting into smaller components'
              })
            }
          }
        })
      } catch (error) {
        // find command not available, skip this check
      }

    } catch (error) {
      analysis.error = error.message
    }

    return analysis
  }

  generateReport(analysis) {
    console.log('\n📊 Regression Detection Report')
    console.log('============================')
    
    console.log(`Timestamp: ${analysis.timestamp}`)
    
    if (analysis.regressions && analysis.regressions.length > 0) {
      console.log('\n🚨 REGRESSIONS DETECTED')
      console.log('========================')
      
      analysis.regressions.forEach((regression, index) => {
        const icon = regression.severity === 'critical' ? '🚨' : regression.severity === 'high' ? '⚠️' : '⚡'
        console.log(`${index + 1}. ${icon} ${regression.type}: ${regression.current} (baseline: ${regression.baseline})`)
        console.log(`   Severity: ${regression.severity}, Factor: ${regression.regressionFactor.toFixed(2)}x`)
      })
    }
    
    if (analysis.warnings && analysis.warnings.length > 0) {
      console.log('\n⚠️ WARNINGS')
      console.log('==========')
      
      analysis.warnings.forEach((warning, index) => {
        console.log(`${index + 1}. ⚠️ ${warning.type}: ${warning.current} (baseline: ${warning.baseline})`)
        console.log(`   Severity: ${warning.severity}, Factor: ${warning.regressionFactor.toFixed(2)}x`)
      })
    }
    
    if (analysis.improvements && analysis.improvements.length > 0) {
      console.log('\n✅ IMPROVEMENTS')
      console.log('==============')
      
      analysis.improvements.forEach((improvement, index) => {
        console.log(`${index + 1}. ✅ ${improvement.type}: ${improvement.current} (baseline: ${improvement.baseline})`)
        console.log(`   Improvement: ${improvement.improvementFactor.toFixed(2)}x`)
      })
    }
    
    if (analysis.issues && analysis.issues.length > 0) {
      console.log('\n🔧 CODE QUALITY ISSUES')
      console.log('====================')
      
      analysis.issues.forEach((issue, index) => {
        console.log(`${index + 1}. ${issue.severity === 'high' ? '🔴' : issue.severity === 'medium' ? '🟡' : '🟡'} ${issue.issue}`)
        console.log(`   Recommendation: ${issue.recommendation}`)
      })
    }
    
    if (analysis.recommendations && analysis.recommendations.length > 0) {
      console.log('\n💡 RECOMMENDATIONS')
      console.log('==================')
      
      analysis.recommendations.forEach((rec, index) => {
        console.log(`${index + 1}. ${rec}`)
      })
    }
    
    // Overall status
    const totalIssues = (analysis.regressions?.length || 0) + (analysis.warnings?.length || 0)
    const criticalIssues = analysis.regressions?.filter(r => r.severity === 'critical').length || 0
    
    console.log('\n📈 OVERALL STATUS')
    console.log('================')
    
    if (criticalIssues > 0) {
      console.log(`🚨 CRITICAL: ${criticalIssues} critical regressions detected`)
    } else if (totalIssues > 0) {
      console.log(`⚠️ WARNING: ${totalIssues} issues found (${analysis.regressions?.length || 0} regressions, ${analysis.warnings?.length || 0} warnings)`)
    } else {
      console.log('✅ EXCELLENT: No regressions detected')
    }
    
    return analysis
  }
}

// Main regression detection function
async function detectRegressions(testResultsPath = 'optimization-test-results.json') {
  console.log('🔍 Starting Regression Detection Analysis')
  console.log('=====================================')
  
  const detector = new RegressionDetector()
  
  try {
    // Load test results
    let testResults
    if (fs.existsSync(testResultsPath)) {
      testResults = JSON.parse(fs.readFileSync(testResultsPath, 'utf8'))
    } else {
      throw new Error(`Test results file not found: ${testResultsPath}`)
    }
    
    // Run all analyses
    const performanceAnalysis = await detector.analyzePerformance(testResults)
    const bundleAnalysis = await detector.analyzeBundleSize()
    const codeQualityAnalysis = await detector.analyzeCodeQuality()
    
    // Generate comprehensive report
    const report = {
      timestamp: new Date().toISOString(),
      testResults,
      performanceAnalysis,
      bundleAnalysis,
      codeQualityAnalysis,
      summary: {
        totalRegressions: performanceAnalysis.regressions?.length || 0,
        totalWarnings: performanceAnalysis.warnings?.length || 0,
        totalImprovements: performanceAnalysis.improvements?.length || 0,
        criticalIssues: performanceAnalysis.summary?.criticalIssues || 0,
        overallStatus: (performanceAnalysis.summary?.criticalIssues || 0) > 0 ? 'CRITICAL' : 
                      ((performanceAnalysis.summary?.totalIssues || 0) > 0 ? 'WARNING' : 'EXCELLENT')
      }
    }
    
    // Save report
    fs.writeFileSync('regression-analysis-results.json', JSON.stringify(report, null, 2))
    
    // Display report
    detector.generateReport(report)
    
    return report
    
  } catch (error) {
      console.error('💥 Regression detection failed:', error.message)
      process.exit(1)
  }
}

// Run regression detection if this file is executed directly
if (require.main === module) {
  detectRegressions().catch(console.error)
}

module.exports = { RegressionDetector, detectRegressions }

# Monitor AI Analysis Progress Script
$jobId = "job_63e01763-b4d0-401e-86f0-efabd23c15c9"
$productId = "prod_2f73f39e-f18a-4fe7-944e-25dcf016ec3c"
$maxAttempts = 30  # 5 minutes total (30 * 10 seconds)
$attempt = 0

Write-Host "🔄 Monitoring AI analysis progress for Job: $jobId" -ForegroundColor Yellow
Write-Host "📊 Product ID: $productId" -ForegroundColor Cyan
Write-Host ""

while ($attempt -lt $maxAttempts) {
    $attempt++
    
    try {
        # Check job status
        $response = Invoke-WebRequest -Uri "http://localhost:8080/api/score/status/$jobId" -Method GET -ErrorAction Stop
        $status = $response.Content | ConvertFrom-Json
        
        Write-Host "Attempt $attempt of $maxAttempts" -ForegroundColor Gray
        Write-Host "Status: $($status.status) | Progress: $($status.progress)%" -ForegroundColor White
        
        if ($status.logs.Count -gt 0) {
            Write-Host "Logs:" -ForegroundColor DarkGray
            foreach ($log in $status.logs) {
                Write-Host "  • $log" -ForegroundColor DarkGray
            }
        }
        
        # Check if analysis is complete
        if ($status.status -eq "completed") {
            Write-Host ""
            Write-Host "✅ AI Analysis Completed Successfully!" -ForegroundColor Green
            Write-Host "🎯 Final Progress: $($status.progress)%" -ForegroundColor Green
            
            # Try to get the final score
            try {
                $scoreResponse = Invoke-WebRequest -Uri "http://localhost:8080/api/score/$productId" -Method GET -ErrorAction Stop
                $score = $scoreResponse.Content | ConvertFrom-Json
                Write-Host ""
                Write-Host "📈 Final Score Results:" -ForegroundColor Cyan
                Write-Host "Overall Score: $($score.overallScore)" -ForegroundColor Green
                Write-Host "Reason: $($score.reasons[0])" -ForegroundColor Yellow
                return
            } catch {
                Write-Host "⚠️  Could not retrieve final score yet" -ForegroundColor Yellow
            }
            return
        }
        
        if ($status.status -eq "failed") {
            Write-Host ""
            Write-Host "❌ AI Analysis Failed!" -ForegroundColor Red
            return
        }
        
        Write-Host ""
        
        # Wait before next check
        Start-Sleep -Seconds 10
        
    } catch {
        Write-Host "❌ Error checking status: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host "Retrying in 10 seconds..." -ForegroundColor Yellow
        Write-Host ""
        Start-Sleep -Seconds 10
    }
}

Write-Host "⏰ Timeout reached - analysis may still be running in background" -ForegroundColor Orange
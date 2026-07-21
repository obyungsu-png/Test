# Test Windows.Media.Ocr API availability (ASCII only)
Write-Host "=== 1. Check Windows.Media.Ocr API ===" -ForegroundColor Cyan

try {
    Add-Type -AssemblyName System.Runtime.WindowsRuntime -ErrorAction Stop
    Write-Host "[OK] System.Runtime.WindowsRuntime loaded"
} catch {
    Write-Host "[FAIL] System.Runtime.WindowsRuntime load failed: $($_.Exception.Message)"
}

try {
    $ocrEngineType = [Windows.Media.Ocr.OcrEngine, Windows.Media.Ocr, ContentType=WindowsRuntime]
    Write-Host "[OK] Windows.Media.Ocr.OcrEngine type loaded"
    Write-Host ""
    Write-Host "--- Static Members ---"
    $ocrEngineType | Get-Member -Static | Select-Object Name, MemberType | Format-Table -AutoSize
    Write-Host ""
    Write-Host "--- Instance Members ---"
    $ocrEngineType | Get-Member | Select-Object Name, MemberType | Format-Table -AutoSize
} catch {
    Write-Host "[FAIL] OcrEngine load failed: $($_.Exception.Message)"
}

Write-Host ""
Write-Host "=== 2. Available OCR Languages ===" -ForegroundColor Cyan
try {
    $languages = [Windows.Media.Ocr.OcrEngine, Windows.Media.Ocr, ContentType=WindowsRuntime]::AvailableRecognizerLanguages
    if ($languages) {
        foreach ($lang in $languages) {
            Write-Host "  - $($lang.LanguageTag)"
        }
    } else {
        Write-Host "  (No OCR languages installed)"
    }
} catch {
    Write-Host "[FAIL] Language query failed: $($_.Exception.Message)"
}

Write-Host ""
Write-Host "=== 3. BitmapDecoder check ===" -ForegroundColor Cyan
try {
    $bmpType = [Windows.Graphics.Imaging.BitmapDecoder, Windows.Graphics.Imaging, ContentType=WindowsRuntime]
    Write-Host "[OK] BitmapDecoder loaded"
} catch {
    Write-Host "[FAIL] BitmapDecoder load failed: $($_.Exception.Message)"
}

# Image OCR using Windows.Media.Ocr API (ASCII only)
# Usage:
#   .\Invoke-Ocr.ps1 -ImagePath "C:\path\to\image.jpg"
#   .\Invoke-Ocr.ps1 -ImagePath "C:\path\to\image.jpg" -Language "ko"
#   "img1.jpg","img2.jpg" | .\Invoke-Ocr.ps1

param(
    [Parameter(Mandatory=$true, ValueFromPipeline=$true)]
    [string[]]$ImagePath,

    [Parameter(Mandatory=$false)]
    [string]$Language,

    [switch]$Detailed
)

begin {
    # --- Load WinRT ---
    Add-Type -AssemblyName System.Runtime.WindowsRuntime -ErrorAction Stop

    # --- Helper: await a WinRT IAsyncOperation (no generic args needed) ---
    # Based on https://github.com/PowerShell/PowerShell/issues/9708
    $asTaskGeneric = ([System.WindowsRuntimeSystemExtensions].GetMethods() |
        Where-Object { $_.Name -eq 'AsTask' -and $_.GetParameters().Count -eq 1 -and $_.GetParameters()[0].ParameterType.Name -eq 'IAsyncOperation`1' } |
        Select-Object -First 1)

    function Await-WinRT {
        param($AsyncOp, $ResultType)
        $asTask = $asTaskGeneric.MakeGenericMethod($ResultType).Invoke($null, @($AsyncOp))
        $asTask.Wait(-1) | Out-Null
        $asTask.Result
    }

    function Await-Action {
        param($AsyncOp)
        $asTask = ([System.WindowsRuntimeSystemExtensions].GetMethods() |
            Where-Object { $_.Name -eq 'AsTask' -and $_.GetParameters().Count -eq 1 -and $_.GetParameters()[0].ParameterType.Name -eq 'IAsyncAction' } |
            Select-Object -First 1).Invoke($null, @($AsyncOp))
        $asTask.Wait(-1) | Out-Null
    }

    # --- Create OCR engine ---
    $ocrEngineType = [Windows.Media.Ocr.OcrEngine, Windows.Media.Ocr, ContentType=WindowsRuntime]
    if ($Language) {
        $langObj = ($ocrEngineType::AvailableRecognizerLanguages | Where-Object { $_.LanguageTag -eq $Language } | Select-Object -First 1)
        if (-not $langObj) {
            throw "Language '$Language' not available. Available: $(($ocrEngineType::AvailableRecognizerLanguages | ForEach-Object { $_.LanguageTag }) -join ', ')"
        }
        $engine = $ocrEngineType::TryCreateFromLanguage($langObj)
    } else {
        $engine = $ocrEngineType::TryCreateFromUserProfileLanguages()
    }
    if (-not $engine) {
        throw "Failed to create OCR engine."
    }
    Write-Host "OCR Engine created. Language: $($engine.RecognizerLanguage.LanguageTag)" -ForegroundColor Cyan
    Write-Host "MaxImageDimension: $($ocrEngineType::MaxImageDimension)" -ForegroundColor DarkGray
    Write-Host ""
}

process {
    foreach ($img in $ImagePath) {
        # Resolve path
        $resolved = if (Test-Path $img) { (Resolve-Path $img).Path } else { $img }
        if (-not (Test-Path $resolved)) {
            Write-Host "[SKIP] File not found: $img" -ForegroundColor Red
            continue
        }

        $fileItem = Get-Item $resolved
        Write-Host "=== OCR: $($fileItem.Name) ($('{0:N0}' -f $fileItem.Length) bytes) ===" -ForegroundColor Yellow

        try {
            # Open file as IStorageFile via UWP StorageFile
            $storageFileType = [Windows.Storage.StorageFile, Windows.Storage, ContentType=WindowsRuntime]
            $asyncFile = $storageFileType::GetFileFromPathAsync($resolved)
            $storageFile = Await-WinRT $asyncFile ([Windows.Storage.StorageFile])

            # Open stream for reading
            $stream = Await-WinRT $storageFile.OpenAsync([Windows.Storage.FileAccessMode]::Read) ([Windows.Storage.Streams.IRandomAccessStream])

            # Decode bitmap
            $decoderType = [Windows.Graphics.Imaging.BitmapDecoder, Windows.Graphics.Imaging, ContentType=WindowsRuntime]
            $decoder = Await-WinRT ($decoderType::CreateAsync($stream)) ([Windows.Graphics.Imaging.BitmapDecoder])
            $bitmap = Await-WinRT $decoder.GetSoftwareBitmapAsync() ([Windows.Graphics.Imaging.SoftwareBitmap])

            # Run OCR
            $ocrResult = Await-WinRT $engine.RecognizeAsync($bitmap) ([Windows.Media.Ocr.OcrResult])

            Write-Host "--- Extracted Text ---" -ForegroundColor Green
            $ocrResult.Text
            Write-Host ""

            if ($Detailed) {
                Write-Host "--- Lines (detailed) ---" -ForegroundColor DarkGray
                foreach ($line in $ocrResult.Lines) {
                    Write-Host "  [$($line.Text)] (angle: $($line.Angle); words: $($line.Words.Count))"
                }
                Write-Host ""
                Write-Host "TextAngle: $($ocrResult.TextAngle)" -ForegroundColor DarkGray
            }

            # Cleanup
            $bitmap.Dispose()
            $stream.Dispose()
        } catch {
            Write-Host "[ERROR] $($_.Exception.Message)" -ForegroundColor Red
            Write-Host $_.Exception.ToString() -ForegroundColor DarkRed
        }

        Write-Host ""
    }
}

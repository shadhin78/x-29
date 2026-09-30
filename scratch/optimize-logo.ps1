Add-Type -AssemblyName System.Drawing

$srcPath = "d:\X-29 Project\X-29\X-29-code\icons\logo-sticker.png"
$img = [System.Drawing.Image]::FromFile($srcPath)
Write-Output "Original: $($img.Width) x $($img.Height)"

# Target 512x512 with high quality bicubic interpolation
$targetWidth = 512
$targetHeight = [int]($img.Height * ($targetWidth / $img.Width))
Write-Output "Target: $targetWidth x $targetHeight"

$bmp = New-Object System.Drawing.Bitmap($targetWidth, $targetHeight, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$graphics = [System.Drawing.Graphics]::FromImage($bmp)
$graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
$graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
$graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality

$graphics.DrawImage($img, 0, 0, $targetWidth, $targetHeight)

$destTestPath = "d:\X-29 Project\X-29\X-29-code\scratch\logo-sticker-test.png"
$bmp.Save($destTestPath, [System.Drawing.Imaging.ImageFormat]::Png)

$graphics.Dispose()
$bmp.Dispose()
$img.Dispose()

$testSize = (Get-Item $destTestPath).Length
Write-Output "Generated test image size: $testSize bytes ($([math]::Round($testSize/1024, 1)) KB)"

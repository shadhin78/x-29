Add-Type -AssemblyName System.Drawing

$srcPath = "d:\X-29 Project\X-29\X-29-code\icons\logo-sticker.png"
$img = [System.Drawing.Image]::FromFile($srcPath)

$canvasSize = 512
# Calculate scaling to fit 512x512 preserving aspect ratio
$scale = [math]::Min($canvasSize / $img.Width, $canvasSize / $img.Height)
$drawWidth = [int]($img.Width * $scale)
$drawHeight = [int]($img.Height * $scale)
$offsetX = [int](($canvasSize - $drawWidth) / 2)
$offsetY = [int](($canvasSize - $drawHeight) / 2)

Write-Output "Scaling: $drawWidth x $drawHeight offset at ($offsetX, $offsetY)"

$bmp = New-Object System.Drawing.Bitmap($canvasSize, $canvasSize, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$graphics = [System.Drawing.Graphics]::FromImage($bmp)
$graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
$graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
$graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
$graphics.Clear([System.Drawing.Color]::Transparent)

$graphics.DrawImage($img, $offsetX, $offsetY, $drawWidth, $drawHeight)

$destTestPath = "d:\X-29 Project\X-29\X-29-code\scratch\logo-sticker-512.png"
$bmp.Save($destTestPath, [System.Drawing.Imaging.ImageFormat]::Png)

$graphics.Dispose()
$bmp.Dispose()
$img.Dispose()

$testSize = (Get-Item $destTestPath).Length
Write-Output "Generated 512x512 image size: $testSize bytes ($([math]::Round($testSize/1024, 1)) KB)"

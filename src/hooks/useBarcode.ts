import { useState, useRef, useEffect } from 'react'
import { Html5QrcodeScanner } from 'html5-qrcode'

export function useBarcode(onScan: (code: string) => void) {
  const [isScanning, setIsScanning] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const scannerRef = useRef<Html5QrcodeScanner | null>(null)

  const startScanning = () => {
    if (scannerRef.current) {
      scannerRef.current.clear()
    }

    const scanner = new Html5QrcodeScanner(
      'barcode-scanner',
      {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
      },
      false
    )

    scanner.render(
      (decodedText) => {
        onScan(decodedText)
        stopScanning()
      },
      (error) => {
        // Ignore frequent scanning errors
        if (!error.includes('No QR code found')) {
          setError(error)
        }
      }
    )

    scannerRef.current = scanner
    setIsScanning(true)
    setError(null)
  }

  const stopScanning = () => {
    if (scannerRef.current) {
      scannerRef.current.clear()
      scannerRef.current = null
    }
    setIsScanning(false)
    setError(null)
  }

  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear()
      }
    }
  }, [])

  return {
    isScanning,
    error,
    startScanning,
    stopScanning,
  }
}
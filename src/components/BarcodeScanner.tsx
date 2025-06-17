import React, { useEffect } from 'react'
import { Camera, CameraOff } from 'lucide-react'

interface BarcodeScannerProps {
  isScanning: boolean
  onStartScan: () => void
  onStopScan: () => void
}

export function BarcodeScanner({ isScanning, onStartScan, onStopScan }: BarcodeScannerProps) {
  useEffect(() => {
    return () => {
      if (isScanning) {
        onStopScan()
      }
    }
  }, [])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-gray-900">Barcode Scanner</h3>
        <button
          onClick={isScanning ? onStopScan : onStartScan}
          className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
            isScanning
              ? 'bg-red-100 text-red-700 hover:bg-red-200'
              : 'bg-green-100 text-green-700 hover:bg-green-200'
          }`}
        >
          {isScanning ? (
            <>
              <CameraOff className="w-4 h-4" />
              Stop Scanning
            </>
          ) : (
            <>
              <Camera className="w-4 h-4" />
              Start Scanning
            </>
          )}
        </button>
      </div>

      {isScanning && (
        <div className="bg-gray-100 rounded-lg p-4">
          <div id="barcode-scanner" className="w-full"></div>
          <p className="text-sm text-gray-600 mt-2 text-center">
            Point your camera at a barcode to scan
          </p>
        </div>
      )}
    </div>
  )
}
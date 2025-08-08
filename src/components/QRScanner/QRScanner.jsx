import React, { useState, useEffect, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import QRCode from 'qrcode';
import './QRScanner.css';

const QRScanner = ({ onScanSuccess, onClose }) => {
  const [scanner, setScanner] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [error, setError] = useState(null);
  const [qrCodeData, setQrCodeData] = useState(null);
  const scannerRef = useRef(null);

  useEffect(() => {
    if (isScanning) {
      startScanner();
    }
    return () => {
      if (scanner) {
        scanner.clear();
      }
    };
  }, [isScanning]);

  const startScanner = () => {
    try {
      const html5QrcodeScanner = new Html5QrcodeScanner(
        "qr-reader",
        { 
          fps: 10, 
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0
        },
        false
      );

      html5QrcodeScanner.render(handleScanSuccess, onScanError);
      setScanner(html5QrcodeScanner);
      setError(null);
    } catch (err) {
      setError('Failed to start scanner. Please check camera permissions.');
      console.error('Scanner error:', err);
    }
  };

  const handleScanSuccess = (decodedText, decodedResult) => {
    try {
      const parsedData = JSON.parse(decodedText);
      setScanResult(parsedData);
      
      // Stop scanning after successful scan
      if (scanner) {
        scanner.clear();
        setIsScanning(false);
      }
      
      // Call the parent callback
      if (onScanSuccess) {
        onScanSuccess(parsedData);
      }
    } catch (err) {
      // If not JSON, treat as simple text
      setScanResult({ type: 'text', data: decodedText });
      
      if (scanner) {
        scanner.clear();
        setIsScanning(false);
      }
      
      if (onScanSuccess) {
        onScanSuccess({ type: 'text', data: decodedText });
      }
    }
  };

  const onScanError = (errorMessage) => {
    // Ignore errors during scanning, only show critical errors
    console.log('Scan error:', errorMessage);
  };

  const generateQRCode = async (data) => {
    try {
      const qrData = JSON.stringify(data);
      const qrCodeUrl = await QRCode.toDataURL(qrData, {
        width: 200,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      setQrCodeData({ data, qrCodeUrl });
    } catch (err) {
      setError('Failed to generate QR code');
      console.error('QR generation error:', err);
    }
  };

  const handleScanButton = () => {
    setIsScanning(true);
    setScanResult(null);
    setError(null);
  };

  const handleGenerateQR = () => {
    const sampleData = {
      type: 'menu',
      restaurantId: 'rest_001',
      menuUrl: '/menu',
      timestamp: new Date().toISOString()
    };
    generateQRCode(sampleData);
  };

  const handleClose = () => {
    if (scanner) {
      scanner.clear();
    }
    setIsScanning(false);
    setScanResult(null);
    setError(null);
    setQrCodeData(null);
    if (onClose) {
      onClose();
    }
  };

  return (
    <div className="qr-scanner-container">
      <div className="qr-scanner-header">
        <h2>QR Code Scanner</h2>
        <button className="close-btn" onClick={handleClose}>
          ✕
        </button>
      </div>

      <div className="qr-scanner-content">
        {!isScanning && !qrCodeData && (
          <div className="scanner-options">
            <div className="option-card">
              <h3>📱 Scan QR Code</h3>
              <p>Scan QR codes to quickly access menus, place orders, or make payments</p>
              <button className="scan-btn" onClick={handleScanButton}>
                Start Scanner
              </button>
            </div>
            
            <div className="option-card">
              <h3>🔄 Generate QR Code</h3>
              <p>Generate QR codes for your menu items or payment links</p>
              <button className="generate-btn" onClick={handleGenerateQR}>
                Generate Sample QR
              </button>
            </div>
          </div>
        )}

        {isScanning && (
          <div className="scanner-view">
            <div className="scanner-instructions">
              <p>📷 Point your camera at a QR code</p>
              <p>Make sure the QR code is clearly visible in the frame</p>
            </div>
            <div id="qr-reader" className="qr-reader"></div>
            <button className="stop-scan-btn" onClick={handleClose}>
              Stop Scanning
            </button>
          </div>
        )}

        {qrCodeData && (
          <div className="qr-code-display">
            <h3>Generated QR Code</h3>
            <div className="qr-code-container">
              <img src={qrCodeData.qrCodeUrl} alt="Generated QR Code" />
            </div>
            <div className="qr-data-info">
              <h4>QR Code Data:</h4>
              <pre>{JSON.stringify(qrCodeData.data, null, 2)}</pre>
            </div>
            <button className="new-qr-btn" onClick={() => setQrCodeData(null)}>
              Generate New QR Code
            </button>
          </div>
        )}

        {scanResult && (
          <div className="scan-result">
            <h3>✅ Scan Successful!</h3>
            <div className="result-data">
              <h4>Scanned Data:</h4>
              <pre>{JSON.stringify(scanResult, null, 2)}</pre>
            </div>
            <div className="result-actions">
              <button className="action-btn primary" onClick={() => setScanResult(null)}>
                Scan Another
              </button>
              <button className="action-btn secondary" onClick={handleClose}>
                Close
              </button>
            </div>
          </div>
        )}

        {error && (
          <div className="scanner-error">
            <h3>❌ Error</h3>
            <p>{error}</p>
            <button className="retry-btn" onClick={handleScanButton}>
              Try Again
            </button>
          </div>
        )}
      </div>

      <div className="scanner-features">
        <h4>Scanner Features:</h4>
        <ul>
          <li>📋 <strong>Menu QR Codes:</strong> Quick access to restaurant menus</li>
          <li>🛒 <strong>Order QR Codes:</strong> Direct ordering for specific items</li>
          <li>💳 <strong>Payment QR Codes:</strong> Secure payment processing</li>
          <li>📍 <strong>Location QR Codes:</strong> Restaurant location and hours</li>
          <li>🎫 <strong>Promo QR Codes:</strong> Special offers and discounts</li>
        </ul>
      </div>
    </div>
  );
};

export default QRScanner; 
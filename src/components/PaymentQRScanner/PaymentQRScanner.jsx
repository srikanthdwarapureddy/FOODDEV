import React, { useState, useEffect } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import './PaymentQRScanner.css';

const PaymentQRScanner = ({ onPaymentSuccess, onClose }) => {
  const [scanner, setScanner] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState(null);

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
        "payment-qr-reader",
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
      
      // Only process payment QR codes
      if (parsedData.type === 'payment') {
        // Stop scanning after successful scan
        if (scanner) {
          scanner.clear();
          setIsScanning(false);
        }
        
        // Call the parent callback with payment data
        if (onPaymentSuccess) {
          onPaymentSuccess(parsedData);
        }
      } else {
        setError('This QR code is not a payment QR code. Please scan a payment QR code.');
      }
    } catch (err) {
      setError('Invalid QR code format. Please scan a valid payment QR code.');
    }
  };

  const onScanError = (errorMessage) => {
    // Ignore errors during scanning, only show critical errors
    console.log('Scan error:', errorMessage);
  };

  const handleStartScan = () => {
    setIsScanning(true);
    setError(null);
  };

  const handleClose = () => {
    if (scanner) {
      scanner.clear();
    }
    setIsScanning(false);
    setError(null);
    if (onClose) {
      onClose();
    }
  };

  return (
    <div className="payment-qr-scanner-container">
      <div className="payment-qr-scanner-header">
        <h2>💳 Payment QR Scanner</h2>
        <p>Scan payment QR codes to process payments securely</p>
        <button className="close-btn" onClick={handleClose}>
          ✕
        </button>
      </div>

      <div className="payment-qr-scanner-content">
        {!isScanning && (
          <div className="scanner-intro">
            <div className="intro-card">
              <h3>📱 Scan Payment QR Code</h3>
              <p>Point your camera at a payment QR code to process payments quickly and securely.</p>
              <div className="payment-features">
                <div className="feature">
                  <span className="feature-icon">🔒</span>
                  <span>Secure Payment Processing</span>
                </div>
                <div className="feature">
                  <span className="feature-icon">⚡</span>
                  <span>Instant Payment</span>
                </div>
                <div className="feature">
                  <span className="feature-icon">📊</span>
                  <span>Payment Tracking</span>
                </div>
              </div>
              <button className="start-scan-btn" onClick={handleStartScan}>
                Start Payment Scanner
              </button>
            </div>
          </div>
        )}

        {isScanning && (
          <div className="scanner-view">
            <div className="scanner-instructions">
              <h3>📷 Point Camera at Payment QR Code</h3>
              <p>Make sure the payment QR code is clearly visible in the frame</p>
              <div className="payment-qr-example">
                <div className="example-info">
                  <strong>Payment QR Code Example:</strong>
                  <pre>{JSON.stringify({
                    type: "payment",
                    amount: 25.50,
                    currency: "USD",
                    description: "Food order payment"
                  }, null, 2)}</pre>
                </div>
              </div>
            </div>
            <div id="payment-qr-reader" className="payment-qr-reader"></div>
            <button className="stop-scan-btn" onClick={handleClose}>
              Stop Scanning
            </button>
          </div>
        )}

        {error && (
          <div className="scanner-error">
            <h3>❌ Error</h3>
            <p>{error}</p>
            <button className="retry-btn" onClick={handleStartScan}>
              Try Again
            </button>
          </div>
        )}
      </div>

      <div className="payment-qr-info">
        <h4>Payment QR Code Features:</h4>
        <ul>
          <li>💳 <strong>Secure Processing:</strong> Encrypted payment data</li>
          <li>💰 <strong>Amount Validation:</strong> Verify payment amounts</li>
          <li>🌐 <strong>Currency Support:</strong> Multiple currencies</li>
          <li>📱 <strong>Mobile Friendly:</strong> Works on all devices</li>
          <li>🔒 <strong>PCI Compliant:</strong> Secure payment handling</li>
        </ul>
      </div>
    </div>
  );
};

export default PaymentQRScanner; 
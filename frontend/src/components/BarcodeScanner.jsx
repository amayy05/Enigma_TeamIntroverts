import { useEffect } from 'react';
import { Html5QrcodeScanner, Html5QrcodeSupportedFormats } from 'html5-qrcode';

export default function BarcodeScanner({ onScan, onClose }) {
  useEffect(() => {
    const scanner = new Html5QrcodeScanner(
      "barcode-reader",
      { 
        fps: 10, 
        qrbox: { width: 250, height: 150 },
        formatsToSupport: [
          Html5QrcodeSupportedFormats.EAN_13,
          Html5QrcodeSupportedFormats.EAN_8,
          Html5QrcodeSupportedFormats.UPC_A,
          Html5QrcodeSupportedFormats.UPC_E,
          Html5QrcodeSupportedFormats.CODE_128
        ]
      },
      false
    );

    scanner.render(
      (text) => {
        scanner.clear();
        onScan(text);
      },
      (err) => {
        // We ignore scan errors because it errors on every frame it doesn't find a code
      }
    );

    return () => {
      scanner.clear().catch(e => console.error("Scanner cleanup error", e));
    };
  }, [onScan]);

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
      <style>{`
        /* Hide the annoying red error banner from html5-qrcode */
        #barcode-reader__header_message {
          display: none !important;
          opacity: 0 !important;
          visibility: hidden !important;
        }
        /* Fallbacks in case the ID changes */
        #barcode-reader div[style*="color: red"], 
        #barcode-reader div[style*="color:red"],
        #barcode-reader div[style*="rgba(255"] {
          display: none !important;
          opacity: 0 !important;
          visibility: hidden !important;
          height: 0px !important;
          overflow: hidden !important;
        }
      `}</style>
      <div className="bg-white rounded-3xl p-6 max-w-md w-full relative shadow-2xl animate-slide-up">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold font-display text-on-surface flex items-center gap-2">
            <span translate="no" className="material-symbols-outlined notranslate text-primary">barcode_scanner</span>
            Scan Product Barcode
          </h2>
          <button 
            onClick={onClose}
            className="text-on-surface-variant hover:text-error transition-colors"
          >
            <span translate="no" className="material-symbols-outlined notranslate text-3xl">cancel</span>
          </button>
        </div>
        
        {/* Html5QrcodeScanner will inject its UI into this div */}
        <div id="barcode-reader" className="w-full overflow-hidden rounded-xl border-2 border-primary/20"></div>
        
        <p className="text-sm text-on-surface-variant text-center mt-4">
          Point your camera at the product's barcode to auto-fill details.
        </p>
      </div>
    </div>
  );
}

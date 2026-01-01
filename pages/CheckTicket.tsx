import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, RefreshCw, Calendar, AlertCircle, Zap, ZapOff, SwitchCamera, VideoOff, ScanLine, Barcode } from 'lucide-react';
import { fetchDrawByDate, fetchHistory, checkTicketResult, getCloseMisses } from '../services/lotteryService';
import { CheckedTicket, LotteryDraw } from '../types';
import PageTransition from '../components/PageTransition';

interface CheckTicketProps {
  onChecked: (ticket: CheckedTicket) => void;
}

const CheckTicket: React.FC<CheckTicketProps> = ({ onChecked }) => {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [draw, setDraw] = useState<LotteryDraw | null>(null);
  const [ticketNumber, setTicketNumber] = useState('');
  const [mode, setMode] = useState<'manual' | 'scan'>('manual');
  const [loadingDraw, setLoadingDraw] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  // Camera State
  const [cameraFacing, setCameraFacing] = useState<'environment' | 'user'>('environment');
  const [torchOn, setTorchOn] = useState(false);
  const [hasTorch, setHasTorch] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const barcodeInterval = useRef<any>(null);

  // Initial load
  useEffect(() => {
    const init = async () => {
      setLoadingDraw(true);
      const history = await fetchHistory(1, 0);
      if (history.length > 0) {
        setDraw(history[0]);
        setSelectedDate(history[0].date);
      } else {
        const today = new Date().toISOString().split('T')[0];
        setSelectedDate(today);
      }
      setLoadingDraw(false);
    };
    init();
  }, []);

  // Fetch draw when date changes
  useEffect(() => {
    if (!selectedDate) return;
    
    const fetchDate = async () => {
      setLoadingDraw(true);
      setErrorMsg('');
      const found = await fetchDrawByDate(selectedDate);
      if (found) {
        setDraw(found);
      } else {
        setDraw(null);
        setErrorMsg('No result found for this date.');
      }
      setLoadingDraw(false);
    };

    fetchDate();
  }, [selectedDate]);

  // Barcode Detection Loop
  const startBarcodeDetection = () => {
    // @ts-ignore - BarcodeDetector is experimental but works on modern Android
    if (!('BarcodeDetector' in window)) return;

    // @ts-ignore
    const barcodeDetector = new BarcodeDetector({
      formats: ['code_128', 'code_39', 'ean_13', 'qr_code']
    });

    barcodeInterval.current = setInterval(async () => {
      if (videoRef.current && videoRef.current.readyState === 4) {
        try {
          const barcodes = await barcodeDetector.detect(videoRef.current);
          if (barcodes.length > 0) {
            const code = barcodes[0].rawValue;
            if (code && code.length > 4) {
              const cleanCode = code.replace(/[^a-zA-Z0-9]/g, '');
              if (navigator.vibrate) navigator.vibrate(200);
              setTicketNumber(cleanCode);
              setMode('manual');
            }
          }
        } catch (e) {
          // Silent fail for barcode
        }
      }
    }, 200); // Check faster since it's local
  };

  // Camera Logic
  useEffect(() => {
    const stopCamera = () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => {
          track.stop();
        });
      }
      if (barcodeInterval.current) {
        clearInterval(barcodeInterval.current);
      }
    };

    if (mode === 'scan') {
      const startCamera = async () => {
        setCameraError(null);
        
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
           setCameraError("Camera API not supported.");
           return;
        }

        try {
          stopCamera();
          const stream = await navigator.mediaDevices.getUserMedia({ 
            video: { 
              facingMode: cameraFacing, 
              width: { ideal: 1280 },
              height: { ideal: 720 } 
            }, 
            audio: false 
          });
          
          streamRef.current = stream;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.onloadedmetadata = () => {
              videoRef.current?.play();
              startBarcodeDetection();
            };
          }

          const track = stream.getVideoTracks()[0];
          // @ts-ignore
          const capabilities = track.getCapabilities ? track.getCapabilities() : {};
          // @ts-ignore
          setHasTorch(!!capabilities.torch);

        } catch (err) {
          console.error("Camera error:", err);
          setCameraError("Camera access denied.");
        }
      };
      startCamera();
    } else {
      stopCamera();
    }

    return () => stopCamera();
  }, [mode, cameraFacing]);

  const toggleTorch = async () => {
    if (!streamRef.current) return;
    const track = streamRef.current.getVideoTracks()[0];
    try {
      // @ts-ignore
      await track.applyConstraints({ advanced: [{ torch: !torchOn }] });
      setTorchOn(!torchOn);
    } catch (e) {
      console.error("Torch toggle failed", e);
    }
  };

  const toggleCamera = () => {
    setCameraFacing(prev => prev === 'environment' ? 'user' : 'environment');
    setTorchOn(false); 
  };

  const handleCheck = () => {
    if (!draw) {
        alert("Cannot verify: No draw results loaded for this date.");
        return;
    }
    if (!ticketNumber) return;

    const { status, prize } = checkTicketResult(draw, ticketNumber);

    const result: CheckedTicket = {
      id: Math.random().toString(36).substr(2, 9),
      ticketNumber,
      lotteryName: draw.name,
      drawDate: draw.date,
      status: status === 'WIN' ? 'WIN' : 'MISS',
      prizeCategory: prize?.category,
      prizeAmount: prize?.amount,
      timestamp: Date.now(),
    };

    onChecked(result);
    navigate('/result', { 
      state: { 
        result, 
        draw,
        closeMisses: status === 'MISS' ? getCloseMisses(draw, ticketNumber) : []
      } 
    });
  };

  return (
    <PageTransition className="p-6 bg-white dark:bg-black">
      <header className="flex items-center mb-8 relative">
        <button onClick={() => navigate(-1)} className="absolute left-0 p-2 text-slate-500 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-900 rounded-full transition-colors">
          <ArrowLeft size={24} />
        </button>
        <h1 className="w-full text-center text-xl font-bold text-slate-900 dark:text-white">Result Checker</h1>
      </header>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-bold text-slate-500 dark:text-zinc-500 mb-2 uppercase tracking-tighter flex items-center gap-2">
            <Calendar size={14} /> Select Draw Date
          </label>
          <div className="relative">
            <input 
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              max={new Date().toISOString().split('T')[0]} 
              className="w-full bg-slate-100 dark:bg-zinc-900 border-none text-slate-900 dark:text-white rounded-2xl py-4 px-4 appearance-none focus:outline-none focus:ring-2 focus:ring-emerald-500/20 font-bold text-lg color-scheme-dark"
            />
          </div>
          
          <div className="mt-2 min-h-[1.5rem]">
            {loadingDraw ? (
               <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
                 <Loader2 size={12} className="animate-spin" /> Fetching draw details...
               </div>
            ) : errorMsg ? (
               <div className="flex items-center gap-2 text-red-500 text-xs font-bold">
                 <AlertCircle size={12} /> {errorMsg}
               </div>
            ) : draw ? (
               <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-xs font-bold bg-emerald-50 dark:bg-emerald-900/30 p-2 rounded-lg inline-flex">
                 <span>Active Draw: {draw.name}</span>
               </div>
            ) : null}
          </div>
        </div>

        <div className="pt-2">
          <div className="bg-slate-100 dark:bg-zinc-900 p-1 rounded-2xl flex gap-1 mb-6">
            <button 
              onClick={() => setMode('manual')}
              className={`flex-1 py-3 px-4 rounded-xl text-sm font-bold transition-all ${mode === 'manual' ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-zinc-500'}`}
            >
              Manual Entry
            </button>
            <button 
              onClick={() => setMode('scan')}
              className={`flex-1 py-3 px-4 rounded-xl text-sm font-bold transition-all ${mode === 'scan' ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-zinc-500'}`}
            >
              Scanner
            </button>
          </div>

          {mode === 'manual' ? (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
              <div>
                <label className="block text-sm font-bold text-slate-500 dark:text-zinc-500 mb-2 uppercase tracking-tighter">Ticket Number</label>
                <div className="relative">
                  <input 
                    type="text" 
                    placeholder="e.g. WN 123456"
                    value={ticketNumber}
                    onChange={(e) => setTicketNumber(e.target.value)}
                    className="w-full bg-white dark:bg-zinc-900 border-2 border-slate-100 dark:border-zinc-800 text-slate-900 dark:text-white text-4xl font-black rounded-3xl py-8 px-6 focus:outline-none focus:border-emerald-500/50 placeholder:text-slate-100 dark:placeholder:text-zinc-800 text-center uppercase tracking-widest"
                  />
                  <div className="absolute right-6 top-1/2 -translate-y-1/2 p-2 bg-slate-50 dark:bg-zinc-800 rounded-xl text-slate-300 dark:text-zinc-600">
                    <RefreshCw size={18} />
                  </div>
                </div>
              </div>

              <button 
                onClick={handleCheck}
                disabled={!ticketNumber || !draw}
                className="w-full bg-emerald-500 disabled:bg-slate-200 dark:disabled:bg-zinc-800 disabled:text-slate-400 dark:disabled:text-zinc-600 text-white font-black py-5 rounded-3xl text-lg shadow-lg shadow-emerald-100 dark:shadow-none active:scale-95 transition-all"
              >
                VERIFY TICKET
              </button>
            </div>
          ) : (
            <div className="bg-slate-900 aspect-[4/5] rounded-[2.5rem] flex flex-col items-center justify-center text-white relative overflow-hidden shadow-2xl animate-in fade-in scale-95 duration-200">
               {cameraError ? (
                 <div className="p-8 text-center">
                   <VideoOff size={48} className="mx-auto mb-4 text-slate-500" />
                   <p className="text-sm font-bold text-slate-300 mb-2">Camera Unavailable</p>
                   <p className="text-xs text-slate-500 mb-6">{cameraError}</p>
                   <button 
                     onClick={() => setMode('manual')}
                     className="bg-emerald-600 text-white px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest"
                   >
                     Switch to Manual
                   </button>
                 </div>
               ) : (
                 <>
                   <video 
                     ref={videoRef} 
                     autoPlay 
                     playsInline 
                     className="absolute inset-0 w-full h-full object-cover"
                   />
                   
                   {/* Controls Overlay */}
                   <div className="absolute top-6 right-6 flex flex-col gap-4 z-20">
                     {hasTorch && (
                       <button onClick={toggleTorch} className="w-10 h-10 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20 active:scale-90 transition-all">
                         {torchOn ? <Zap size={20} className="text-yellow-400 fill-yellow-400" /> : <ZapOff size={20} className="text-white" />}
                       </button>
                     )}
                     <button onClick={toggleCamera} className="w-10 h-10 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20 active:scale-90 transition-all">
                       <SwitchCamera size={20} className="text-white" />
                     </button>
                   </div>
                   
                   {/* Viewfinder Overlay */}
                   <div className="absolute inset-0 flex flex-col items-center justify-center p-8 pointer-events-none z-10">
                      <div className="w-full aspect-[2/1] border-2 border-emerald-500/80 border-dashed rounded-3xl relative shadow-[0_0_0_9999px_rgba(0,0,0,0.5)]">
                         <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-emerald-400 rounded-tl-lg"></div>
                         <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-emerald-400 rounded-tr-lg"></div>
                         <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-emerald-400 rounded-bl-lg"></div>
                         <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-emerald-400 rounded-br-lg"></div>
                         
                         {/* Scan Line Animation */}
                         <div className="absolute left-2 right-2 h-0.5 bg-red-500/80 top-1/2 -translate-y-1/2 animate-scan shadow-[0_0_10px_rgba(239,68,68,0.8)]"></div>
                      </div>
                      
                      <div className="mt-8 flex items-center gap-2 bg-black/60 px-4 py-2 rounded-full backdrop-blur-md">
                        <Barcode size={16} className="text-emerald-400" />
                        <p className="text-xs font-bold text-white/90">
                           Auto-Scanning for Barcode...
                        </p>
                      </div>
                   </div>
                 </>
               )}
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  );
};

export default CheckTicket;
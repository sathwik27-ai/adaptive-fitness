import React, { useRef, useState, useEffect, useCallback } from 'react';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import { Camera, CameraOff, Activity, AlertTriangle, CheckCircle2, TrendingUp, History, Info } from 'lucide-react';
import { useSavePostureSessionMutation } from '../services/apiSlice';
import { toast } from 'react-hot-toast';


// Keypoint indices for MoveNet
const KP = {
    NOSE: 0,
    L_EYE: 1, R_EYE: 2,
    L_EAR: 3, R_EAR: 4,
    L_SHOULDER: 5, R_SHOULDER: 6,
    L_ELBOW: 7, R_ELBOW: 8,
    L_WRIST: 9, R_WRIST: 10,
    L_HIP: 11, R_HIP: 12,
    L_KNEE: 13, R_KNEE: 14,
    L_ANKLE: 15, R_ANKLE: 16,
};

export default function PostureDetection() {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const detectorRef = useRef(null);
    const animRef = useRef(null);
    const sessionDataRef = useRef({ scores: [], corrections: 0, startTime: null });

    const [active, setActive] = useState(false);
    const [loading, setLoading] = useState(false);
    const [angles, setAngles] = useState({});
    const [posture, setPosture] = useState('neutral'); // 'good' | 'bad' | 'neutral'
    const [message, setMessage] = useState('Position yourself in front of the camera');
    const [score, setScore] = useState(100);
    const [error, setError] = useState(null);
    const [sessionSummary, setSessionSummary] = useState(null);

    const [saveSession] = useSavePostureSessionMutation();

    const startCamera = useCallback(async () => {
        setLoading(true);
        setError(null);
        setSessionSummary(null);
        sessionDataRef.current = { scores: [], corrections: 0, startTime: Date.now() };

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480, facingMode: 'user' } });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                await videoRef.current.play();
            }

            // Dynamically load TF + MoveNet
            const tf = await import('@tensorflow/tfjs-core');
            await import('@tensorflow/tfjs-backend-webgl');
            await tf.setBackend('webgl');
            await tf.ready();
            const poseDetection = await import('@tensorflow-models/pose-detection');
            const detector = await poseDetection.createDetector(poseDetection.SupportedModels.MoveNet, {
                modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING,
            });
            detectorRef.current = detector;
            setActive(true);
            setLoading(false);
            detectLoop();
        } catch (err) {
            setError(err.message || 'Failed to start camera');
            setLoading(false);
        }
    }, []);

    const stopCamera = useCallback(async () => {
        if (animRef.current) cancelAnimationFrame(animRef.current);
        if (videoRef.current?.srcObject) {
            videoRef.current.srcObject.getTracks().forEach(t => t.stop());
            videoRef.current.srcObject = null;
        }
        detectorRef.current = null;
        setActive(false);
        setPosture('neutral');
        setAngles({});

        // Calculate and save session summary
        const { scores, corrections, startTime } = sessionDataRef.current;
        if (scores.length > 0) {
            const avgScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
            const duration = Math.round((Date.now() - startTime) / 1000);

            const summary = { avgScore, duration, correctionsTriggered: corrections };
            setSessionSummary(summary);

            try {
                await saveSession(summary).unwrap();
                toast.success('Posture session saved!');
            } catch (err) {
                toast.error('Failed to save session');
            }
        }

        const ctx = canvasRef.current?.getContext('2d');
        if (ctx) ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }, [saveSession]);

    const detectLoop = useCallback(async () => {
        if (!detectorRef.current || !videoRef.current || videoRef.current.readyState < 2) {
            animRef.current = requestAnimationFrame(detectLoop);
            return;
        }

        const poses = await detectorRef.current.estimatePoses(videoRef.current);
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (poses.length > 0) {
            const kps = poses[0].keypoints;
            const get = (idx) => kps[idx];

            // Draw skeleton
            const connections = [
                [KP.L_SHOULDER, KP.L_HIP], [KP.L_HIP, KP.L_KNEE], [KP.L_KNEE, KP.L_ANKLE],
                [KP.R_SHOULDER, KP.R_HIP], [KP.R_HIP, KP.R_KNEE], [KP.R_KNEE, KP.R_ANKLE],
                [KP.L_SHOULDER, KP.R_SHOULDER], [KP.L_HIP, KP.R_HIP],
                [KP.NOSE, KP.L_SHOULDER], [KP.NOSE, KP.R_SHOULDER],
                [KP.L_EAR, KP.L_SHOULDER], [KP.R_EAR, KP.R_SHOULDER]
            ];

            ctx.lineWidth = 4;
            connections.forEach(([a, b]) => {
                const pa = get(a), pb = get(b);
                if (pa?.score > 0.25 && pb?.score > 0.25) {
                    ctx.beginPath();
                    ctx.moveTo(pa.x, pa.y);
                    ctx.lineTo(pb.x, pb.y);
                    ctx.strokeStyle = '#2F5D3A';
                    ctx.stroke();
                }
            });

            kps.forEach(kp => {
                if (kp.score > 0.25) {
                    ctx.beginPath();
                    ctx.arc(kp.x, kp.y, 6, 0, 2 * Math.PI);
                    ctx.fillStyle = kp.name?.includes('ear') ? '#8C6FAE' : '#E59A3A';
                    ctx.fill();
                }
            });

            // Posture Analysis
            const nose = get(KP.NOSE);
            const ls = get(KP.L_SHOULDER), rs = get(KP.R_SHOULDER);
            const lh = get(KP.L_HIP), rh = get(KP.R_HIP);
            const le = get(KP.L_EAR), re = get(KP.R_EAR);
            const lk = get(KP.L_KNEE), rk = get(KP.R_KNEE);

            const newAngles = {};
            let currentScore = 100;
            let currentMsg = "Good posture 👍";
            let badPosture = false;

            // Determine visibility states
            const hasLeft = ls.score > 0.3 && lh.score > 0.3;
            const hasRight = rs.score > 0.3 && rh.score > 0.3;

            if (hasLeft || hasRight) {
                // 1. Back Straightness (Shoulder-Hip alignment)
                let sPt, hPt;
                if (hasLeft && hasRight) {
                    sPt = { x: (ls.x + rs.x) / 2, y: (ls.y + rs.y) / 2 };
                    hPt = { x: (lh.x + rh.x) / 2, y: (lh.y + rh.y) / 2 };
                } else if (hasLeft) {
                    sPt = ls; hPt = lh;
                } else {
                    sPt = rs; hPt = rh;
                }

                const rawBackAngle = Math.atan2(hPt.x - sPt.x, hPt.y - sPt.y) * 180 / Math.PI;
                const backAngle = Math.abs(rawBackAngle);
                newAngles.backAngle = Math.round(backAngle);

                if (backAngle > 18) {
                    currentScore -= 20;
                    currentMsg = rawBackAngle > 0 ? "Leaning forward" : "Leaning backward";
                    badPosture = true;
                }

                // 2. Neck Position (Ear/Nose to Shoulder alignment)
                let headPt = null;
                if (le.score > 0.3 && re.score > 0.3) headPt = { x: (le.x + re.x) / 2, y: (le.y + re.y) / 2 };
                else if (le.score > 0.3) headPt = le;
                else if (re.score > 0.3) headPt = re;
                else if (nose.score > 0.3) headPt = nose;

                if (headPt) {
                    const neckAngle = Math.abs(Math.atan2(headPt.x - sPt.x, sPt.y - headPt.y) * 180 / Math.PI);
                    newAngles.neckTilt = Math.round(neckAngle);
                    if (neckAngle > 28) { // Slightly more lenient but captures 45 clearly
                        currentScore -= 25;
                        currentMsg = "Forward head posture";
                        badPosture = true;
                    }
                }

                // 3. Shoulder Level (Front view only)
                if (ls.score > 0.3 && rs.score > 0.3) {
                    const shoulderTilt = Math.abs(ls.y - rs.y);
                    newAngles.shoulderTilt = Math.round(shoulderTilt);
                    if (shoulderTilt > 35) {
                        currentScore -= 15;
                        currentMsg = "Level your shoulders";
                        badPosture = true;
                    }
                }

                // 4. Sitting Detection (Hip to Knee angle)
                const hasKnee = (lh.score > 0.3 && lk.score > 0.3) || (rh.score > 0.3 && rk.score > 0.3);
                if (hasKnee) {
                    let hipPt = lh.score > 0.3 ? lh : rh;
                    let kneePt = lk.score > 0.3 ? lk : rk;
                    const sitAngle = Math.abs(Math.atan2(kneePt.x - hipPt.x, kneePt.y - hipPt.y) * 180 / Math.PI);
                    if (sitAngle > 60 && sitAngle < 120) {
                        newAngles.isSitting = true;
                        if (backAngle > 20) {
                            currentMsg = "Don't slouch while sitting";
                            badPosture = true;
                        }
                    }
                }
            } else {
                currentMsg = "Adjust your position";
                currentScore = 0;
            }

            setAngles(newAngles);
            setScore(Math.max(0, currentScore));
            setMessage(currentMsg);
            setPosture(badPosture ? 'bad' : (currentScore > 0 ? 'good' : 'neutral'));

            sessionDataRef.current.scores.push(currentScore);
            if (badPosture && sessionDataRef.current.scores.length % 30 === 0) {
                sessionDataRef.current.corrections++;
            }
        }

        animRef.current = requestAnimationFrame(detectLoop);
    }, []);

    useEffect(() => { return () => stopCamera(); }, [stopCamera]);

    const borderClass = posture === 'good' ? 'border-green-500' : posture === 'bad' ? 'border-red-500' : 'border-bg-surface';

    return (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-cta flex items-center gap-2">
                        <Activity size={28} className="text-primary" /> AI Posture Detection
                    </h1>
                    <p className="text-text-muted text-sm">Real-time MoveNet posture analysis</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="bg-bg-card px-4 py-2 rounded-btn shadow-sm border border-bg-surface flex items-center gap-3">
                        <div className="text-center">
                            <p className="text-xs text-text-muted uppercase font-bold tracking-wider">Score</p>
                            <p className={`text-xl font-black ${score > 80 ? 'text-green-600' : score > 50 ? 'text-orange-500' : 'text-red-600'}`}>{score}</p>
                        </div>
                        <div className="w-px h-8 bg-bg-surface" />
                        <Badge color={posture === 'good' ? 'green' : posture === 'bad' ? 'orange' : 'muted'}>
                            {posture === 'good' ? 'Good' : posture === 'bad' ? 'Correction' : 'Idle'}
                        </Badge>
                    </div>
                </div>
            </div>

            {error && (
                <div className="flex items-center gap-2 p-4 rounded-card bg-red-50 border border-red-200 text-red-700">
                    <AlertTriangle size={20} /> {error}
                </div>
            )}

            <div className="grid lg:grid-cols-3 gap-6">
                {/* Camera View */}
                <div className="lg:col-span-2 space-y-4">
                    <div className={`relative rounded-card overflow-hidden border-8 transition-all duration-300 ${borderClass} bg-black shadow-2xl shadow-primary/10`}>
                        <video ref={videoRef} className="w-full aspect-video object-cover" playsInline muted />
                        <canvas ref={canvasRef} width={640} height={480} className="absolute inset-0 w-full h-full" />

                        {!active && !loading && (
                            <div className="absolute inset-0 flex items-center justify-center bg-bg-card/95">
                                <div className="text-center space-y-4 p-8">
                                    <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                                        <Camera size={40} className="text-primary" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-cta">Start Posture Check</h3>
                                        <p className="text-text-secondary text-sm">Uses client-side AI. No video is recorded or stored.</p>
                                    </div>
                                    <Button variant="primary" size="lg" className="w-full" onClick={startCamera}>Start Webcam</Button>
                                </div>
                            </div>
                        )}

                        {loading && (
                            <div className="absolute inset-0 flex items-center justify-center bg-bg-card/90">
                                <div className="text-center">
                                    <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                                    <p className="font-bold text-cta">Initializing MoveNet AI...</p>
                                    <p className="text-xs text-text-muted mt-2">Loading TensorFlow.js models</p>
                                </div>
                            </div>
                        )}

                        {active && (
                            <div className={`absolute top-4 left-4 right-4 p-3 rounded-btn backdrop-blur-md bg-white/80 border shadow-lg flex items-center gap-3 transition-all ${posture === 'bad' ? 'border-red-500 animate-bounce' : 'border-green-500'}`}>
                                {posture === 'good' ? <CheckCircle2 className="text-green-600" /> : <AlertTriangle className="text-red-500" />}
                                <span className="font-bold text-cta">{message}</span>
                            </div>
                        )}
                    </div>

                    {active && (
                        <Button variant="danger" size="lg" className="w-full flex items-center justify-center gap-2" onClick={stopCamera}>
                            <CameraOff size={18} /> Stop Session
                        </Button>
                    )}
                </div>

                {/* Sidebar Info */}
                <div className="space-y-6">
                    {/* Live Metrics */}
                    <div className="bg-bg-card rounded-card shadow-card p-6 border border-bg-surface">
                        <h3 className="font-bold text-cta mb-4 flex items-center gap-2">
                            <TrendingUp size={18} className="text-primary" /> Real-time Metrics
                        </h3>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center p-3 rounded-btn bg-bg-surface">
                                <span className="text-sm font-medium text-text-secondary">Back Straightness</span>
                                <span className={`font-mono font-bold ${angles.backAngle > 18 ? 'text-red-500' : 'text-primary'}`}>{angles.backAngle ?? '--'}°</span>
                            </div>
                            <div className="flex justify-between items-center p-3 rounded-btn bg-bg-surface">
                                <span className="text-sm font-medium text-text-secondary">Neck Forward Tilt</span>
                                <span className={`font-mono font-bold ${angles.neckTilt > 28 ? 'text-red-500' : 'text-primary'}`}>{angles.neckTilt ?? '--'}°</span>
                            </div>
                            <div className="flex justify-between items-center p-3 rounded-btn bg-bg-surface">
                                <span className="text-sm font-medium text-text-secondary">Shoulder Balance</span>
                                <span className={`font-mono font-bold ${angles.shoulderTilt > 35 ? 'text-red-500' : 'text-primary'}`}>{angles.shoulderTilt ?? '--'}px</span>
                            </div>
                            {angles.isSitting && (
                                <div className="flex justify-between items-center p-1.5 px-3 rounded-btn bg-primary/10 border border-primary/20 animate-pulse">
                                    <span className="text-xs font-bold text-primary uppercase tracking-tighter">Sitting Mode Active</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Session Summary After Stop */}
                    {sessionSummary && (
                        <div className="bg-primary/5 rounded-card p-6 border border-primary/20 animate-in fade-in slide-in-from-bottom-4">
                            <h3 className="font-bold text-primary mb-4 flex items-center gap-2">
                                <History size={18} /> Session Summary
                            </h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="text-center p-2">
                                    <p className="text-2xl font-black text-cta">{sessionSummary.avgScore}</p>
                                    <p className="text-xs text-text-muted">Avg Score</p>
                                </div>
                                <div className="text-center p-2">
                                    <p className="text-2xl font-black text-cta">{sessionSummary.duration}s</p>
                                    <p className="text-xs text-text-muted">Duration</p>
                                </div>
                                <div className="col-span-2 text-center p-2 border-t border-primary/10">
                                    <p className="text-xl font-black text-red-500">{sessionSummary.correctionsTriggered}</p>
                                    <p className="text-xs text-text-muted">Corrections Triggered</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* How it works */}
                    <div className="bg-bg-card rounded-card p-6 border border-bg-surface">
                        <h4 className="text-sm font-bold text-text-secondary flex items-center gap-2 mb-2">
                            <Info size={14} /> Safety & Privacy
                        </h4>
                        <ul className="text-xs text-text-muted space-y-2">
                            <li>• Zero data recording: All processing stays in your RAM.</li>
                            <li>• Encrypted summaries: Only session stats like avg score are saved.</li>
                            <li>• MoveNet AI: Industry standard high-precision pose estimation.</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}

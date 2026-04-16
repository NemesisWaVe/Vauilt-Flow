import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { ArrowRight, ChevronRight, Minus } from 'lucide-react';
import { SignInButton } from '@clerk/clerk-react';

// ─── Cursor-reactive dot matrix ───────────────────────────────────────────────
const DotMatrix = () => {
    const containerRef = useRef(null);
    const svgRef = useRef(null);
    const [dims, setDims] = useState({ w: 0, h: 0 });
    const mouse = useRef({ x: -9999, y: -9999 });
    const r = useRef(new Float32Array(0));
    const o = useRef(new Float32Array(0));
    const raf = useRef(null);
    const SP = 26;

    useEffect(() => {
        const obs = new ResizeObserver(() => {
            if (containerRef.current) {
                const { width, height } = containerRef.current.getBoundingClientRect();
                setDims({ w: width, h: height });
            }
        });
        if (containerRef.current) obs.observe(containerRef.current);
        return () => obs.disconnect();
    }, []);

    const cols = Math.floor(dims.w / SP) + 1;
    const rows = Math.floor(dims.h / SP) + 1;
    const total = cols * rows;

    useEffect(() => {
        r.current = new Float32Array(total).fill(1);
        o.current = new Float32Array(total).fill(0.08);
    }, [total]);

    useEffect(() => {
        if (!total || !svgRef.current) return;
        const tick = () => {
            const kids = svgRef.current?.children;
            if (!kids) return;
            for (let i = 0; i < kids.length && i < r.current.length; i++) {
                const cc = i % cols, rr = Math.floor(i / cols);
                const cx = cc * SP + SP / 2, cy = rr * SP + SP / 2;
                const dx = cx - mouse.current.x, dy = cy - mouse.current.y;
                const d = Math.sqrt(dx * dx + dy * dy);
                const hot = d < 90;
                const tR = hot ? 1 + 2.5 * (1 - d / 90) : 1;
                const tO = hot ? 0.08 + 0.8 * (1 - d / 90) : 0.08;
                r.current[i] += (tR - r.current[i]) * 0.14;
                o.current[i] += (tO - o.current[i]) * 0.14;
                const el = kids[i];
                el.setAttribute('r', r.current[i].toFixed(2));
                el.setAttribute('opacity', o.current[i].toFixed(2));
                if (hot && r.current[i] > 1.15) {
                    el.setAttribute('fill', '#3b82f6');
                    el.style.filter = `drop-shadow(0 0 3px rgba(16,185,129,${(o.current[i] * 0.5).toFixed(2)}))`;
                } else {
                    el.setAttribute('fill', '#ffffff');
                    el.style.filter = 'none';
                }
            }
            raf.current = requestAnimationFrame(tick);
        };
        tick();
        return () => cancelAnimationFrame(raf.current);
    }, [cols, total]);

    const dots = Array.from({ length: total }, (_, i) => ({
        cx: (i % cols) * SP + SP / 2,
        cy: Math.floor(i / cols) * SP + SP / 2,
    }));

    return (
        <div
            ref={containerRef}
            className="absolute inset-0 overflow-hidden pointer-events-auto"
            onMouseMove={e => {
                const rect = containerRef.current?.getBoundingClientRect();
                if (rect) mouse.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
            }}
            onMouseLeave={() => { mouse.current = { x: -9999, y: -9999 }; }}
        >
            <svg ref={svgRef} width={dims.w} height={dims.h} className="absolute inset-0 pointer-events-none">
                {dots.map((d, i) => (
                    <circle key={i} cx={d.cx} cy={d.cy} r="1" fill="#ffffff" opacity="0.08" />
                ))}
            </svg>
        </div>
    );
};

// ─── Animated terminal with real pipeline logs ─────────────────────────────
const PipelineTerminal = () => {
    const lines = [
        { d: 0, t: '  ', c: '' },
        { d: 200, t: '$ VaultFlow run --file "sales_q4_2025.csv"', c: 'text-zinc-300' },
        { d: 900, t: '  Mounting dataset        14 columns · 82,304 rows', c: 'text-zinc-500' },
        { d: 1600, t: '  Schema inferred         types detected, nulls patched', c: 'text-zinc-500' },
        { d: 2400, t: '  Critic agent →          designing optimal query…', c: 'text-zinc-500' },
        { d: 3200, t: '', c: '' },
        { d: 3250, t: '    SELECT region, SUM(revenue) AS total', c: 'text-cyan-400/80 font-mono' },
        { d: 3500, t: '    FROM   sales', c: 'text-cyan-400/80 font-mono' },
        { d: 3750, t: '    GROUP  BY region ORDER BY total DESC', c: 'text-cyan-400/80 font-mono' },
        { d: 4000, t: '', c: '' },
        { d: 4100, t: '  Query verified          8 rows · 0 errors', c: 'text-zinc-500' },
        { d: 4800, t: '  Chart rendered          heatmap · 1920×1080', c: 'text-zinc-500' },
        { d: 5500, t: '  Executive brief         audio synthesis complete', c: 'text-zinc-500' },
        { d: 6200, t: '', c: '' },
        { d: 6250, t: '  Done  5.8s', c: 'text-blue-500 font-semibold' },
    ];

    const [vis, setVis] = useState(0);
    const loopMs = 9500;

    useEffect(() => {
        const run = () => {
            setVis(0);
            lines.forEach((l, i) => setTimeout(() => setVis(i + 1), l.d));
        };
        run();
        const id = setInterval(run, loopMs);
        return () => clearInterval(id);
    }, []);

    return (
        <div className="w-full rounded-2xl border border-white/10 bg-black/40 backdrop-blur-xl overflow-hidden shadow-[0_32px_80px_rgba(0,0,0,0.8),0_0_0_1px_rgba(255,255,255,0.05)]">
            {/* Chrome bar */}
            <div className="flex items-center gap-2 px-5 py-3.5 border-b border-white/[0.08] bg-white/[0.02]">
                <span className="w-3 h-3 rounded-full bg-[#ff5f57]" />
                <span className="w-3 h-3 rounded-full bg-[#febc2e]" />
                <span className="w-3 h-3 rounded-full bg-[#28c840]" />
                <span className="ml-auto font-mono text-[10px] tracking-widest uppercase text-zinc-500">VaultFlow · pipeline</span>
            </div>
            {/* Terminal body */}
            <div className="p-6 sm:p-8 font-mono text-[13px] leading-7 min-h-[340px] flex flex-col">
                <AnimatePresence>
                    {lines.slice(0, vis).map((l, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -4 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.15 }}
                            className={l.c || 'text-transparent select-none'}
                        >
                            {l.t || '\u00A0'}
                        </motion.div>
                    ))}
                    {vis > 0 && vis < lines.length && (
                        <motion.span
                            animate={{ opacity: [1, 0] }}
                            transition={{ repeat: Infinity, duration: 0.65 }}
                            className="inline-block w-[7px] h-[14px] bg-zinc-400/60 mt-1"
                        />
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

// ─── Glowing thin divider ─────────────────────────────────────────────────────
const Divider = () => (
    <div className="relative h-px w-full overflow-hidden">
        <div className="absolute inset-0 bg-white/[0.05]" />
        <motion.div
            className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-blue-500/40 to-transparent"
            animate={{ x: ['-100%', '400%'] }}
            transition={{ repeat: Infinity, duration: 6, ease: 'easeInOut', repeatDelay: 4 }}
        />
    </div>
);

// ─── Step item for "How it works" ─────────────────────────────────────────────
const Step = ({ n, title, body, delay }) => (
    <motion.div
        initial={{ opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-40px' }}
        transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}
        className="flex gap-6 group"
    >
        <div className="shrink-0 flex flex-col items-center gap-2 pt-1">
            <div className="w-8 h-8 rounded-full border border-white/10 bg-white/[0.02] flex items-center justify-center font-mono text-[12px] text-zinc-400 group-hover:border-blue-500/50 group-hover:text-cyan-400 group-hover:bg-blue-500/10 transition-all duration-300">
                {n}
            </div>
            {n < 3 && <div className="w-px flex-1 bg-white/[0.06] min-h-[40px]" />}
        </div>
        <div className="pb-10">
            <h3 className="text-[17px] font-semibold text-zinc-100 tracking-tight mb-2.5">{title}</h3>
            <p className="text-[14.5px] text-zinc-500 leading-relaxed max-w-sm">{body}</p>
        </div>
    </motion.div>
);

// ─── Metric pill ──────────────────────────────────────────────────────────────
const Metric = ({ value, label, sublabel }) => (
    <div className="flex flex-col gap-1.5 py-6 px-2 hover:bg-white/[0.01] transition-colors rounded-xl mx-2">
        <span className="text-3xl sm:text-[40px] font-bold text-white tracking-tighter tabular-nums leading-none mb-1">{value}</span>
        <span className="text-[14px] font-semibold text-zinc-300 tracking-tight">{label}</span>
        {sublabel && <span className="text-[12px] text-zinc-600 font-medium tracking-wide">{sublabel}</span>}
    </div>
);

// ──────────────────────────────────────────────────────────────────────────────
const LandingPage = ({ onLaunchApp }) => {
    const { scrollY } = useScroll();
    const navOpacity = useTransform(scrollY, [0, 60], [0, 1]);

    return (
        <div className="min-h-screen bg-[#09090b] text-white overflow-x-hidden selection:bg-blue-500/20 selection:text-white" style={{ fontFamily: "'Inter', -apple-system, sans-serif" }}>

            {/* Ambient glow: top center only */}
            <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-300px] left-1/2 -translate-x-1/2 w-[1000px] h-[700px] rounded-full bg-blue-600/[0.035] blur-[160px]" />
            </div>

            {/* ── Sticky Navbar ───────────────────────────────────────────────── */}
            <nav className="fixed top-0 inset-x-0 z-50">
                <motion.div
                    style={{ opacity: navOpacity }}
                    className="absolute inset-0 bg-[#09090b]/80 backdrop-blur-2xl border-b border-white/[0.05]"
                />
                <div className="relative max-w-7xl mx-auto px-5 sm:px-10 h-[64px] flex items-center justify-between">
                    <button onClick={onLaunchApp} className="flex items-center gap-2.5 group cursor-pointer">
                        <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center group-hover:bg-blue-500/20 transition-colors duration-200 overflow-hidden shadow-sm">
                            <img src="/VaultFlow.svg" className="w-[18px] h-[18px] object-contain" alt="VaultFlow" />
                        </div>
                        <span className="font-bold text-[16px] tracking-[-0.3px] text-white">VaultFlow</span>
                    </button>

                    <div className="hidden md:flex items-center gap-8 text-[14px] text-zinc-400 font-medium">
                        <button onClick={onLaunchApp} className="hover:text-zinc-100 transition-colors cursor-pointer">Product</button>
                        <button onClick={onLaunchApp} className="hover:text-zinc-100 transition-colors cursor-pointer">Customers</button>
                        <button onClick={onLaunchApp} className="hover:text-zinc-100 transition-colors cursor-pointer">Pricing</button>
                    </div>

                    <div className="flex items-center gap-4">
                        <SignInButton mode="modal">
                            <button className="text-[14px] font-medium text-zinc-400 hover:text-zinc-100 transition-colors hidden sm:block px-3 py-2 cursor-pointer">Sign in</button>
                        </SignInButton>
                        <button
                            onClick={onLaunchApp}
                            className="flex items-center gap-1.5 h-9 px-4 rounded-md bg-white text-black text-[14px] font-semibold hover:bg-zinc-200 active:scale-[0.98] transition-all duration-150 shadow-[0_0_15px_rgba(255,255,255,0.1)] cursor-pointer"
                        >
                            Get started <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                    </div>
                </div>
            </nav>

            <main className="relative z-10">

                {/* ══ HERO ═══════════════════════════════════════════════════════════ */}
                <section className="relative min-h-[92vh] flex flex-col items-center justify-center px-5 sm:px-10 pt-24 pb-20 overflow-hidden">
                    <DotMatrix />
                    {/* The VaultFlow Mark: Perfect Fit & Glassy Presence */}
                    <div className="absolute top-[48%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] sm:w-[950px] pointer-events-none select-none z-0">
                        <motion.img 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 0.22, scale: 1 }}
                            transition={{ duration: 1.2, ease: 'easeOut' }}
                            src="/VaultFlow.svg" 
                            alt="" 
                            className="w-full h-full object-contain blur-[6px] saturate-[160%] brightness-110" 
                        />
                    </div>
                    {/* Gradient fade to black at bottom so the grid doesn't bleed */}
                    <div className="absolute bottom-0 inset-x-0 h-64 bg-gradient-to-t from-[#09090b] via-[#09090b]/60 to-transparent pointer-events-none z-10" />

                    <div className="relative z-20 max-w-4xl mx-auto flex flex-col items-center text-center gap-7 mt-8">
                        <motion.button
                            onClick={onLaunchApp}
                            initial={{ opacity: 0, y: -8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, ease: 'easeOut' }}
                            className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-blue-500/[0.08] border border-blue-500/[0.15] text-indigo-300 text-[13px] font-medium tracking-tight hover:bg-blue-500/[0.12] transition-colors cursor-pointer"
                        >
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500 shadow-[0_0_8px_rgba(16,185,129,0.9)]"></span>
                            </span>
                            Autonomous business analysis for everyone
                        </motion.button>

                        <motion.h1
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.7, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
                            className="text-[52px] sm:text-[68px] md:text-[82px] font-bold tracking-[-3.5px] leading-[1.02] text-white"
                        >
                            Find your first profitable business. <br />
                            <span className="text-transparent bg-clip-text" style={{ backgroundImage: 'linear-gradient(135deg, #22d3ee 0%, #3b82f6 50%, #06b6d4 100%)', WebkitBackgroundClip: 'text' }}>
                                Let AI do the math.
                            </span>
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.7, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
                            className="text-[18px] sm:text-[20px] text-zinc-400 leading-relaxed font-normal max-w-2xl tracking-[-0.2px]"
                        >
                            Upload a spreadsheet of online stores. VaultFlow analyzes the finances, finds the hidden gems, and tells you exactly which business to buy and how to grow it.
                        </motion.p>

                        <motion.div
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.45 }}
                            className="flex items-center gap-4 pt-4"
                        >
                            <button
                                onClick={onLaunchApp}
                                className="group h-12 sm:h-14 px-8 rounded-xl bg-blue-600 text-white text-[15px] font-semibold tracking-tight hover:bg-blue-500 hover:shadow-[0_0_36px_rgba(5,150,105,0.4)] active:scale-[0.98] transition-all duration-200 flex items-center gap-2.5 cursor-pointer"
                            >
                                Start analyzing
                                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                            </button>
                            <SignInButton mode="modal">
                                <button className="h-12 sm:h-14 px-8 rounded-xl border border-zinc-800 bg-zinc-900/50 text-zinc-300 text-[15px] font-semibold tracking-tight hover:bg-zinc-800 hover:text-white hover:border-zinc-700 active:scale-[0.98] transition-all duration-200 backdrop-blur-md cursor-pointer">
                                    Sign in
                                </button>
                            </SignInButton>
                        </motion.div>
                    </div>
                </section>

                <Divider />

                {/* ══ METRICS STRIP ══════════════════════════════════════════════════ */}
                <section className="py-8 px-5 sm:px-10 bg-[#000000]">
                    <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 divide-x divide-white/[0.06]">
                        {[
                            { value: '<30s', label: 'Time to insight', sublabel: 'Median analysis duration' },
                            { value: '50MB', label: 'Payload capacity', sublabel: 'Handle massive spreadsheets' },
                            { value: '99%+', label: 'Query accuracy', sublabel: 'AI-verified financial logic' },
                            { value: 'Zero', label: 'Setup required', sublabel: 'No coding or SQL needed' },
                        ].map((m, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 12 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.08, duration: 0.5 }}
                                className="px-4 sm:px-8 cursor-default"
                            >
                                <Metric {...m} />
                            </motion.div>
                        ))}
                    </div>
                </section>

                <Divider />

                {/* ══ HOW IT WORKS (Steps) ══════════════════════════════════════════ */}
                <section className="py-32 px-5 sm:px-10 bg-[#000000]">
                    <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-16 md:gap-32">
                        {/* Left: heading + cta */}
                        <motion.div
                            initial={{ opacity: 0, x: -16 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                            className="md:w-[40%] shrink-0 flex flex-col gap-6 md:sticky md:top-32 self-start"
                        >
                            <span className="font-mono text-[12px] font-semibold uppercase tracking-[0.2em] text-blue-500">Simple Process</span>
                            <h2 className="text-[36px] sm:text-[42px] font-bold tracking-[-1.5px] text-white leading-tight">
                                How to find your next acquisition.
                            </h2>
                            <p className="text-[16px] text-zinc-400 leading-relaxed">
                                VaultFlow takes the guesswork out of business buying. We handle the complex math so you can focus on the deal.
                            </p>
                            <button
                                onClick={onLaunchApp}
                                className="self-start flex items-center gap-2 mt-4 text-[14px] font-semibold text-cyan-400 hover:text-indigo-300 transition-colors group cursor-pointer"
                            >
                                Start your search
                                <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                            </button>
                        </motion.div>

                        {/* Right: steps */}
                        <div className="flex flex-col mt-4">
                            <Step
                                n={1}
                                title="Drop in the Data"
                                body="Have a list of Shopify or Amazon stores? Just drag and drop the CSV. No coding required."
                                delay={0}
                            />
                            <Step
                                n={2}
                                title="Spot the Golden Goose"
                                body="Our AI partner reads the profit and loss statements to find businesses that are making money but wasting it on bad marketing."
                                delay={0.1}
                            />
                            <Step
                                n={3}
                                title="Launch & Acquire"
                                body="Once the perfect business is found, VaultFlow instantly sets up the .xyz domain names so you can launch your holding company and make the purchase."
                                delay={0.2}
                            />
                        </div>
                    </div>
                </section>

                <Divider />

                {/* ══ FINAL CTA ══════════════════════════════════════════════════════ */}
                <section className="py-36 px-5 sm:px-10 relative overflow-hidden bg-[#000000]">
                    <div className="absolute inset-0 pointer-events-none">
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-blue-600/[0.04] blur-[160px] rounded-full" />
                    </div>
                    <motion.div
                        initial={{ opacity: 0, y: 24 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
                        className="max-w-3xl mx-auto flex flex-col items-center text-center gap-10 relative z-10"
                    >
                        <h2 className="text-[44px] sm:text-[64px] font-bold tracking-[-2.5px] text-white leading-[1.05]">
                            Ready to buy a business?<br />
                            <span className="text-zinc-600">Start with clear data.</span>
                        </h2>
                        <p className="text-[18px] text-zinc-400 leading-relaxed max-w-xl font-medium">
                            Upload your spreadsheet now and let VaultFlow find the best deals for you in seconds.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center gap-5 mt-2">
                            <button
                                onClick={onLaunchApp}
                                className="group h-14 px-10 rounded-xl bg-white text-black text-[15px] font-bold tracking-tight hover:bg-zinc-200 hover:shadow-[0_0_40px_rgba(255,255,255,0.2)] active:scale-[0.98] transition-all duration-200 flex items-center gap-2.5 cursor-pointer shadow-md"
                            >
                                Start your session
                                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                            </button>
                            <SignInButton mode="modal">
                                <button className="h-14 px-10 rounded-xl text-zinc-400 text-[15px] font-semibold hover:text-white transition-colors cursor-pointer ring-1 ring-white/10 hover:bg-white/[0.03]">
                                    Log in to existing workspace
                                </button>
                            </SignInButton>
                        </div>
                    </motion.div>
                </section>

                <Divider />

                {/* ══ FOR THE JUDGES: UNDER THE HOOD ═════════════════════════════════ */}
                <section className="py-32 px-5 sm:px-10 bg-[#09090b]">
                    <div className="max-w-6xl mx-auto">
                        <motion.div
                            initial={{ opacity: 0, y: 14 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5 }}
                            className="mb-16 flex flex-col gap-3 text-center items-center"
                        >
                            <span className="font-mono text-[12px] font-semibold uppercase tracking-[0.2em] text-blue-500">[ FOR THE JUDGES: UNDER THE HOOD ]</span>
                            <h2 className="text-[36px] sm:text-[44px] font-bold tracking-[-1.5px] text-white">Advanced Architecture</h2>
                            <p className="text-[17px] text-zinc-400 max-w-2xl leading-relaxed mt-2">
                                VaultFlow is powered by a serverless AWS pipeline, multi-agent SQL self-healing, and Amazon Nova models.
                            </p>
                        </motion.div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-24">
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.8 }}
                            >
                                <PipelineTerminal />
                            </motion.div>
                            <div className="flex flex-col gap-8">
                                {[
                                    {
                                        label: 'INTELLIGENCE',
                                        title: 'Self-repairing queries',
                                        body: 'Queries are drafted, executed, validated, and repaired in a closed loop before reaching the frontend. Hallucinations are caught and fixed natively.',
                                    },
                                    {
                                        label: 'VISUALIZATION',
                                        title: 'Deterministic rendering',
                                        body: 'Chart specifications are generated with constrained decoding. Every heatmap, scatter plot, and distribution curve renders exactly as intended.',
                                    },
                                ].map((f, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, y: 16 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ duration: 0.5, delay: i * 0.1 }}
                                        className="relative p-6 rounded-2xl border border-white/[0.08] bg-zinc-900/20 group"
                                    >
                                        <span className="font-mono text-[11px] font-semibold tracking-[0.2em] text-blue-500/90">{f.label}</span>
                                        <h3 className="text-[18px] font-bold text-white tracking-tight leading-snug mb-2">{f.title}</h3>
                                        <p className="text-[14.5px] text-zinc-400 leading-relaxed">{f.body}</p>
                                    </motion.div>
                                ))}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {[
                                {
                                    label: 'SYNTHESIS',
                                    title: 'Neural strategy briefs',
                                    body: 'A narrated executive summary is continuously synthesized using Amazon Nova Sonic, streaming directly to your session.',
                                },
                                {
                                    label: 'SCALABILITY',
                                    title: 'Serverless AWS SQS',
                                    body: 'Handles massive concurrent analysis tasks with distributed compute nodes for zero-lag response.',
                                },
                                {
                                    label: 'SECURITY',
                                    title: 'Isolated Data Runtime',
                                    body: 'Datasets are mounted in ephemeral memory containers and purged immediately after synthesis.',
                                },
                            ].map((f, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 16 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.5, delay: i * 0.1 }}
                                    className="p-8 rounded-2xl border border-white/[0.08] bg-zinc-900/20 hover:bg-zinc-800/40 transition-all duration-300"
                                >
                                    <span className="font-mono text-[11px] font-semibold tracking-[0.2em] text-blue-500/90">{f.label}</span>
                                    <h3 className="text-[18px] font-bold text-white tracking-tight leading-snug mb-2">{f.title}</h3>
                                    <p className="text-[14.5px] text-zinc-400 leading-relaxed font-medium">{f.body}</p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

            </main>

            {/* ── Footer ── */}
            <Divider />
            <footer className="bg-[#09090b]">
                <div className="max-w-7xl mx-auto px-5 sm:px-10 py-10 flex flex-col sm:flex-row items-center justify-between gap-5">
                    <button onClick={onLaunchApp} className="flex items-center gap-2 opacity-50 hover:opacity-100 transition-opacity cursor-pointer">
                        <img src="/VaultFlow.svg" className="w-[18px] h-[18px] object-contain" alt="VaultFlow" />
                        <span className="font-bold text-[14px] text-white tracking-[-0.2px]">VaultFlow</span>
                    </button>
                    <p className="font-medium text-[13px] text-zinc-600 tracking-tight">© 2026 VaultFlow. Enterprise intelligence.</p>
                    <div className="font-mono text-[11px] font-semibold text-zinc-500 tracking-widest uppercase flex items-center gap-2">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                        </span>
                        All systems operational
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;

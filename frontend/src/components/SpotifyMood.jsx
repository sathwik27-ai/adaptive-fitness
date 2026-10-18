import React, { useState } from 'react';
import { Music, CloudMoon, Zap, Brain, Smile, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';

const MOODS = [
    {
        id: 'chill',
        label: 'Chill',
        icon: <CloudMoon size={16} />,
        color: 'bg-blue-100 text-blue-700',
        playlistId: '37i9dQZF1DWWQRwui0ExPn'
    },
    {
        id: 'energetic',
        label: 'Energetic',
        icon: <Zap size={16} />,
        color: 'bg-yellow-100 text-yellow-700',
        playlistId: '37i9dQZF1DX76Wlfdnj7AP'
    },
    {
        id: 'focus',
        label: 'Focus',
        icon: <Brain size={16} />,
        color: 'bg-indigo-100 text-indigo-700',
        playlistId: '37i9dQZF1DWZeKCadgRdKQ'
    },
    {
        id: 'boost',
        label: 'Mood Boost',
        icon: <Smile size={16} />,
        color: 'bg-green-100 text-green-700',
        playlistId: '37i9dQZF1DX3rxVfibe1L0'
    }
];

const SpotifyMood = () => {
    const [selectedMood, setSelectedMood] = useState(MOODS[0]);
    const [minimized, setMinimized] = useState(false);

    return (
        <section aria-labelledby="spotify-mood-title" className="h-full">
            <div className="flex items-center justify-between gap-3 rounded-t-2xl border border-primary/10 bg-bg-card px-4 py-3 shadow-card">
                <h2 id="spotify-mood-title" className="flex items-center gap-2 text-sm font-semibold text-primary">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                        <Music size={17} className="text-primary" />
                    </span>
                    Today's Mood
                    <span className="rounded-full bg-primary/10 px-2 py-1 text-[10px] font-semibold text-primary">Spotify</span>
                </h2>
                <button
                    type="button"
                    onClick={() => setMinimized((value) => !value)}
                    aria-label={minimized ? 'Expand Spotify player' : 'Minimize Spotify player'}
                    aria-expanded={!minimized}
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-text-secondary transition hover:bg-bg-surface focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                    {minimized ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </button>
            </div>

            <div className={`overflow-hidden rounded-b-2xl border-x border-b border-primary/10 bg-gradient-to-br from-bg-card via-bg-card to-primary/5 shadow-card transition-all duration-300 ${minimized ? 'max-h-0 border-b-0 opacity-0' : 'max-h-[32rem] p-4 opacity-100'}`}>
                <div className="mb-4 grid grid-cols-2 gap-2">
                    {MOODS.map((mood) => (
                        <button
                            key={mood.id}
                            onClick={() => setSelectedMood(mood)}
                            aria-pressed={selectedMood.id === mood.id}
                            className={`flex min-h-10 items-center justify-center gap-2 rounded-xl px-2 py-2 text-xs font-semibold transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary ${selectedMood.id === mood.id
                                    ? `${mood.color} shadow-sm ring-1 ring-current/20`
                                    : 'border border-bg-surface bg-white/60 text-text-muted hover:border-primary/30 hover:text-primary'
                                }`}
                        >
                            {mood.icon}
                            {mood.label}
                        </button>
                    ))}
                </div>

                <div className="w-full overflow-hidden rounded-2xl bg-[#121212] shadow-lg ring-1 ring-black/5">
                    <iframe
                        title="Spotify Mood Player"
                        src={`https://open.spotify.com/embed/playlist/${selectedMood.playlistId}?utm_source=generator&theme=0`}
                        width="100%"
                        height="280"
                        frameBorder="0"
                        allowFullScreen=""
                        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                        loading="lazy"
                        className="block w-full border-0"
                    ></iframe>
                </div>
                <a
                    href={`https://open.spotify.com/playlist/${selectedMood.playlistId}`}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                >
                    Open playlist in Spotify <ExternalLink size={15} />
                </a>
            </div>
        </section>
    );
};

export default SpotifyMood;

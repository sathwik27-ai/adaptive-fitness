import React, { useState } from 'react';
import { Music, CloudMoon, Zap, Brain, Smile } from 'lucide-react';

const MOODS = [
    {
        id: 'chill',
        label: 'Chill',
        icon: <CloudMoon size={16} />,
        color: 'bg-blue-100 text-blue-700',
        playlistId: '37i9dQZF1DX4WYpdgoIcnC'
    },
    {
        id: 'energetic',
        label: 'Energetic',
        icon: <Zap size={16} />,
        color: 'bg-yellow-100 text-yellow-700',
        playlistId: '37i9dQZF1DX76W9SwwE6fk'
    },
    {
        id: 'focus',
        label: 'Focus',
        icon: <Brain size={16} />,
        color: 'bg-indigo-100 text-indigo-700',
        playlistId: '37i9dQZF1DWZ00AiqD7UCZ'
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

    return (
        <div className="space-y-4">
            <h2 className="text-xl font-semibold text-primary flex items-center gap-2">
                <Music size={24} className="text-cta" />
                Today's Mood
            </h2>

            <div className="bg-bg-card rounded-card shadow-card p-6 border-l-4 border-cta space-y-6">
                <div className="flex flex-wrap gap-2">
                    {MOODS.map((mood) => (
                        <button
                            key={mood.id}
                            onClick={() => setSelectedMood(mood)}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-300 ${selectedMood.id === mood.id
                                    ? `${mood.color} ring-2 ring-offset-2 ring-cta shadow-sm scale-105`
                                    : 'bg-bg-surface text-text-muted hover:bg-bg-surface/80'
                                }`}
                        >
                            {mood.icon}
                            {mood.label}
                        </button>
                    ))}
                </div>

                <div className="relative w-full rounded-xl overflow-hidden shadow-inner bg-black/5" style={{ minHeight: '152px' }}>
                    <iframe
                        title="Spotify Mood Player"
                        src={`https://open.spotify.com/embed/playlist/${selectedMood.playlistId}?utm_source=generator&theme=0`}
                        width="100%"
                        height="152"
                        frameBorder="0"
                        allowFullScreen=""
                        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                        loading="lazy"
                        className="rounded-xl"
                    ></iframe>
                </div>
            </div>
        </div>
    );
};

export default SpotifyMood;

import React from 'react';
import { Play, Globe } from 'lucide-react';
import type { VideoResource } from '../data/syllabus';

interface VideoSectionProps {
  videos: VideoResource[];
}

const YOUTUBE_ID_REGEX = /^[a-zA-Z0-9_-]{6,15}$/;

export const VideoSection: React.FC<VideoSectionProps> = ({ videos }) => {
  if (!videos || videos.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm text-center">
        <Play className="w-12 h-12 text-slate-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-slate-900">No Videos Available</h3>
        <p className="text-slate-500 mt-2">Video content for this module is coming soon.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-6 md:p-8 border border-slate-200 shadow-sm">
        <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
          <Play className="w-5 h-5 text-red-500" />
          Video Resources
        </h2>
        <div className="grid gap-6">
          {videos.map((video, idx) => {
            if (!YOUTUBE_ID_REGEX.test(video.youtubeId)) return null;
            return (
            <div key={idx} className="rounded-xl border border-slate-200 overflow-hidden hover:shadow-md transition-shadow">
              <div className="aspect-video bg-black">
                <iframe
                  src={`https://www.youtube-nocookie.com/embed/${video.youtubeId}`}
                  title={video.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full"
                  loading="lazy"
                  referrerPolicy="no-referrer"
                  sandbox="allow-scripts allow-same-origin allow-presentation"
                />
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-bold text-slate-900">{video.title}</h3>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {video.language && (
                      <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                        video.language === 'id'
                          ? 'bg-red-50 text-red-700 border border-red-200'
                          : 'bg-blue-50 text-blue-700 border border-blue-200'
                      }`}>
                        <Globe className="w-3 h-3 inline mr-1" />
                        {video.language === 'id' ? 'ID' : 'EN'}
                      </span>
                    )}
                    {video.duration && (
                      <span className="text-xs text-slate-500 font-mono">{video.duration}</span>
                    )}
                  </div>
                </div>
                {video.description && (
                  <p className="text-sm text-slate-500 mt-2">{video.description}</p>
                )}
              </div>
            </div>
          );
          })}
        </div>
      </div>
    </div>
  );
};

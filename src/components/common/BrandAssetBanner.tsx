import React from 'react';
import { ExternalLink, FolderOpen, Video, Palette, Layers, Play } from 'lucide-react';
import { BrandBannerConfig, getBrandBannerConfig } from '../../lib/imageUtils';

interface BrandAssetBannerProps {
  url?: string;
  config?: BrandBannerConfig | null;
  mode?: 'card' | 'thumbnail' | 'preview' | 'compact';
  className?: string;
  onOpenExternal?: () => void;
}

export const BrandAssetBanner: React.FC<BrandAssetBannerProps> = ({
  url,
  config: providedConfig,
  mode = 'card',
  className = '',
  onOpenExternal
}) => {
  const config = providedConfig || (url ? getBrandBannerConfig(url) : null);

  if (!config) return null;

  const handleOpenLink = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onOpenExternal) {
      onOpenExternal();
    } else if (config.url) {
      window.open(config.url, '_blank', 'noopener,noreferrer');
    }
  };

  // Thumbnail / Compact mode (for list rows & comboboxes)
  if (mode === 'thumbnail' || mode === 'compact') {
    return (
      <div 
        className={`w-full h-full flex flex-col items-center justify-center relative overflow-hidden bg-gradient-to-br ${config.gradientClass} text-white shadow-inner ${className}`}
        title={`${config.title}: ${config.url}`}
      >
        {config.brand === 'canva' && <Palette className="w-4 h-4 drop-shadow text-white animate-pulse" />}
        {config.brand === 'capcut' && <Video className="w-4 h-4 drop-shadow text-rose-300" />}
        {config.brand === 'figma' && <Layers className="w-4 h-4 drop-shadow text-purple-300" />}
        {config.brand === 'gdrive-folder' && <FolderOpen className="w-4 h-4 drop-shadow text-amber-300" />}
        <span className="text-[8px] font-black tracking-tighter uppercase mt-0.5 opacity-90 truncate max-w-full px-1">
          {config.brand === 'canva' ? 'CANVA' : config.brand === 'capcut' ? 'CAPCUT' : config.brand === 'figma' ? 'FIGMA' : 'FOLDER'}
        </span>
      </div>
    );
  }

  // Preview mode (inside ItemModal)
  if (mode === 'preview') {
    return (
      <div className={`w-full p-3 rounded-xl bg-gradient-to-r ${config.gradientClass} text-white shadow-md relative overflow-hidden border ${config.accentBorder} ${className}`}>
        <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 opacity-10 pointer-events-none">
          {config.brand === 'canva' && <Palette className="w-28 h-28" />}
          {config.brand === 'capcut' && <Video className="w-28 h-28" />}
          {config.brand === 'figma' && <Layers className="w-28 h-28" />}
          {config.brand === 'gdrive-folder' && <FolderOpen className="w-28 h-28" />}
        </div>

        <div className="relative z-10 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-lg bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0 border border-white/30 shadow-sm">
              {config.brand === 'canva' && <Palette className="w-5 h-5 text-white" />}
              {config.brand === 'capcut' && <Video className="w-5 h-5 text-rose-300" />}
              {config.brand === 'figma' && <Layers className="w-5 h-5 text-purple-300" />}
              {config.brand === 'gdrive-folder' && <FolderOpen className="w-5 h-5 text-amber-200" />}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className={`text-[10px] font-extrabold uppercase px-1.5 py-0.2 rounded border ${config.badgeColorClass}`}>
                  {config.badgeLabel}
                </span>
                <span className="text-[11px] font-bold text-white/90 truncate">{config.title}</span>
              </div>
              <p className="text-[11px] text-white/75 truncate mt-0.5">{config.tagline}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleOpenLink}
            className="px-2.5 py-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-white text-[11px] font-bold flex items-center gap-1 shrink-0 backdrop-blur-md border border-white/30 transition-all cursor-pointer shadow-sm"
          >
            <span>{config.buttonLabel}</span>
            <ExternalLink className="w-3 h-3" />
          </button>
        </div>
      </div>
    );
  }

  // Default: Card Mode (16:9 Cover Banner on Kanban/Grid cards)
  return (
    <div className={`w-full h-full relative overflow-hidden flex flex-col justify-between p-4 bg-gradient-to-br ${config.gradientClass} text-white select-none ${className}`}>
      {/* Decorative Background Pattern */}
      <div className="absolute -right-6 -bottom-6 opacity-15 pointer-events-none transform rotate-12 scale-125">
        {config.brand === 'canva' && <Palette className="w-40 h-40" />}
        {config.brand === 'capcut' && <Video className="w-40 h-40" />}
        {config.brand === 'figma' && <Layers className="w-40 h-40" />}
        {config.brand === 'gdrive-folder' && <FolderOpen className="w-40 h-40" />}
      </div>

      {/* Top Banner Tag */}
      <div className="flex items-center justify-between relative z-10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 shadow-md">
            {config.brand === 'canva' && <Palette className="w-4 h-4 text-white drop-shadow" />}
            {config.brand === 'capcut' && <Play className="w-4 h-4 text-rose-300 drop-shadow fill-rose-300" />}
            {config.brand === 'figma' && <Layers className="w-4 h-4 text-purple-300 drop-shadow" />}
            {config.brand === 'gdrive-folder' && <FolderOpen className="w-4 h-4 text-amber-200 drop-shadow" />}
          </div>
          <div>
            <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border backdrop-blur-md shadow-sm ${config.badgeColorClass}`}>
              {config.badgeLabel}
            </span>
          </div>
        </div>
      </div>

      {/* Center Headline */}
      <div className="my-auto py-2 relative z-10 text-center">
        <h4 className="text-base sm:text-lg font-black tracking-wide drop-shadow-md text-white">
          {config.title}
        </h4>
        <p className="text-xs text-white/80 font-medium drop-shadow-sm mt-0.5 line-clamp-1">
          {config.tagline}
        </p>
      </div>

      {/* Bottom 1-Click Action Button */}
      <div className="relative z-10 flex items-center justify-center">
        <button
          type="button"
          onClick={handleOpenLink}
          className="w-full max-w-[220px] py-1.5 px-3 rounded-xl bg-white/25 hover:bg-white/35 active:scale-95 text-white text-xs font-bold flex items-center justify-center gap-1.5 backdrop-blur-md border border-white/40 shadow-lg transition-all cursor-pointer group/btn"
          title={`Buka langsung lembar kerja: ${config.url}`}
        >
          <span>{config.buttonLabel}</span>
          <ExternalLink className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
        </button>
      </div>
    </div>
  );
};

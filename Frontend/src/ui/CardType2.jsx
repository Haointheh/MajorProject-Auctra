import React from 'react';

export default function CardType2({
  title = 'Category',
  description = '',
  imageUrl = '',
  alt = '',
  tag = null,
}) {
  return (
    <div className="bg-white overflow-hidden shadow-sm">

      {/* Image */}
      <div className="w-full h-44 bg-slate-200">
        <img
          src={imageUrl}
          alt={alt || title}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900">
            {title}
          </h3>

          {tag && (
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-1">
              {tag}
            </span>
          )}
        </div>

        {description && (
          <p className="text-sm text-slate-500 mt-2">
            {description}
          </p>
        )}
      </div>

    </div>
  );
}
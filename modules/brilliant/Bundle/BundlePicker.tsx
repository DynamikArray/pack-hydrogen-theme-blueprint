// modules/brilliant/Bundle/BundlePicker.tsx
'use client';

import {useEffect, useMemo, useState} from 'react';

import type {
  BundleConfig,
  BundleSelection,
  BrilliantBundleOption,
} from './BundleConfig.types';

type BundlePickerProps = {
  config: BundleConfig;
  onChange?: (selection: BundleSelection) => void;
};

export function BundlePicker({config, onChange}: BundlePickerProps) {
  const {label, requiredCount, options} = config;

  // selections[index] = optionId for that slot
  const [selections, setSelections] = useState<string[]>(() =>
    Array(requiredCount).fill(''),
  );

  // openSlots[index] = is this slot expanded?
  const [openSlots, setOpenSlots] = useState<boolean[]>(() =>
    Array(requiredCount).fill(false),
  );

  // Reset state if requiredCount changes (metafield updated)
  useEffect(() => {
    setSelections(Array(requiredCount).fill(''));
    setOpenSlots(Array(requiredCount).fill(false));
  }, [requiredCount]);

  // Quick lookup by id
  const optionById = useMemo(() => {
    const map = new Map<string, BrilliantBundleOption>();
    for (const opt of options) {
      map.set(opt.id, opt);
    }
    return map;
  }, [options]);

  function toggleSlot(slotIndex: number) {
    setOpenSlots((prev) => {
      const copy = [...prev];
      copy[slotIndex] = !copy[slotIndex];
      return copy;
    });
  }

  function updateSelection(slotIndex: number, optionId: string) {
    setSelections((prev) => {
      const copy = [...prev];
      copy[slotIndex] = optionId;
      return copy;
    });

    // Auto-collapse this slot after choosing
    setOpenSlots((prev) => {
      const copy = [...prev];
      copy[slotIndex] = false;
      return copy;
    });
  }

  // Build BundleSelection for AddToCart
  useEffect(() => {
    if (!onChange) return;

    let isComplete = true;
    const attributes: BundleSelection['attributes'] = [];

    for (let i = 0; i < requiredCount; i++) {
      const optionId = selections[i];
      const option = optionById.get(optionId);

      if (!option) {
        isComplete = false;
        continue;
      }

      attributes.push({
        key: `${label} ${i + 1}`, // e.g. "Animal 1"
        value: option.label,
      });
    }

    onChange({isComplete, attributes});
  }, [selections, label, requiredCount, optionById, onChange]);

  if (requiredCount <= 0 || options.length === 0) return null;

  return (
    <div className="space-y-4 rounded-md border border-slate-200 p-4">
      <p className="text-sm text-slate-700">
        Choose {requiredCount} {label.toLowerCase()}
        {requiredCount > 1 ? 's' : ''} to include with your scene.
      </p>

      {Array.from({length: requiredCount}).map((_, slotIndex) => {
        const selectedId = selections[slotIndex];
        const selectedOption = selectedId
          ? optionById.get(selectedId)
          : undefined;

        const isOpen = openSlots[slotIndex];

        return (
          <div
            key={slotIndex}
            className="rounded-md border border-slate-200 bg-slate-50"
          >
            {/* Header / summary row */}
            <button
              type="button"
              onClick={() => toggleSlot(slotIndex)}
              className="flex w-full items-center justify-between px-3 py-2 text-left"
            >
              <div className="flex items-center gap-3">
                {selectedOption?.imageUrl && (
                  <img
                    src={selectedOption.imageUrl}
                    alt={selectedOption.imageAlt || selectedOption.label}
                    className="size-10 rounded object-cover"
                  />
                )}

                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-slate-700">
                    {label} {slotIndex + 1}
                  </span>
                  <span className="text-xs text-slate-600">
                    {selectedOption ? selectedOption.label : `Not selected yet`}
                  </span>
                </div>
              </div>

              {/* Simple caret indicator */}
              <span
                className={`ml-2 text-xs transition-transform ${
                  isOpen ? 'rotate-90' : ''
                }`}
              >
                ▶
              </span>
            </button>

            {/* Expanded option list */}
            {isOpen && (
              <div className="border-t border-slate-200 bg-white p-3">
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {options.map((opt) => {
                    const isSelected = selections[slotIndex] === opt.id;

                    return (
                      <button
                        key={opt.id + '-' + slotIndex}
                        type="button"
                        onClick={() => updateSelection(slotIndex, opt.id)}
                        className={[
                          'flex flex-col items-center rounded-lg border px-2 py-2 text-xs transition',
                          isSelected
                            ? 'border-emerald-600 bg-emerald-50'
                            : 'border-slate-200 bg-white hover:border-emerald-400 hover:bg-emerald-50/40',
                        ].join(' ')}
                      >
                        {opt.imageUrl && (
                          <img
                            src={opt.imageUrl}
                            alt={opt.imageAlt || opt.label}
                            className="mb-1 size-24 rounded object-cover md:size-32"
                          />
                        )}
                        <span className="text-[11px] leading-tight text-slate-800">
                          {opt.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { sfx } from '../audio/sfx';
import { CHARACTER_LIST, CharacterDef, CharacterId, getCharacterDef } from '../engine/characters';
import { renderNotebookPaperToCanvas } from '../engine/sketchDraw';
import { FighterSide } from '../engine/stickFigure';

interface SymmetricalCharacterSlotProps {
  side: FighterSide;
  character: CharacterDef;
  currentIndex: number;
  totalCount: number;
  prevCharacterName: string;
  nextCharacterName: string;
  isFocused: boolean;
  stepDirection: 'up' | 'down' | null;
  stepCount: number;
  cardRef: React.RefObject<HTMLDivElement | null>;
  onStep: (side: FighterSide, delta: -1 | 1) => void;
  onFocusSide: (side: FighterSide) => void;
}

const SymmetricalCharacterSlot: React.FC<SymmetricalCharacterSlotProps> = ({
  side,
  character,
  currentIndex,
  totalCount,
  prevCharacterName,
  nextCharacterName,
  isFocused,
  stepDirection,
  stepCount,
  cardRef,
  onStep,
  onFocusSide,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const wheelLockRef = useRef(0);
  const touchStartYRef = useRef<number | null>(null);

  const isBlue = side === 'left';
  const inkColor = isBlue ? '#1E3A8A' : '#991B1B';
  const accentColor = isBlue ? '#2563EB' : '#DC2626';
  const facing: 1 | -1 = isBlue ? 1 : -1;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const width = 188;
    const height = 128;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    const paper = renderNotebookPaperToCanvas(width, height, dpr);

    let rafId = 0;
    const drawFrame = (now: number) => {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.save();
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(paper.canvas, 0, 0);
        ctx.scale(dpr, dpr);

        if (facing === -1) {
          ctx.translate(width, 0);
          ctx.scale(-1, 1);
        }

        const boilTick = Math.floor(now / 135);
        const tSec = now / 1000;
        character.drawPortrait(
          ctx,
          width * 0.54,
          height * 0.45,
          1.06,
          inkColor,
          accentColor,
          boilTick,
          tSec,
          facing,
        );
        ctx.restore();
      }
      rafId = requestAnimationFrame(drawFrame);
    };

    rafId = requestAnimationFrame(drawFrame);
    return () => cancelAnimationFrame(rafId);
  }, [accentColor, character, facing, inkColor]);

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (Math.abs(e.deltaY) < 6) return;
    e.preventDefault();
    const now = performance.now();
    if (now - wheelLockRef.current < 115) return;
    wheelLockRef.current = now;
    onFocusSide(side);
    onStep(side, e.deltaY < 0 ? -1 : 1);
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 1) {
      touchStartYRef.current = e.touches[0].clientY;
    }
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    if (touchStartYRef.current === null || e.changedTouches.length === 0) return;
    const dy = e.changedTouches[0].clientY - touchStartYRef.current;
    touchStartYRef.current = null;
    if (Math.abs(dy) >= 28) {
      onFocusSide(side);
      onStep(side, dy > 0 ? -1 : 1);
    }
  };

  const stepAnimClass =
    stepCount === 0 || !stepDirection
      ? ''
      : stepDirection === 'up'
        ? 'animate-card-step-up'
        : 'animate-card-step-down';

  return (
    <div
      className="pointer-events-auto flex w-[156px] shrink-0 flex-col items-stretch sm:w-[228px] md:w-[252px]"
      onWheel={handleWheel}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Side identity + tabular position index */}
      <div
        className={`mb-1.5 flex items-baseline justify-between gap-2 px-1 ${
          isBlue ? 'flex-row' : 'flex-row-reverse'
        }`}
      >
        <span
          className={`font-hand text-base font-bold whitespace-nowrap sm:text-lg ${
            isBlue ? 'text-[#1E3A8A]' : 'text-[#991B1B]'
          }`}
        >
          {isBlue ? 'Bên Xanh' : 'Bên Đỏ'}
        </span>
        <span className="text-xs font-medium whitespace-nowrap text-slate-500 tabular-nums">
          {currentIndex + 1} / {totalCount}
        </span>
      </div>

      {/* Up navigation button (previous character) */}
      <button
        type="button"
        onClick={() => {
          onFocusSide(side);
          onStep(side, -1);
        }}
        aria-label={isBlue ? 'Nhân vật Bên Xanh trước' : 'Nhân vật Bên Đỏ trước'}
        className={`mb-1.5 inline-flex min-h-[40px] w-full cursor-pointer items-center justify-center gap-1.5 rounded-lg border bg-[#FDF8EB]/92 px-2.5 py-1.5 text-xs font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 sm:text-sm ${
          isBlue
            ? 'border-[#1E3A8A]/45 text-[#1E3A8A] hover:border-[#2563EB] hover:bg-blue-50/90 focus-visible:outline-blue-700'
            : 'border-[#991B1B]/45 text-[#991B1B] hover:border-[#DC2626] hover:bg-red-50/90 focus-visible:outline-red-700'
        }`}
      >
        <ChevronUp className="h-4 w-4 shrink-0" />
        <span className="truncate font-hand text-sm sm:text-base">{prevCharacterName}</span>
      </button>

      {/* Main Facing Character Card */}
      <div
        ref={cardRef}
        role="region"
        tabIndex={0}
        aria-label={`${isBlue ? 'Thẻ nhân vật Bên Xanh' : 'Thẻ nhân vật Bên Đỏ'}: ${character.name}`}
        onClick={() => onFocusSide(side)}
        onFocus={() => onFocusSide(side)}
        className={`relative flex cursor-pointer flex-col items-stretch overflow-hidden rounded-xl border-2 bg-[#FDF8EB]/96 p-2.5 text-left shadow-sm transition-shadow duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 sm:p-3.5 ${
          isBlue
            ? isFocused
              ? 'border-[#2563EB] shadow-[0_0_0_3px_rgba(37,99,235,0.18)] focus-visible:outline-blue-700'
              : 'border-[#1E3A8A]/80 hover:border-[#2563EB] focus-visible:outline-blue-700'
            : isFocused
              ? 'border-[#DC2626] shadow-[0_0_0_3px_rgba(220,38,38,0.18)] focus-visible:outline-red-700'
              : 'border-[#991B1B]/80 hover:border-[#DC2626] focus-visible:outline-red-700'
        }`}
      >
        <div key={`${character.id}-${stepCount}`} className={`flex flex-col ${stepAnimClass}`}>
          {/* Name + role subtitle */}
          <div
            className={`mb-1.5 flex flex-col gap-0.5 sm:mb-2 sm:flex-row sm:items-baseline sm:justify-between sm:gap-2 ${
              isBlue ? '' : 'sm:flex-row-reverse sm:text-right'
            }`}
          >
            <span
              className={`font-hand text-lg leading-none font-bold whitespace-nowrap sm:text-xl ${
                isBlue ? 'text-[#1E3A8A]' : 'text-[#991B1B]'
              }`}
            >
              {character.name}
            </span>
            <span className="truncate text-[11px] font-medium text-slate-500">
              {character.subtitle}
            </span>
          </div>

          {/* Animated ruled-paper portrait frame (facing opponent) */}
          <div className="mb-2 overflow-hidden rounded-lg border border-slate-400/50 bg-[#FAF2DD]">
            <canvas
              ref={canvasRef}
              aria-hidden="true"
              className="block h-[104px] w-full sm:h-[128px]"
            />
          </div>

          {/* Short description */}
          <p className="mb-2 line-clamp-2 min-h-[2.1rem] text-[11px] leading-snug text-slate-700 sm:min-h-[2.25rem] sm:text-xs">
            {character.description}
          </p>

          {/* Clean unboxed stats row with middot separators */}
          <div
            className={`truncate border-t border-slate-300/65 pt-1.5 text-[10px] font-medium text-slate-600 tabular-nums sm:pt-2 sm:text-[11px] ${
              isBlue ? 'text-left' : 'text-right'
            }`}
          >
            {character.statTags.join(' · ')}
          </div>
        </div>
      </div>

      {/* Down navigation button (next character) */}
      <button
        type="button"
        onClick={() => {
          onFocusSide(side);
          onStep(side, 1);
        }}
        aria-label={isBlue ? 'Nhân vật Bên Xanh tiếp theo' : 'Nhân vật Bên Đỏ tiếp theo'}
        className={`mt-1.5 inline-flex min-h-[40px] w-full cursor-pointer items-center justify-center gap-1.5 rounded-lg border bg-[#FDF8EB]/92 px-2.5 py-1.5 text-xs font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 sm:text-sm ${
          isBlue
            ? 'border-[#1E3A8A]/45 text-[#1E3A8A] hover:border-[#2563EB] hover:bg-blue-50/90 focus-visible:outline-blue-700'
            : 'border-[#991B1B]/45 text-[#991B1B] hover:border-[#DC2626] hover:bg-red-50/90 focus-visible:outline-red-700'
        }`}
      >
        <ChevronDown className="h-4 w-4 shrink-0" />
        <span className="truncate font-hand text-sm sm:text-base">{nextCharacterName}</span>
      </button>
    </div>
  );
};

interface CharacterSelectOverlayProps {
  isVisible: boolean;
  pickedCharacters: {
    left: CharacterId;
    right: CharacterId;
  };
  onChangeCharacter: (side: FighterSide, characterId: CharacterId) => void;
  onConfirm: (leftCardRect: DOMRect | null, rightCardRect: DOMRect | null) => void;
  onClose: () => void;
}

export const CharacterSelectOverlay: React.FC<CharacterSelectOverlayProps> = ({
  isVisible,
  pickedCharacters,
  onChangeCharacter,
  onConfirm,
  onClose,
}) => {
  const [focusedSide, setFocusedSide] = useState<FighterSide>('left');
  const [stepState, setStepState] = useState<{
    left: { dir: 'up' | 'down' | null; count: number };
    right: { dir: 'up' | 'down' | null; count: number };
  }>({
    left: { dir: null, count: 0 },
    right: { dir: null, count: 0 },
  });

  const leftCardRef = useRef<HTMLDivElement | null>(null);
  const rightCardRef = useRef<HTMLDivElement | null>(null);

  const handleStep = useCallback(
    (side: FighterSide, delta: -1 | 1) => {
      const currentId = pickedCharacters[side];
      const idx = CHARACTER_LIST.findIndex((c) => c.id === currentId);
      const safeIdx = idx >= 0 ? idx : 0;
      const nextIdx = (safeIdx + delta + CHARACTER_LIST.length) % CHARACTER_LIST.length;
      const nextChar = CHARACTER_LIST[nextIdx];

      sfx.unlock();
      sfx.playCardPick();

      setStepState((prev) => ({
        ...prev,
        [side]: {
          dir: delta < 0 ? 'up' : 'down',
          count: prev[side].count + 1,
        },
      }));

      onChangeCharacter(side, nextChar.id);
    },
    [onChangeCharacter, pickedCharacters],
  );

  const handleConfirmClick = useCallback(() => {
    const leftRect = leftCardRef.current?.getBoundingClientRect() ?? null;
    const rightRect = rightCardRef.current?.getBoundingClientRect() ?? null;
    onConfirm(leftRect, rightRect);
  }, [onConfirm]);

  useEffect(() => {
    if (!isVisible) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key === 'Enter') {
        e.preventDefault();
        handleConfirmClick();
        return;
      }
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setFocusedSide('left');
        return;
      }
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        setFocusedSide('right');
        return;
      }
      if (e.key === 'w' || e.key === 'W') {
        e.preventDefault();
        setFocusedSide('right');
        handleStep('left', -1);
        return;
      }
      if (e.key === 's' || e.key === 'S') {
        e.preventDefault();
        setFocusedSide('right');
        handleStep('left', 1);
        return;
      }
      if (e.key === 'i' || e.key === 'I') {
        e.preventDefault();
        setFocusedSide('right');
        handleStep('right', -1);
        return;
      }
      if (e.key === 'k' || e.key === 'K') {
        e.preventDefault();
        setFocusedSide('right');
        handleStep('right', 1);
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        handleStep(focusedSide, -1);
        return;
      }
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        handleStep(focusedSide, 1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [focusedSide, handleConfirmClick, handleStep, isVisible, onClose]);

  if (!isVisible) return null;

  const total = CHARACTER_LIST.length;
  const leftIdx = Math.max(
    0,
    CHARACTER_LIST.findIndex((c) => c.id === pickedCharacters.left),
  );
  const rightIdx = Math.max(
    0,
    CHARACTER_LIST.findIndex((c) => c.id === pickedCharacters.right),
  );

  const leftChar = getCharacterDef(pickedCharacters.left);
  const rightChar = getCharacterDef(pickedCharacters.right);
  const leftPrev = CHARACTER_LIST[(leftIdx - 1 + total) % total];
  const leftNext = CHARACTER_LIST[(leftIdx + 1) % total];
  const rightPrev = CHARACTER_LIST[(rightIdx - 1 + total) % total];
  const rightNext = CHARACTER_LIST[(rightIdx + 1) % total];

  return (
    <div
      className="pointer-events-none fixed inset-0 z-30 flex flex-col items-center justify-center px-2 py-14 sm:px-6 md:px-10"
      role="dialog"
      aria-modal="false"
      aria-label="Chọn nhân vật đối xứng"
    >
      {/* Symmetrical Left & Right Facing Character Cards */}
      <div className="flex w-full max-w-5xl items-center justify-between gap-2 sm:gap-4 md:gap-8">
        <SymmetricalCharacterSlot
          side="left"
          character={leftChar}
          currentIndex={leftIdx}
          totalCount={total}
          prevCharacterName={leftPrev.name}
          nextCharacterName={leftNext.name}
          isFocused={focusedSide === 'left'}
          stepDirection={stepState.left.dir}
          stepCount={stepState.left.count}
          cardRef={leftCardRef}
          onStep={handleStep}
          onFocusSide={setFocusedSide}
        />

        {/* Compact VS divider for narrow mobile screens */}
        <div
          className="flex shrink-0 flex-col items-center justify-center md:hidden"
          aria-hidden="true"
        >
          <span className="font-hand text-xl font-bold text-slate-600">VS</span>
        </div>

        {/* Center VS & Action Controls for Desktop/Tablet */}
        <div className="pointer-events-auto hidden flex-col items-center justify-center gap-3 px-2 md:flex">
          <span className="font-hand text-4xl font-bold tracking-tight text-slate-700" aria-hidden="true">
            VS
          </span>

          <div className="flex flex-col items-stretch gap-2">
            <button
              type="button"
              onClick={handleConfirmClick}
              className="inline-flex min-h-[44px] cursor-pointer items-center justify-center rounded-lg border-2 border-slate-800 bg-slate-800 px-6 py-2 font-hand text-lg font-bold whitespace-nowrap text-[#FDF8EB] shadow-xs transition-colors hover:bg-slate-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
            >
              Ra sân
            </button>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex min-h-[40px] cursor-pointer items-center justify-center rounded-lg border border-slate-500/65 bg-[#FDF8EB]/95 px-5 py-1.5 font-hand text-base font-semibold whitespace-nowrap text-slate-700 transition-colors hover:border-slate-800 hover:bg-[#FAF2DD] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
            >
              Đóng
            </button>
          </div>

          <p className="text-center text-xs font-medium whitespace-nowrap text-slate-500">
            W/S · ↑/↓ · Enter
          </p>
        </div>

        <SymmetricalCharacterSlot
          side="right"
          character={rightChar}
          currentIndex={rightIdx}
          totalCount={total}
          prevCharacterName={rightPrev.name}
          nextCharacterName={rightNext.name}
          isFocused={focusedSide === 'right'}
          stepDirection={stepState.right.dir}
          stepCount={stepState.right.count}
          cardRef={rightCardRef}
          onStep={handleStep}
          onFocusSide={setFocusedSide}
        />
      </div>

      {/* Mobile Action Buttons below the two facing cards */}
      <div className="pointer-events-auto mt-3 flex items-center justify-center gap-2.5 md:hidden">
        <button
          type="button"
          onClick={handleConfirmClick}
          className="inline-flex min-h-[44px] cursor-pointer items-center justify-center rounded-lg border-2 border-slate-800 bg-slate-800 px-5 py-2 font-hand text-base font-bold whitespace-nowrap text-[#FDF8EB] shadow-xs transition-colors hover:bg-slate-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
        >
          Ra sân
        </button>
        <button
          type="button"
          onClick={onClose}
          className="inline-flex min-h-[44px] cursor-pointer items-center justify-center rounded-lg border border-slate-500/65 bg-[#FDF8EB]/95 px-4 py-2 font-hand text-base font-semibold whitespace-nowrap text-slate-700 transition-colors hover:border-slate-800 hover:bg-[#FAF2DD] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
        >
          Đóng
        </button>
      </div>
    </div>
  );
};

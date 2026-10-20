import React, { useState, useEffect, useMemo } from 'react';
import {
  Sparkles,
  Lock,
  ArrowRight,
  RotateCcw,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Trophy,
  MapPin,
  ExternalLink,
  ChevronRight,
  Flame
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useApp } from '../context/AppContext';
import { PLANETS, DEITIES } from '../data/constants';
import { Temple } from '../types';

// Canonical Tamil Navagraha order
const CANONICAL_PLANET_ORDER = ['suri', 'san', 'sev', 'puth', 'guru', 'suk', 'sani', 'rahu', 'kethu'];

interface QuestionHistoryItem {
  templeId: string;
  templeName: string;
  templeImage?: string;
  templeLocation: string;
  userSelection: string[];
  correctPlanets: string[];
  isPerfect: boolean;
  isPartial: boolean;
  significance: string;
}

export const QuizTab: React.FC = () => {
  const { temples, setActiveTab, openDetailModal, isMobileFrame } = useApp();

  // Pick up to 10 randomized temples on the fly from the live temples database
  const [quizTemples, setQuizTemples] = useState<Temple[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedPlanets, setSelectedPlanets] = useState<string[]>([]);
  const [isLocked, setIsLocked] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [history, setHistory] = useState<QuestionHistoryItem[]>([]);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  // Initialize or reshuffle quiz temples (max 10 random on the fly)
  const initializeQuiz = () => {
    if (!temples || temples.length === 0) {
      setQuizTemples([]);
      return;
    }
    // Random shuffle
    const shuffled = [...temples].sort(() => Math.random() - 0.5);
    // Take all if <= 10, or randomly pick 10
    const selected = shuffled.slice(0, 10);
    setQuizTemples(selected);
    setCurrentIndex(0);
    setSelectedPlanets([]);
    setIsLocked(false);
    setScore(0);
    setHistory([]);
    setIsCompleted(false);
  };

  useEffect(() => {
    initializeQuiz();
  }, [temples]);

  const currentTemple: Temple | undefined = quizTemples[currentIndex];
  const targetPlanets: string[] = currentTemple?.planets || [];

  // Sort canonical planets for display
  const orderedPlanets = useMemo(() => {
    return CANONICAL_PLANET_ORDER.map(id => PLANETS.find(p => p.id === id)).filter(Boolean) as typeof PLANETS;
  }, []);

  // Toggle planet selection before locking
  const togglePlanet = (planetId: string) => {
    if (isLocked) return;
    setSelectedPlanets(prev =>
      prev.includes(planetId)
        ? prev.filter(id => id !== planetId)
        : [...prev, planetId]
    );
  };

  // Lock answer and verify
  const handleLockAnswer = () => {
    if (isLocked || selectedPlanets.length === 0 || !currentTemple) return;

    setIsLocked(true);

    const correctSet = new Set(targetPlanets);
    const userSet = new Set(selectedPlanets);

    const correctlySelected = selectedPlanets.filter(p => correctSet.has(p));
    const falselySelected = selectedPlanets.filter(p => !correctSet.has(p));
    const missed = targetPlanets.filter(p => !userSet.has(p));

    const isPerfect = falselySelected.length === 0 && missed.length === 0;
    const isPartial = correctlySelected.length > 0 && falselySelected.length === 0 && missed.length > 0;

    let pointsEarned = 0;
    if (isPerfect) {
      pointsEarned = 1;
      setScore(prev => prev + 1);
      // Trigger joyous celebration confetti!
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch {}
    } else if (isPartial) {
      pointsEarned = 0.5;
      setScore(prev => prev + 0.5);
      try {
        confetti({
          particleCount: 40,
          spread: 50,
          origin: { y: 0.6 }
        });
      } catch {}
    }

    setHistory(prev => [
      ...prev,
      {
        templeId: currentTemple.id,
        templeName: currentTemple.name,
        templeImage: currentTemple.imageUrl,
        templeLocation: currentTemple.location,
        userSelection: [...selectedPlanets],
        correctPlanets: [...targetPlanets],
        isPerfect,
        isPartial,
        significance: currentTemple.significance || currentTemple.descriptionTamil || ''
      }
    ]);
  };

  // Proceed to next temple
  const handleNext = () => {
    if (currentIndex + 1 < quizTemples.length) {
      setCurrentIndex(prev => prev + 1);
      setSelectedPlanets([]);
      setIsLocked(false);
    } else {
      setIsCompleted(true);
      try {
        confetti({
          particleCount: 120,
          spread: 90,
          origin: { y: 0.5 }
        });
      } catch {}
    }
  };

  // 1. EMPTY STATE IF NO TEMPLES IN CATALOG
  if (temples.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-12 text-center space-y-5">
        <div className="w-16 h-16 mx-auto rounded-3xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center">
          <Sparkles className="w-8 h-8" />
        </div>
        <div className="space-y-1.5">
          <h2 className="text-xl font-bold text-gray-100">
            No Temples in Database Yet
          </h2>
          <p className="text-xs text-gray-400 max-w-sm mx-auto leading-relaxed">
            The quiz generates questions dynamically from the temples stored in your catalog. Please add your first temple to start the Navagraha quiz!
          </p>
        </div>
        <button
          onClick={() => setActiveTab('temples')}
          className="px-5 py-2.5 rounded-xl bg-[#f5a623] hover:bg-[#e69818] text-black font-bold text-xs shadow-lg cursor-pointer transition-all"
        >
          Go to Temples Section
        </button>
      </div>
    );
  }

  // 2. QUIZ COMPLETION / FINAL RESULTS SCREEN
  if (isCompleted) {
    const totalQuestions = quizTemples.length;
    const percentage = Math.round((score / totalQuestions) * 100);

    return (
      <div className="max-w-2xl mx-auto px-4 py-6 sm:py-8 space-y-6 animate-in fade-in duration-300">
        {/* Results Hero Header */}
        <div className="rounded-3xl bg-gradient-to-b from-[#181b2e] to-[#111322] border border-[#2b304c] p-6 sm:p-8 text-center space-y-4 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="inline-flex p-3 rounded-2xl bg-amber-500/20 text-[#f5a623] border border-amber-500/40 shadow-lg">
            <Trophy className="w-10 h-10" />
          </div>

          <div className="space-y-1">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-100">
              நவகிரக வினாடி வினா நிறைவு!
            </h2>
            <p className="text-xs text-gray-400">
              Navagraha Temple Knowledge Test Completed
            </p>
          </div>

          {/* Score Badge */}
          <div className="inline-flex items-center gap-3 px-6 py-3 rounded-2xl bg-[#0f111d] border border-amber-500/30">
            <div>
              <div className="text-xs text-gray-400">Your Score</div>
              <div className="text-2xl sm:text-3xl font-extrabold text-[#f5a623]">
                {score} / {totalQuestions}
              </div>
            </div>
            <div className="h-9 w-px bg-gray-700" />
            <div className="text-left">
              <div className="text-xs text-gray-400">Accuracy</div>
              <div className="text-lg sm:text-xl font-bold text-gray-200">
                {percentage}%
              </div>
            </div>
          </div>

          <p className="text-xs text-amber-300 font-tamil max-w-md mx-auto leading-relaxed">
            {percentage === 100
              ? '🌟 அற்புதம்! அனைத்து நவகிரக கோவில் பொருத்தங்களும் துல்லியமாக விடையளித்துள்ளீர்கள்!'
              : percentage >= 50
              ? '✨ நன்று! நவகிரக தலங்களின் கிரக தொடர்புகளை சிறப்பாக அறிந்துள்ளீர்கள்!'
              : '🙏 நல்ல முயற்சி! தொடர்ந்து கோவில்களை தரிசித்து நவகிரக அருளைப் பெறுங்கள்!'}
          </p>

          {/* Actions */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={initializeQuiz}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#f5a623] hover:bg-[#e69818] text-black font-bold text-xs shadow-lg shadow-amber-500/20 cursor-pointer transition-all active:scale-95"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Play Again (மறுமுறை விளையாடு)</span>
            </button>
            <button
              onClick={() => setActiveTab('temples')}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1e2236] hover:bg-[#282d46] text-gray-200 font-semibold text-xs border border-[#343956] cursor-pointer transition-all"
            >
              <span>Explore All Temples</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Detailed Breakdown History */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-gray-300 px-1 flex items-center gap-2">
            <span>Summary of Tested Temples ({history.length}):</span>
          </h3>

          <div className="space-y-3">
            {history.map((item, idx) => {
              return (
                <div
                  key={idx}
                  className={`p-4 rounded-2xl border transition-all ${
                    item.isPerfect
                      ? 'bg-[#121c19] border-emerald-500/40 text-emerald-200'
                      : item.isPartial
                      ? 'bg-[#1c1a12] border-amber-500/40 text-amber-200'
                      : 'bg-[#1c1214] border-red-500/40 text-red-200'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        {item.isPerfect ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        ) : item.isPartial ? (
                          <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-400 shrink-0" />
                        )}
                        <h4 className="text-sm font-bold text-gray-100 truncate">
                          {item.templeName}
                        </h4>
                      </div>
                      <p className="text-[11px] text-gray-400">
                        📍 {item.templeLocation}
                      </p>
                    </div>

                    <span
                      className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full shrink-0 ${
                        item.isPerfect
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                          : item.isPartial
                          ? 'bg-amber-950 text-amber-300 border border-amber-500/40'
                          : 'bg-red-950 text-red-300 border border-red-500/40'
                      }`}
                    >
                      {item.isPerfect ? '+1 Correct' : item.isPartial ? '+0.5 Partial' : '0 Incorrect'}
                    </span>
                  </div>

                  {/* Planet comparison */}
                  <div className="mt-3 pt-2.5 border-t border-white/10 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs">
                    <div className="flex items-center gap-1.5">
                      <span className="text-gray-400 text-[11px]">Correct Planets:</span>
                      <div className="flex items-center gap-1">
                        {item.correctPlanets.map(pId => {
                          const p = PLANETS.find(x => x.id === pId);
                          return (
                            <span
                              key={pId}
                              className="px-2 py-0.5 rounded-full text-xs font-tamil font-bold bg-[#1e2236] text-[#f5a623] border border-amber-500/40"
                            >
                              {p?.nameTamil || pId}
                            </span>
                          );
                        })}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className="text-gray-400 text-[11px]">Your Guess:</span>
                      <div className="flex items-center gap-1">
                        {item.userSelection.length > 0 ? (
                          item.userSelection.map(pId => {
                            const p = PLANETS.find(x => x.id === pId);
                            const wasCorrect = item.correctPlanets.includes(pId);
                            return (
                              <span
                                key={pId}
                                className={`px-2 py-0.5 rounded-full text-xs font-tamil font-semibold border ${
                                  wasCorrect
                                    ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/40'
                                    : 'bg-red-950/60 text-red-300 border-red-500/40 line-through'
                                }`}
                              >
                                {p?.nameTamil || pId}
                              </span>
                            );
                          })
                        ) : (
                          <span className="text-gray-500 italic text-[11px]">None</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // 3. ACTIVE QUIZ QUESTION VIEW
  if (!currentTemple) return null;

  const deityObj = DEITIES.find(d => d.id === currentTemple.deity);
  const correctSet = new Set(targetPlanets);
  const userSet = new Set(selectedPlanets);
  const isPerfect = isLocked && selectedPlanets.every(p => correctSet.has(p)) && targetPlanets.every(p => userSet.has(p));

  return (
    <div className="max-w-2xl mx-auto px-3 sm:px-4 py-4 sm:py-6 space-y-4 sm:space-y-5">
      {/* Quiz Progress & Live Score Bar */}
      <div className="flex items-center justify-between text-xs pb-1 border-b border-[#212437]">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-full bg-[#1b1e30] border border-[#2b304c] text-amber-300 font-bold text-[11px]">
            Question {currentIndex + 1} of {quizTemples.length}
          </span>
          <span className="text-gray-400 hidden sm:inline text-[11px]">
            Randomly selected from database
          </span>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-950/50 border border-emerald-500/40 text-emerald-300 font-bold text-xs">
            <span>Score:</span>
            <span>{score}</span>
          </div>

          <button
            onClick={initializeQuiz}
            title="Restart quiz with fresh random temples"
            className="p-1 rounded-lg text-gray-400 hover:text-gray-200 hover:bg-[#1b1e30] transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Progress Line */}
      <div className="w-full h-1.5 rounded-full bg-[#171a2a] overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-amber-500 to-amber-400 transition-all duration-300 rounded-full"
          style={{ width: `${((currentIndex + 1) / quizTemples.length) * 100}%` }}
        />
      </div>

      {/* Temple Showcase Card */}
      <div className="rounded-3xl bg-[#141624] border border-[#272b44] shadow-xl overflow-hidden space-y-0">
        {/* Temple Photo if available */}
        {currentTemple.imageUrl ? (
          <div className="relative aspect-[16/9] sm:aspect-[21/9] w-full bg-black/40 overflow-hidden">
            <img
              src={currentTemple.imageUrl}
              alt={currentTemple.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#141624] via-transparent to-black/30 pointer-events-none" />

            {/* Location Pill */}
            <div className="absolute bottom-3 left-3 flex items-center gap-1 px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-md text-amber-300 text-[11px] font-semibold border border-white/10">
              <MapPin className="w-3 h-3 text-[#f5a623]" />
              <span>{currentTemple.location}</span>
            </div>

            {deityObj && (
              <div className="absolute bottom-3 right-3 px-2 py-0.5 rounded-lg bg-black/60 backdrop-blur-md text-gray-200 text-[11px] font-tamil border border-white/10">
                {deityObj.nameTamil}
              </div>
            )}
          </div>
        ) : (
          <div className="p-4 bg-gradient-to-r from-[#171a2d] to-[#121422] border-b border-[#24273e] flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs text-amber-300">
              <MapPin className="w-3.5 h-3.5 text-[#f5a623]" />
              <span>{currentTemple.location}</span>
            </div>
            {deityObj && (
              <span className="px-2 py-0.5 rounded-full text-xs font-tamil text-gray-300 bg-[#1c1f32]">
                {deityObj.nameTamil}
              </span>
            )}
          </div>
        )}

        {/* Temple Name & Question Prompt */}
        <div className="p-4 sm:p-5 space-y-2">
          <div className="space-y-0.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
              இத்திருக்கோவில் தொடர்புடைய கிரகங்கள் எவை?
            </span>
            <h3 className="text-lg sm:text-xl font-extrabold text-gray-100">
              {currentTemple.name}
            </h3>
            <p className="text-xs text-gray-400">
              Select the matching Navagraha planet(s) below, then tap <strong>Lock Answer</strong>.
            </p>
          </div>
        </div>
      </div>

      {/* The 9 Planets Grid (All nine in Tamil - first two alphabets only) */}
      <div className="rounded-3xl bg-[#121422] border border-[#24273d] p-4 sm:p-5 shadow-lg space-y-3">
        <div className="flex items-center justify-between text-xs text-gray-300 pb-1">
          <span className="font-semibold text-gray-200">
            நவகிரகங்கள் (Navagrahas):
          </span>
          <span className="text-[11px] text-amber-400">
            {selectedPlanets.length === 0
              ? 'Tap to select planet(s)'
              : `${selectedPlanets.length} selected`}
          </span>
        </div>

        {/* 9 Planet Tappable Buttons (3x3 Grid on mobile and tablet) */}
        <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
          {orderedPlanets.map(planet => {
            const isSelected = selectedPlanets.includes(planet.id);
            const isTarget = targetPlanets.includes(planet.id);

            // Determine visual styling based on lock state
            let buttonClasses = 'bg-[#181a29] border-[#292d44] text-gray-200 hover:border-amber-400/60 hover:bg-[#1f2236]';

            if (isLocked) {
              if (isSelected && isTarget) {
                // Correctly chosen
                buttonClasses = 'bg-emerald-950/80 border-emerald-500 text-emerald-200 ring-2 ring-emerald-500/40 font-bold';
              } else if (isSelected && !isTarget) {
                // Incorrectly chosen
                buttonClasses = 'bg-red-950/80 border-red-500 text-red-200 ring-2 ring-red-500/40 line-through';
              } else if (!isSelected && isTarget) {
                // Missed correct planet
                buttonClasses = 'bg-amber-950/40 border-amber-500/80 text-amber-300 border-dashed animate-pulse font-bold';
              } else {
                // Unselected and not target
                buttonClasses = 'bg-[#111320] border-[#202334] text-gray-600 opacity-60';
              }
            } else if (isSelected) {
              buttonClasses = 'bg-gradient-to-r from-amber-500 to-amber-600 text-gray-950 font-bold border-amber-300 shadow-md shadow-amber-500/25 scale-[1.02]';
            }

            return (
              <button
                key={planet.id}
                type="button"
                onClick={() => togglePlanet(planet.id)}
                disabled={isLocked}
                className={`py-3 sm:py-3.5 px-2 rounded-2xl border text-center transition-all flex flex-col items-center justify-center min-h-[56px] sm:min-h-[64px] cursor-pointer select-none active:scale-95 ${buttonClasses}`}
              >
                {/* 2-letter Tamil Planet Name */}
                <span className="text-base sm:text-lg font-tamil font-extrabold leading-tight">
                  {planet.nameTamil}
                </span>

                {/* Subtitle name (English/Lord) */}
                <span className={`text-[10px] mt-0.5 truncate max-w-full ${
                  isSelected && !isLocked ? 'text-black/80 font-medium' : 'text-gray-400'
                }`}>
                  {planet.nameEnglish.split(' ')[0]}
                </span>

                {/* Post-lock feedback icon badge */}
                {isLocked && (
                  <div className="mt-1">
                    {isSelected && isTarget && (
                      <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-emerald-400">
                        <CheckCircle2 className="w-3 h-3" /> Correct
                      </span>
                    )}
                    {isSelected && !isTarget && (
                      <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-red-400">
                        <XCircle className="w-3 h-3" /> Wrong
                      </span>
                    )}
                    {!isSelected && isTarget && (
                      <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-amber-400">
                        Missed
                      </span>
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Action Button: Lock Answer vs Next Temple */}
        <div className="pt-2">
          {!isLocked ? (
            <button
              onClick={handleLockAnswer}
              disabled={selectedPlanets.length === 0}
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-gray-950 font-extrabold text-sm shadow-xl shadow-amber-500/20 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all flex items-center justify-center gap-2 active:scale-98"
            >
              <Lock className="w-4 h-4" />
              <span>Lock Answer (விடயை உறுதி செய்)</span>
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white font-extrabold text-sm shadow-xl shadow-emerald-900/30 cursor-pointer transition-all flex items-center justify-center gap-2 active:scale-98 animate-in slide-in-from-bottom-2"
            >
              <span>{currentIndex + 1 < quizTemples.length ? 'Next Temple (அடுத்த கோவில்)' : 'View Final Score 🏆'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Answer Explanation & Pariharam Reveal Card (Post Lock) */}
      {isLocked && (
        <div className={`p-4 sm:p-5 rounded-3xl border text-xs sm:text-sm space-y-3 animate-in fade-in duration-200 shadow-xl ${
          isPerfect
            ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-100'
            : 'bg-[#181a2b] border-amber-500/40 text-amber-100'
        }`}>
          <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-2.5">
            <div className="flex items-center gap-2 font-bold text-sm sm:text-base">
              {isPerfect ? (
                <>
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  <span className="text-emerald-300">சரியான விடை! Perfect Match!</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 text-amber-400" />
                  <span className="text-amber-300">விடை விவரம் (Temple Details)</span>
                </>
              )}
            </div>

            <button
              onClick={() => openDetailModal(currentTemple)}
              className="text-xs text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Full Details</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>

          {/* Actual Planets */}
          <div className="flex items-center gap-2 flex-wrap text-xs">
            <span className="text-gray-300 font-medium">தொடர்புடைய நவகிரகங்கள்:</span>
            <div className="flex items-center gap-1.5 flex-wrap">
              {targetPlanets.map(pId => {
                const p = PLANETS.find(x => x.id === pId);
                return (
                  <span
                    key={pId}
                    className="px-2.5 py-0.5 rounded-full text-xs font-tamil font-bold bg-[#111322] text-[#f5a623] border border-amber-500/40"
                  >
                    {p?.nameTamil} ({p?.nameEnglish})
                  </span>
                );
              })}
            </div>
          </div>

          {/* Temple Significance Quote */}
          {currentTemple.significance && (
            <div className="pt-1 text-xs text-gray-300 font-tamil leading-relaxed">
              <span className="text-amber-400 font-bold block mb-0.5">சிறப்பு & பரிகாரம்:</span>
              <p className="whitespace-pre-line bg-[#0f111e] p-3 rounded-xl border border-white/5">
                {currentTemple.significance}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

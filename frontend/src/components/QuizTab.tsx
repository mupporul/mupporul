import React, { useState } from 'react';
import { HelpCircle, Sparkles, ArrowRight, RotateCcw, MapPin, CheckCircle } from 'lucide-react';
import { SAMPLE_QUIZ_QUESTIONS, PLANETS } from '../data/constants';
import { useApp } from '../context/AppContext';

export const QuizTab: React.FC = () => {
  const { setSelectedPlanetFilter, setActiveTab, temples } = useApp();

  const [currentStep, setCurrentStep] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [resultGraha, setResultGraha] = useState<string | null>(null);

  const question = SAMPLE_QUIZ_QUESTIONS[currentStep];

  const handleSelectOption = (graha: string) => {
    const nextAnswers = { ...selectedAnswers, [question.id]: graha };
    setSelectedAnswers(nextAnswers);

    if (currentStep < SAMPLE_QUIZ_QUESTIONS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Calculate dominant graha
      setResultGraha(graha);
    }
  };

  const handleReset = () => {
    setCurrentStep(0);
    setSelectedAnswers({});
    setResultGraha(null);
  };

  const matchedPlanet = resultGraha ? PLANETS.find(p => p.id === resultGraha) : null;
  const recommendedTemples = resultGraha
    ? temples.filter(t => t.planets.includes(resultGraha))
    : [];

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Navagraha Pariharam Finder (பரிகார வழிகாட்டி)</span>
        </div>
        <h2 className="text-2xl font-bold text-gray-100 font-cinzel">
          Spiritual Temple & Dosha Guide
        </h2>
        <p className="text-xs text-gray-400 max-w-md mx-auto">
          Answer a few quick questions to identify the auspicious temple and Navagraha deity suited for your current life remedy.
        </p>
      </div>

      {!resultGraha ? (
        /* Quiz Active Question Card */
        <div className="rounded-3xl bg-[#141624] border border-[#25293f] p-6 shadow-xl space-y-5">
          {/* Progress */}
          <div className="flex items-center justify-between text-xs text-gray-400">
            <span>Question {currentStep + 1} of {SAMPLE_QUIZ_QUESTIONS.length}</span>
            <div className="w-24 h-1.5 rounded-full bg-[#1e2236] overflow-hidden">
              <div
                className="h-full bg-[#f5a623] transition-all"
                style={{ width: `${((currentStep + 1) / SAMPLE_QUIZ_QUESTIONS.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Question Text */}
          <div className="space-y-1.5">
            <h3 className="text-base font-bold text-gray-100">
              {question.question}
            </h3>
            <p className="text-xs text-amber-300 font-tamil">
              {question.questionTamil}
            </p>
          </div>

          {/* Options */}
          <div className="space-y-3 pt-2">
            {question.options.map((opt, idx) => (
              <button
                key={idx}
                onClick={() => handleSelectOption(opt.graha)}
                className="w-full p-4 rounded-2xl bg-[#181a29] border border-[#292d44] hover:border-[#f5a623] hover:bg-[#1e2236] text-left transition-all group flex flex-col space-y-1 cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-200 group-hover:text-amber-300 transition-colors">
                    {opt.label}
                  </span>
                  <ArrowRight className="w-4 h-4 text-gray-500 group-hover:text-[#f5a623] transition-colors" />
                </div>
                <span className="text-xs text-gray-400 font-tamil">
                  {opt.labelTamil}
                </span>
                <span className="text-[11px] text-amber-400/80 pt-0.5 italic">
                  💡 {opt.reason}
                </span>
              </button>
            ))}
          </div>
        </div>
      ) : (
        /* Quiz Result Card */
        <div className="rounded-3xl bg-[#141624] border border-[#25293f] p-6 shadow-2xl space-y-6 animate-in zoom-in-95 duration-200">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 mx-auto rounded-full bg-amber-500/20 text-[#f5a623] flex items-center justify-center font-bold text-xl border border-amber-500/30">
              🕉️
            </div>
            <span className="text-xs font-semibold text-amber-400 uppercase tracking-widest">
              Recommended Navagraha Deity
            </span>
            <h3 className="text-2xl font-extrabold text-gray-100 font-tamil">
              {matchedPlanet?.grahaLord} ({matchedPlanet?.nameEnglish})
            </h3>
            <p className="text-xs text-gray-300 max-w-sm mx-auto">
              Auspicious day for worship: <strong>{matchedPlanet?.day}</strong>. 
              Recommended offering & gemstone: <strong>{matchedPlanet?.gemstone}</strong>.
            </p>
          </div>

          {/* Recommended Temples List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-semibold text-gray-300">
              <span>Sacred Temples for this Remedy:</span>
              <span className="text-amber-400">{recommendedTemples.length} found</span>
            </div>

            <div className="space-y-2.5">
              {recommendedTemples.slice(0, 3).map(temple => (
                <div
                  key={temple.id}
                  className="p-3.5 rounded-2xl bg-[#181a29] border border-[#272b42] flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={temple.imageUrl}
                      alt={temple.name}
                      className="w-12 h-12 rounded-xl object-cover"
                    />
                    <div>
                      <h4 className="text-sm font-bold text-gray-100">{temple.name}</h4>
                      <span className="text-[11px] text-gray-400 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-[#f5a623]" /> {temple.location}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      if (resultGraha) {
                        setSelectedPlanetFilter(resultGraha);
                      }
                      setActiveTab('temples');
                    }}
                    className="px-3 py-1.5 rounded-xl bg-amber-500/15 border border-amber-500/40 text-amber-300 hover:bg-amber-500/25 text-xs font-semibold whitespace-nowrap cursor-pointer"
                  >
                    View Temple →
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-2 border-t border-[#22253a]">
            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Retake Quiz</span>
            </button>

            <button
              onClick={() => {
                if (resultGraha) setSelectedPlanetFilter(resultGraha);
                setActiveTab('temples');
              }}
              className="px-5 py-2.5 rounded-xl bg-[#f5a623] hover:bg-[#e69818] text-black font-bold text-xs shadow-md shadow-amber-500/25 cursor-pointer"
            >
              Filter All Matching Temples
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

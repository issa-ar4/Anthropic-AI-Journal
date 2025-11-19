import React, { useState } from 'react';
import { X, ChevronRight, ChevronLeft, Sparkles } from 'lucide-react';

interface CanvasGuideProps {
  onClose: () => void;
}

const CanvasGuide: React.FC<CanvasGuideProps> = ({ onClose }) => {
  const [step, setStep] = useState(0);

  const steps = [
    {
      title: "Welcome to Your Cognitive Canvas! 🎨",
      content: (
        <div className="space-y-3">
          <p>This interactive visualization reveals patterns in your thoughts and emotions based on your journal entries.</p>
          <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
            <p className="font-semibold text-purple-900 mb-2">What you'll discover:</p>
            <ul className="space-y-1 text-sm text-purple-800">
              <li>• Emotional patterns over time</li>
              <li>• Recurring themes in your life</li>
              <li>• Cognitive distortions to work on</li>
              <li>• Connections between your thoughts</li>
            </ul>
          </div>
        </div>
      )
    },
    {
      title: "Understanding the Nodes 🔵",
      content: (
        <div className="space-y-3">
          <p>Each circle (node) represents a different element from your journal:</p>
          <div className="space-y-2">
            <div className="flex items-center gap-3 p-2 bg-gray-50 rounded">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white">📝</div>
              <div>
                <p className="font-semibold text-sm">Entries</p>
                <p className="text-xs text-gray-600">Your journal entries</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-2 bg-gray-50 rounded">
              <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-red-500 rounded-full flex items-center justify-center text-white">😊</div>
              <div>
                <p className="font-semibold text-sm">Emotions</p>
                <p className="text-xs text-gray-600">Feelings identified in your writing</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-2 bg-gray-50 rounded">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white">💡</div>
              <div>
                <p className="font-semibold text-sm">Themes</p>
                <p className="text-xs text-gray-600">Recurring topics in your life</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-2 bg-gray-50 rounded">
              <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-full flex items-center justify-center text-white">⚠️</div>
              <div>
                <p className="font-semibold text-sm">Distortions</p>
                <p className="text-xs text-gray-600">Thinking patterns to challenge</p>
              </div>
            </div>
          </div>
          <p className="text-sm text-gray-600 mt-3">
            💡 <strong>Tip:</strong> Larger nodes appear more frequently in your entries
          </p>
        </div>
      )
    },
    {
      title: "Reading the Connections 🔗",
      content: (
        <div className="space-y-3">
          <p>Lines between nodes show relationships:</p>
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 space-y-2">
            <div>
              <p className="font-semibold text-blue-900">Thicker lines = Stronger connections</p>
              <p className="text-sm text-blue-800">These elements appear together often</p>
            </div>
            <div>
              <p className="font-semibold text-blue-900">Closer nodes = More related</p>
              <p className="text-sm text-blue-800">The algorithm groups related concepts</p>
            </div>
          </div>
          <p className="text-sm">
            <strong>Example:</strong> If "anxiety" is close to "work," your work might be triggering anxiety.
          </p>
        </div>
      )
    },
    {
      title: "Interacting with the Canvas 🖱️",
      content: (
        <div className="space-y-3">
          <p className="font-semibold">Here's what you can do:</p>
          <div className="space-y-3">
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-3 rounded-lg border border-purple-200">
              <p className="font-semibold text-purple-900">Click a Node</p>
              <p className="text-sm text-purple-800">See details and all its connections</p>
            </div>
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-3 rounded-lg border border-blue-200">
              <p className="font-semibold text-blue-900">Drag Nodes</p>
              <p className="text-sm text-blue-800">Rearrange to see relationships better</p>
            </div>
            <div className="bg-gradient-to-r from-green-50 to-teal-50 p-3 rounded-lg border border-green-200">
              <p className="font-semibold text-green-900">Zoom & Pan</p>
              <p className="text-sm text-green-800">Use mouse wheel or zoom buttons</p>
            </div>
            <div className="bg-gradient-to-r from-orange-50 to-yellow-50 p-3 rounded-lg border border-orange-200">
              <p className="font-semibold text-orange-900">Filter Types</p>
              <p className="text-sm text-orange-800">Use left panel to focus on specific elements</p>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Making It Useful 🎯",
      content: (
        <div className="space-y-3">
          <p className="font-semibold">Here's how to use this for personal growth:</p>
          <div className="space-y-2">
            <div className="flex gap-2">
              <span className="text-lg">1️⃣</span>
              <div>
                <p className="font-semibold">Identify Patterns</p>
                <p className="text-sm text-gray-600">Look for emotions or themes that appear frequently</p>
              </div>
            </div>
            <div className="flex gap-2">
              <span className="text-lg">2️⃣</span>
              <div>
                <p className="font-semibold">Spot Triggers</p>
                <p className="text-sm text-gray-600">See what themes connect to negative emotions</p>
              </div>
            </div>
            <div className="flex gap-2">
              <span className="text-lg">3️⃣</span>
              <div>
                <p className="font-semibold">Challenge Distortions</p>
                <p className="text-sm text-gray-600">Focus on your most common cognitive distortions</p>
              </div>
            </div>
            <div className="flex gap-2">
              <span className="text-lg">4️⃣</span>
              <div>
                <p className="font-semibold">Track Progress</p>
                <p className="text-sm text-gray-600">Regenerate monthly to see how you're evolving</p>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200 mt-4">
            <p className="font-semibold text-green-900">🌱 Ready to explore!</p>
            <p className="text-sm text-green-800">Check the insights panel on the right for actionable takeaways.</p>
          </div>
        </div>
      )
    }
  ];

  const currentStep = steps[step];
  const isLastStep = step === steps.length - 1;
  const isFirstStep = step === 0;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-6 rounded-t-2xl text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-6 h-6" />
            <span className="text-sm font-semibold opacity-90">Step {step + 1} of {steps.length}</span>
          </div>
          <h2 className="text-2xl font-bold">{currentStep.title}</h2>
        </div>

        {/* Content */}
        <div className="p-6">
          {currentStep.content}
        </div>

        {/* Footer */}
        <div className="p-6 bg-gray-50 rounded-b-2xl flex items-center justify-between border-t border-gray-200">
          <button
            onClick={() => setStep(s => Math.max(0, s - 1))}
            disabled={isFirstStep}
            className="px-4 py-2 flex items-center gap-2 text-gray-700 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft size={20} />
            Previous
          </button>

          <div className="flex gap-2">
            {steps.map((_, idx) => (
              <div
                key={idx}
                className={`w-2 h-2 rounded-full transition-all ${
                  idx === step ? 'bg-purple-600 w-8' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>

          {isLastStep ? (
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:shadow-lg transition-all font-semibold"
            >
              Get Started!
            </button>
          ) : (
            <button
              onClick={() => setStep(s => Math.min(steps.length - 1, s + 1))}
              className="px-4 py-2 flex items-center gap-2 text-gray-700 hover:text-gray-900 transition-colors"
            >
              Next
              <ChevronRight size={20} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CanvasGuide;

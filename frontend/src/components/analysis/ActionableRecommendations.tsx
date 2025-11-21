import { InsightData, Pattern } from '../../types/analysis.types';
import { Lightbulb, Target, BookOpen, Brain, Heart, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ActionableRecommendationsProps {
  data: InsightData;
  patterns: Pattern[];
}

interface Recommendation {
  id: string;
  title: string;
  description: string;
  type: 'technique' | 'exercise' | 'journal_prompt' | 'root_cause' | 'reflection';
  priority: 'high' | 'medium' | 'low';
  icon: React.ReactNode;
  action?: {
    label: string;
    link?: string;
  };
}

export default function ActionableRecommendations({ data, patterns }: ActionableRecommendationsProps) {
  const recommendations: Recommendation[] = [];

  // Generate recommendations based on cognitive distortions
  const distortionMap: { [key: string]: Recommendation } = {
    'catastrophizing': {
      id: 'cat-1',
      title: 'Challenge Catastrophic Thinking',
      description: 'When you catch yourself imagining worst-case scenarios, ask: "What\'s the evidence for this? What\'s more likely to happen?" Write down 3 realistic outcomes.',
      type: 'technique',
      priority: 'high',
      icon: <Brain className="w-5 h-5" />,
      action: {
        label: 'Start a journal entry',
        link: '/journal',
      },
    },
    'mind_reading': {
      id: 'mr-1',
      title: 'Test Your Assumptions',
      description: 'Notice when you assume what others think. Challenge it: "What actual evidence do I have?" Consider alternative explanations for their behavior.',
      type: 'technique',
      priority: 'high',
      icon: <Brain className="w-5 h-5" />,
    },
    'black_and_white_thinking': {
      id: 'bw-1',
      title: 'Find the Gray Area',
      description: 'When things feel all-or-nothing, practice finding the middle ground. Rate situations on a scale of 1-10 instead of "good" or "bad".',
      type: 'technique',
      priority: 'high',
      icon: <Brain className="w-5 h-5" />,
    },
    'emotional_reasoning': {
      id: 'er-1',
      title: 'Separate Feelings from Facts',
      description: 'Practice distinguishing between "I feel like a failure" and "I made a mistake." Your emotions are valid, but they aren\'t always accurate reflections of reality.',
      type: 'technique',
      priority: 'high',
      icon: <Heart className="w-5 h-5" />,
    },
    'overgeneralization': {
      id: 'og-1',
      title: 'Challenge "Always" and "Never"',
      description: 'When you catch words like "always," "never," or "everyone," challenge them. Look for specific instances and exceptions to your rule.',
      type: 'technique',
      priority: 'high',
      icon: <Brain className="w-5 h-5" />,
    },
  };

  // Add distortion-specific recommendations
  data.mostCommonDistortions.slice(0, 3).forEach(distortion => {
    const key = distortion.type.toLowerCase().replace(/ /g, '_');
    if (distortionMap[key]) {
      recommendations.push(distortionMap[key]);
    }
  });

  // Add pattern-specific recommendations
  patterns.slice(0, 2).forEach(pattern => {
    if (pattern.type === 'trigger' && pattern.frequency >= 3) {
      recommendations.push({
        id: `trigger-${pattern.id}`,
        title: 'Explore Your Trigger Patterns',
        description: `You've identified a recurring trigger: "${pattern.description}". Consider using a Root Cause session to dig deeper into why this affects you.`,
        type: 'root_cause',
        priority: 'high',
        icon: <Target className="w-5 h-5" />,
        action: {
          label: 'Start Root Cause Analysis',
          link: '/root-cause',
        },
      });
    }

    if (pattern.type === 'behavioral' && pattern.frequency >= 3) {
      recommendations.push({
        id: `behavior-${pattern.id}`,
        title: 'Address Behavioral Pattern',
        description: `You've noticed: "${pattern.description}". Try journaling about one small change you could make to interrupt this pattern.`,
        type: 'journal_prompt',
        priority: 'medium',
        icon: <BookOpen className="w-5 h-5" />,
        action: {
          label: 'Journal about it',
          link: '/journal',
        },
      });
    }
  });

  // Add general recommendations
  if (data.emotionalTrends.length >= 5) {
    recommendations.push({
      id: 'mindfulness-1',
      title: 'Daily Mindfulness Check-in',
      description: 'Take 5 minutes each day to notice your emotions without judgment. Name what you\'re feeling and where you feel it in your body.',
      type: 'exercise',
      priority: 'medium',
      icon: <Heart className="w-5 h-5" />,
    });
  }

  // Journal prompt recommendation
  recommendations.push({
    id: 'reflect-1',
    title: 'Weekly Reflection Prompt',
    description: 'What patterns did you notice this week? What triggered your strongest emotions? What coping strategies worked?',
    type: 'journal_prompt',
    priority: 'medium',
    icon: <BookOpen className="w-5 h-5" />,
    action: {
      label: 'Start journaling',
      link: '/journal',
    },
  });

  // Sort by priority
  const sortedRecommendations = recommendations.sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'border-red-500 bg-red-50';
      case 'medium':
        return 'border-amber-500 bg-amber-50';
      case 'low':
        return 'border-blue-500 bg-blue-50';
      default:
        return 'border-gray-500 bg-gray-50';
    }
  };

  const getPriorityBadgeColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-700 border-red-300';
      case 'medium':
        return 'bg-amber-100 text-amber-700 border-amber-300';
      case 'low':
        return 'bg-blue-100 text-blue-700 border-blue-300';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'technique':
        return <Brain className="w-4 h-4" />;
      case 'exercise':
        return <Heart className="w-4 h-4" />;
      case 'journal_prompt':
        return <BookOpen className="w-4 h-4" />;
      case 'root_cause':
        return <Target className="w-4 h-4" />;
      case 'reflection':
        return <Lightbulb className="w-4 h-4" />;
      default:
        return <CheckCircle2 className="w-4 h-4" />;
    }
  };

  if (sortedRecommendations.length === 0) {
    return null;
  }

  return (
    <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl">
          <Lightbulb className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Recommended Actions</h2>
          <p className="text-sm text-gray-600">Personalized suggestions based on your patterns</p>
        </div>
      </div>

      <div className="space-y-4">
        {sortedRecommendations.map((rec) => (
          <div
            key={rec.id}
            className={`border-l-4 rounded-lg p-5 transition-all hover:shadow-md ${getPriorityColor(rec.priority)}`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${rec.priority === 'high' ? 'bg-red-100 text-red-600' : rec.priority === 'medium' ? 'bg-amber-100 text-amber-600' : 'bg-blue-100 text-blue-600'}`}>
                  {rec.icon}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{rec.title}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${getPriorityBadgeColor(rec.priority)}`}>
                      {rec.priority.toUpperCase()}
                    </span>
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      {getTypeIcon(rec.type)}
                      {rec.type.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <p className="text-gray-700 mb-4 ml-12">{rec.description}</p>

            {rec.action && (
              <div className="ml-12">
                {rec.action.link ? (
                  <Link
                    to={rec.action.link}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-white border-2 border-gray-300 text-gray-700 rounded-lg hover:border-gray-400 hover:bg-gray-50 transition-all font-medium text-sm"
                  >
                    {rec.action.label}
                    <span>→</span>
                  </Link>
                ) : (
                  <button className="inline-flex items-center gap-2 px-4 py-2 bg-white border-2 border-gray-300 text-gray-700 rounded-lg hover:border-gray-400 hover:bg-gray-50 transition-all font-medium text-sm">
                    {rec.action.label}
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="flex items-start gap-3 bg-blue-50 rounded-lg p-4 border border-blue-200">
          <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-900">
            <p className="font-semibold mb-1">Take it one step at a time</p>
            <p>You don't need to do everything at once. Pick one recommendation that resonates with you and try it this week.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

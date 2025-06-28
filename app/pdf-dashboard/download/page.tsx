'use client';
import { useState } from 'react';
import Link from 'next/link';
import { FitnessReportData } from '@/lib/report-converter';

// Sample data matching the user's JSON format
const sampleFallbackData: FitnessReportData = {
  page1: { name: "Kavya Jain" },
  page3: {
    name: "Kavya Jaisvfsaasfasfs afsa fas gas gsg s dgsdgwn",
    age: 19,
    height: 100,
    weight: 67,
    gender: "MALE",
    why_you_move: "To stay healthy and active",
    fitness_goal: "Improve overall fitness",
    pre_workout_feeling: "neutral",
    post_workout_feeling: "Satisfied – solid effort, no regrets",
    effort_level: "5/10"
  },
  page5: {
    knee_flexion: {
      "Rep Count": 2,
      "Total Duration": 28,
      "Max Knee Flexion Left": 106.41,
      "Max Knee Flexion Right": 148.63,
      "Max Knee Extension Left": 107.07,
      "Max Knee Extension Right": 148.83
    },
    knee_to_wall: {
      "Total Time": 18,
      "Max Knee Flexion Left": 109.35,
      "Max Knee Flexion Right": 147.89
    },
    lunge_stretch: {
      "Max Rep Count": 2,
      "Average Hip Flexion Angle": 73.92,
      "Average Knee Flexion Angle Left": 106.08771428571424,
      "Average Knee Flexion Angle Right": 146.676,
      "Hold Duration Left (s)": 7,
      "Hold Duration Right (s)": 4
    },
    summary: [
      {
        title: "Built for Flow",
        paragraph: "Your mobility is elite—use it. Try animal flow, dynamic yoga, or obstacle-based drills to challenge coordination, build control, and push creative movement."
      },
      {
        title: "Dynamic by Design",
        paragraph: "Your movement profile favors speed and responsiveness. Add plyometrics, reactive footwork, and multidirectional drills to maximize your natural agility."
      },
      {
        title: "Stable Under Load",
        paragraph: "You move well—but can you hold tension? Explore static holds, deep lunge isometrics, and tempo squats to fuse mobility with raw control."
      }
    ]
  },
  page6: {
    squats: {
      "Rep Count": 14,
      "Left Knee Flexion Avg": 111.19,
      "Right Knee Flexion Avg": 148.28
    },
    lunges: {
      "Rep Count": 1,
      "Total Duration": "7s",
      "Average Knee Angle Left": 106.47285714285717,
      "Average Knee Angle Right": 146.61285714285714,
      "Average Hip Angle": 73.65285714285713
    },
    core: {
      "Average Hip Angle": 71.57,
      "Total Hold Duration": "7.0s"
    },
    summary: [
      {
        title: "Balance the Chain",
        paragraph: "Your single-leg strength shows gaps. Improve through split squats, step-downs, and balance work to prevent compensation and improve symmetry."
      },
      {
        title: "Core Needs Work",
        paragraph: "Your core endurance is lagging. Focus on stability holds, RKC planks, and tempo-based core circuits. Build foundational tension before layering complexity."
      }
    ]
  },
  page7: {
    plank: {
      "Average Hip Angle": 71.57,
      "Total Hold Duration": "7.0s"
    },
    step_up: {
      duration: 0,
      rep_count: 0,
      rep_time: 0
    },
    sprint: {
      max_velocity: 0,
      deceleration: 0
    },
    summary: [
      {
        title: "Watch That Hip Drop",
        paragraph: "Pelvic instability during movement? That's a red flag. Weak glutes and abductors can derail your gait and load joints unevenly. Clamshells, band walks, and lateral steps can rebuild control."
      },
      {
        title: "Ease Knee Stress",
        paragraph: "Anterior knee strain is creeping in. Address quad dominance with glute activation and hamstring work. Shift your form to distribute load and reduce joint pressure."
      }
    ]
  },
  page9: {
    scores: {
      endurance: 5,
      strength: 7,
      mobility: 3
    }
  },
  page10: {
    strengths: [
      {
        title: "Built for Flow",
        paragraph: "Your mobility is elite—use it. Try animal flow, dynamic yoga, or obstacle-based drills to challenge coordination, build control, and push creative movement."
      }
    ],
    improvements: [
      {
        title: "Balance the Chain",
        paragraph: "Your single-leg strength shows gaps. Improve through split squats, step-downs, and balance work to prevent compensation and improve symmetry."
      }
    ],
    risks: [
      {
        title: "Watch That Hip Drop",
        paragraph: "Pelvic instability during movement? That's a red flag. Weak glutes and abductors can derail your gait and load joints unevenly. Clamshells, band walks, and lateral steps can rebuild control."
      }
    ]
  },
  page11: {
    metrics: [
      { name: "Lunge reps", current_score: "20", target_score: "25", unit: "score" },
      { name: "Squats reps", current_score: "23", target_score: "28", unit: "score" },
      { name: "Plank hold", current_score: "6", target_score: "10", unit: "score" }
    ]
  },
  page12: {
    report_id: "NT-NT-0007"
  }
};

const FIXED_DATE = '2025-06-14T10:30:00.000Z';

export default function DownloadPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const download = async () => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const res = await fetch('/api/generate-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: sampleFallbackData }),
      });
      if (!res.ok) throw new Error(`Status ${res.status}`);

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'fitness-report.pdf';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-8 gap-6">
      <h1 className="text-3xl font-bold">Download PDF</h1>

      <button
        onClick={download}
        disabled={loading}
        className={`px-6 py-3 rounded ${
          loading
            ? 'bg-gray-400 text-gray-700 cursor-not-allowed'
            : 'bg-green-600 text-white hover:bg-green-700'
        }`}
      >
        {loading ? 'Generating…' : 'Download Fitness Report'}
      </button>

      {error && <p className="text-red-600">Error: {error}</p>}
      {success && <p className="text-green-600">Download started!</p>}

      <Link href="/pdf-dashboard" className="mt-4 text-blue-600 hover:underline">
        ← Back to Dashboard
      </Link>
    </div>
  );
}

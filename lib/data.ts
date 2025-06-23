export interface ExerciseData {
  lastUpdated: string
  chartData: {
    progress: {
      date: string
      value: number
    }[]
    comparison: {
      date: string
      current: number
      target: number
    }[]
    distribution: {
      name: string
      value: number
    }[]
  }
  metrics: {
    name: string
    value: number
    unit: string
    change: number
  }[]
  summary: string
  doctorNotes?: string
}

export const exerciseData: Record<string, ExerciseData> = {
  knee_flexion: {
    lastUpdated: "June 12, 2025",
    chartData: {
      progress: [
        { date: "Week 1", value: 30 },
        { date: "Week 2", value: 45 },
        { date: "Week 3", value: 60 },
        { date: "Week 4", value: 75 },
        { date: "Week 5", value: 85 },
        { date: "Week 6", value: 90 },
      ],
      comparison: [
        { date: "Week 1", current: 30, target: 40 },
        { date: "Week 2", current: 45, target: 50 },
        { date: "Week 3", current: 60, target: 60 },
        { date: "Week 4", current: 75, target: 70 },
        { date: "Week 5", current: 85, target: 80 },
        { date: "Week 6", current: 90, target: 90 },
      ],
      distribution: [
        { name: "0-30°", value: 5 },
        { name: "30-60°", value: 15 },
        { name: "60-90°", value: 35 },
        { name: "90-120°", value: 30 },
        { name: "120-150°", value: 15 },
      ],
    },
    metrics: [
      { name: "Average Flexion", value: 85, unit: "degrees", change: 12 },
      { name: "Max Flexion", value: 110, unit: "degrees", change: 15 },
      { name: "Pain Level", value: 2, unit: "out of 10", change: -30 },
      { name: "Consistency", value: 85, unit: "%", change: 5 },
      { name: "Progress Rate", value: 7.5, unit: "degrees/week", change: 0 },
    ],
    summary:
      "Patient has shown significant improvement in knee flexion over the 6-week period. Starting at 30 degrees in Week 1, they have progressed to 90 degrees by Week 6, exceeding the target goal. Pain levels have decreased from 5/10 to 2/10. The patient has been consistent with their exercises, completing 85% of prescribed sessions. The most significant gains were observed between Weeks 2-4.",
    doctorNotes:
      "Patient is responding well to therapy. Consider increasing resistance exercises in the next phase. Monitor for any signs of inflammation after sessions.",
  },
  knee_to_wall: {
    lastUpdated: "June 10, 2025",
    chartData: {
      progress: [
        { date: "Week 1", value: 3 },
        { date: "Week 2", value: 5 },
        { date: "Week 3", value: 7 },
        { date: "Week 4", value: 8 },
        { date: "Week 5", value: 10 },
        { date: "Week 6", value: 12 },
      ],
      comparison: [
        { date: "Week 1", current: 3, target: 5 },
        { date: "Week 2", current: 5, target: 7 },
        { date: "Week 3", current: 7, target: 9 },
        { date: "Week 4", current: 8, target: 10 },
        { date: "Week 5", current: 10, target: 11 },
        { date: "Week 6", current: 12, target: 12 },
      ],
      distribution: [
        { name: "0-3cm", value: 10 },
        { name: "3-6cm", value: 20 },
        { name: "6-9cm", value: 35 },
        { name: "9-12cm", value: 25 },
        { name: "12+cm", value: 10 },
      ],
    },
    metrics: [
      { name: "Average Distance", value: 7.5, unit: "cm", change: 25 },
      { name: "Max Distance", value: 12, unit: "cm", change: 20 },
      { name: "Pain Level", value: 3, unit: "out of 10", change: -25 },
      { name: "Consistency", value: 90, unit: "%", change: 10 },
      { name: "Progress Rate", value: 1.5, unit: "cm/week", change: 5 },
    ],
    summary:
      "Patient has demonstrated steady improvement in the knee-to-wall exercise, progressing from 3cm in Week 1 to 12cm by Week 6. They have met the target goal by the end of the 6-week period. Pain levels have decreased from 4/10 to 3/10. The patient has been very consistent with their exercises, completing 90% of prescribed sessions. The most significant gains were observed between Weeks 1-3.",
  },
  lunge_stretch: {
    lastUpdated: "June 8, 2025",
    chartData: {
      progress: [
        { date: "Week 1", value: 20 },
        { date: "Week 2", value: 30 },
        { date: "Week 3", value: 40 },
        { date: "Week 4", value: 45 },
        { date: "Week 5", value: 50 },
        { date: "Week 6", value: 55 },
      ],
      comparison: [
        { date: "Week 1", current: 20, target: 25 },
        { date: "Week 2", current: 30, target: 35 },
        { date: "Week 3", current: 40, target: 40 },
        { date: "Week 4", current: 45, target: 45 },
        { date: "Week 5", current: 50, target: 50 },
        { date: "Week 6", current: 55, target: 55 },
      ],
      distribution: [
        { name: "0-20cm", value: 5 },
        { name: "20-30cm", value: 15 },
        { name: "30-40cm", value: 30 },
        { name: "40-50cm", value: 35 },
        { name: "50+cm", value: 15 },
      ],
    },
    metrics: [
      { name: "Average Depth", value: 40, unit: "cm", change: 33 },
      { name: "Max Depth", value: 55, unit: "cm", change: 22 },
      { name: "Pain Level", value: 2, unit: "out of 10", change: -50 },
      { name: "Consistency", value: 80, unit: "%", change: 0 },
      { name: "Progress Rate", value: 5.8, unit: "cm/week", change: -5 },
    ],
    summary:
      "Patient has shown consistent improvement in lunge stretch depth, progressing from 20cm in Week 1 to 55cm by Week 6. They have met all weekly targets throughout the program. Pain levels have significantly decreased from 4/10 to 2/10. The patient has maintained good consistency with their exercises, completing 80% of prescribed sessions. The most significant gains were observed between Weeks 1-3, with a slight plateau in Weeks 4-5.",
  },
  lunges: {
    lastUpdated: "June 11, 2025",
    chartData: {
      progress: [
        { date: "Week 1", value: 5 },
        { date: "Week 2", value: 8 },
        { date: "Week 3", value: 12 },
        { date: "Week 4", value: 15 },
        { date: "Week 5", value: 18 },
        { date: "Week 6", value: 20 },
      ],
      comparison: [
        { date: "Week 1", current: 5, target: 5 },
        { date: "Week 2", current: 8, target: 10 },
        { date: "Week 3", current: 12, target: 12 },
        { date: "Week 4", current: 15, target: 15 },
        { date: "Week 5", current: 18, target: 18 },
        { date: "Week 6", current: 20, target: 20 },
      ],
      distribution: [
        { name: "0-5", value: 10 },
        { name: "5-10", value: 20 },
        { name: "10-15", value: 35 },
        { name: "15-20", value: 30 },
        { name: "20+", value: 5 },
      ],
    },
    metrics: [
      { name: "Average Reps", value: 13, unit: "reps", change: 30 },
      { name: "Max Reps", value: 20, unit: "reps", change: 33 },
      { name: "Pain Level", value: 3, unit: "out of 10", change: -25 },
      { name: "Consistency", value: 85, unit: "%", change: 5 },
      { name: "Progress Rate", value: 2.5, unit: "reps/week", change: -10 },
    ],
    summary:
      "Patient has demonstrated excellent progress in lunge repetitions, increasing from 5 reps in Week 1 to 20 reps by Week 6. They have consistently met the weekly targets throughout the program. Pain levels have decreased from 4/10 to 3/10. The patient has maintained good consistency with their exercises, completing 85% of prescribed sessions. The most significant gains were observed between Weeks 2-4.",
  },
  plank_hold: {
    lastUpdated: "June 9, 2025",
    chartData: {
      progress: [
        { date: "Week 1", value: 15 },
        { date: "Week 2", value: 30 },
        { date: "Week 3", value: 45 },
        { date: "Week 4", value: 60 },
        { date: "Week 5", value: 75 },
        { date: "Week 6", value: 90 },
      ],
      comparison: [
        { date: "Week 1", current: 15, target: 20 },
        { date: "Week 2", current: 30, target: 30 },
        { date: "Week 3", current: 45, target: 45 },
        { date: "Week 4", current: 60, target: 60 },
        { date: "Week 5", current: 75, target: 75 },
        { date: "Week 6", current: 90, target: 90 },
      ],
      distribution: [
        { name: "0-20s", value: 5 },
        { name: "20-40s", value: 15 },
        { name: "40-60s", value: 30 },
        { name: "60-80s", value: 35 },
        { name: "80+s", value: 15 },
      ],
    },
    metrics: [
      { name: "Average Duration", value: 52.5, unit: "seconds", change: 40 },
      { name: "Max Duration", value: 90, unit: "seconds", change: 50 },
      { name: "Form Quality", value: 8, unit: "out of 10", change: 33 },
      { name: "Consistency", value: 90, unit: "%", change: 12 },
      { name: "Progress Rate", value: 12.5, unit: "sec/week", change: 0 },
    ],
    summary:
      "Patient has shown remarkable improvement in plank hold duration, progressing from 15 seconds in Week 1 to 90 seconds by Week 6. They have met all weekly targets after the initial week. Form quality has improved from 6/10 to 8/10. The patient has been very consistent with their exercises, completing 90% of prescribed sessions. The progress has been steady throughout the 6-week period with consistent gains each week.",
  },
  stepUp: {
    lastUpdated: "June 7, 2025",
    chartData: {
      progress: [
        { date: "Week 1", value: 10 },
        { date: "Week 2", value: 15 },
        { date: "Week 3", value: 20 },
        { date: "Week 4", value: 25 },
        { date: "Week 5", value: 30 },
        { date: "Week 6", value: 35 },
      ],
      comparison: [
        { date: "Week 1", current: 10, target: 10 },
        { date: "Week 2", current: 15, target: 15 },
        { date: "Week 3", current: 20, target: 20 },
        { date: "Week 4", current: 25, target: 25 },
        { date: "Week 5", current: 30, target: 30 },
        { date: "Week 6", current: 35, target: 35 },
      ],
      distribution: [
        { name: "0-10m", value: 5 },
        { name: "10-20m", value: 20 },
        { name: "20-30m", value: 45 },
        { name: "30-40m", value: 25 },
        { name: "40+m", value: 5 },
      ],
    },
    metrics: [
      { name: "Average Distance", value: 22.5, unit: "meters", change: 50 },
      { name: "Max Distance", value: 35, unit: "meters", change: 40 },
      { name: "Speed", value: 4.5, unit: "m/s", change: 25 },
      { name: "Consistency", value: 75, unit: "%", change: -5 },
      { name: "Progress Rate", value: 4.2, unit: "m/week", change: -8 },
    ],
    summary:
      "Patient has demonstrated steady improvement in sprint distance, increasing from 10 meters in Week 1 to 35 meters by Week 6. They have consistently met all weekly targets. Sprint speed has improved from 3.6 m/s to 4.5 m/s. The patient's consistency has been moderate, completing 75% of prescribed sessions. The progress has been linear throughout the 6-week period with consistent gains each week.",
  },
  squats: {
    lastUpdated: "June 13, 2025",
    chartData: {
      progress: [
        { date: "Week 1", value: 8 },
        { date: "Week 2", value: 12 },
        { date: "Week 3", value: 15 },
        { date: "Week 4", value: 20 },
        { date: "Week 5", value: 25 },
        { date: "Week 6", value: 30 },
      ],
      comparison: [
        { date: "Week 1", current: 8, target: 10 },
        { date: "Week 2", current: 12, target: 15 },
        { date: "Week 3", current: 15, target: 18 },
        { date: "Week 4", current: 20, target: 20 },
        { date: "Week 5", current: 25, target: 25 },
        { date: "Week 6", current: 30, target: 30 },
      ],
      distribution: [
        { name: "0-10", value: 15 },
        { name: "10-15", value: 20 },
        { name: "15-20", value: 30 },
        { name: "20-25", value: 25 },
        { name: "25+", value: 10 },
      ],
    },
    metrics: [
      { name: "Average Reps", value: 18.3, unit: "reps", change: 35 },
      { name: "Max Reps", value: 30, unit: "reps", change: 50 },
      { name: "Form Quality", value: 7, unit: "out of 10", change: 40 },
      { name: "Consistency", value: 85, unit: "%", change: 10 },
      { name: "Progress Rate", value: 3.7, unit: "reps/week", change: -5 },
    ],
    summary:
      "Patient has shown significant improvement in squat repetitions, progressing from 8 reps in Week 1 to 30 reps by Week 6. They initially struggled to meet targets in the first two weeks but caught up and met all targets from Week 4 onwards. Form quality has improved from 5/10 to 7/10. The patient has maintained good consistency with their exercises, completing 85% of prescribed sessions. The most significant gains were observed between Weeks 3-5.",
    doctorNotes:
      "Patient shows good progress but needs to focus more on proper form. Consider adding resistance bands in future sessions to improve muscle activation patterns.",
  },
}

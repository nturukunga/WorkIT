"use client";
import { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

type ExerciseState = Record<number, Record<number, Record<number, boolean>>>;
type Group = { name: string; time: string; exercises: string[] };
type Day = { day: string; groups: Group[] };

const WEEKLY_ROUTINE = [
  {
    day: "Monday",
    groups: [
      {
        name: "Chest",
        time: "7 PM - 8:30 PM",
        exercises: [
          "Bench Press",
          "Incline Dumbbell Press",
          "Cable Fly",
          "Push-Ups (Burnout)",
        ],
      },
      {
        name: "Triceps",
        time: "8:30 PM - 10 PM",
        exercises: [
          "Tricep Dips",
          "Rope Pushdowns",
          "Skull Crushers",
        ],
      },
    ],
  },
  {
    day: "Tuesday",
    groups: [
      {
        name: "Back",
        time: "7 PM - 8:30 PM",
        exercises: [
          "Deadlift",
          "Pull-Ups",
          "Bent-Over Rows",
          "T-Bar Rows",
        ],
      },
      {
        name: "Biceps",
        time: "8:30 PM - 10 PM",
        exercises: [
          "Barbell Curls",
          "Concentration Curls",
          "Hammer Curls",
        ],
      },
    ],
  },
  {
    day: "Wednesday",
    groups: [
      {
        name: "Biceps Focus",
        time: "7 PM - 8:30 PM",
        exercises: [
          "Preacher Curls",
          "Incline Dumbbell Curls",
          "Cable Bicep Curls",
        ],
      },
      {
        name: "Triceps Focus",
        time: "8:30 PM - 10 PM",
        exercises: [
          "Overhead Dumbbell Extensions",
          "Close-Grip Bench Press",
          "Rope Kickbacks",
        ],
      },
    ],
  },
  {
    day: "Thursday",
    groups: [
      {
        name: "Shoulders",
        time: "7 PM - 8:30 PM",
        exercises: [
          "Overhead Press (Barbell or Dumbbell)",
          "Arnold Press",
          "Lateral Raises",
          "Face Pulls",
        ],
      },
      {
        name: "Core",
        time: "8:30 PM - 10 PM",
        exercises: [
          "Plank Variations",
          "Hanging Leg Raises",
          "Russian Twists",
          "Cable Woodchoppers",
        ],
      },
    ],
  },
  {
    day: "Friday",
    groups: [],
  },
  {
    day: "Saturday",
    groups: [
      {
        name: "Legs",
        time: "7 PM - 8:30 PM",
        exercises: [
          "Squats",
          "Romanian Deadlifts",
          "Leg Press",
          "Walking Lunges",
        ],
      },
      {
        name: "Cardio/Conditioning",
        time: "8:30 PM - 10 PM",
        exercises: [
          "Stairmaster (10-15 minutes)",
          "Sled Pushes (if available)",
          "HIIT Treadmill Runs or Rowing",
        ],
      },
    ],
  },
  {
    day: "Sunday",
    groups: [],
  },
];

function getTodayWorkoutIndex() {
  const jsDay = new Date().getDay(); 
  if (jsDay === 0) return 6; 
  if (jsDay === 6) return 5; 
  return jsDay - 1;
}

function getInitialState() {
  if (typeof window === "undefined") return {};
  const data = localStorage.getItem("workout-tracker-state");
  return data ? JSON.parse(data) : {};
}

const MOTIVATION = [
  "Grind Mode 🤘🏽, No pain no gain‼️",
  "Back to the grind! Keep pulling!",
  "Arms of steel! Pump it up!",
  "Shoulders strong, core tight!",
  "Leg day legend! Keep moving!",
  "Rest and recover!",
  "Rest and recover!"
];

function getHistory() {
  if (typeof window === "undefined") return [];
  const data = localStorage.getItem("workout-tracker-history");
  return data ? JSON.parse(data) : [];
}

function archiveWeek(weekState: any) {
  const history = getHistory();
  const weekSummary = {
    weekStart: new Date().toISOString(),
    state: weekState,
  };
  history.push(weekSummary);
  localStorage.setItem("workout-tracker-history", JSON.stringify(history));
}

function getMonthlyGraphData() {
  const history = getHistory();
  const now = new Date();
  const thisMonth = now.getMonth();
  const thisYear = now.getFullYear();
  const days = WEEKLY_ROUTINE.map(d => d.day);
  const weekLabels: string[] = [];
  const weekData: Record<string, any>[] = days.map(day => ({ name: day }));
  let weekNum = 1;
  history.forEach((week: any, idx: number) => {
    const weekDate = new Date(week.weekStart);
    if (weekDate.getMonth() === thisMonth && weekDate.getFullYear() === thisYear) {
      weekLabels.push(`Week ${weekNum}`);
      days.forEach((day, dIdx) => {
        let done = 0;
        const groups = WEEKLY_ROUTINE[dIdx].groups;
        groups.forEach((g, gIdx) => {
          g.exercises.forEach((_: string, eIdx: number) => {
            if (week.state[dIdx]?.[gIdx]?.[eIdx]) done++;
          });
        });
        weekData[dIdx][`Week ${weekNum}`] = done;
      });
      weekNum++;
    }
  });
  return { data: weekData, weekLabels };
}

export default function Home() {
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [state, setState] = useState<ExerciseState>({});
  const [toast, setToast] = useState<string | null>(null);
  const [showWeekComplete, setShowWeekComplete] = useState(false);
  const [clientReady, setClientReady] = useState(false);

  useEffect(() => {
    setSelectedDay(getTodayWorkoutIndex());
    setState(getInitialState());
    setClientReady(true);
  }, []);

  useEffect(() => {
    if (selectedDay !== null && clientReady) {
      localStorage.setItem("workout-tracker-state", JSON.stringify(state));
    }
  }, [state, selectedDay, clientReady]);

  const dayData = clientReady && selectedDay !== null ? WEEKLY_ROUTINE[selectedDay] : null;
  const isRestDay = dayData ? !dayData.groups.length : false;
  const totalExercises = dayData ? dayData.groups.reduce((acc: number, g: Group) => acc + g.exercises.length, 0) : 0;
  const doneExercises = dayData
    ? dayData.groups.reduce(
        (acc: number, g: Group, gIdx: number) => acc + g.exercises.filter((_: string, eIdx: number) => state[selectedDay!]?.[gIdx]?.[eIdx]).length,
        0
      )
    : 0;
  const progress = totalExercises ? Math.round((doneExercises / totalExercises) * 100) : 0;

  useEffect(() => {
    if (
      selectedDay !== null &&
      clientReady &&
      dayData &&
      totalExercises > 0 &&
      doneExercises === totalExercises
    ) {
      setToast(MOTIVATION[selectedDay]);
      const t = setTimeout(() => setToast(null), 3500);
      return () => clearTimeout(t);
    }
  }, [doneExercises, totalExercises, selectedDay, clientReady, dayData]);

  useEffect(() => {
    if (selectedDay === null || !clientReady) return;
    const workoutDays = WEEKLY_ROUTINE.filter((d: Day) => d.groups.length);
    const allDone = workoutDays.every((_, dIdx: number) => {
      const dayIdx = WEEKLY_ROUTINE.findIndex((wd: Day) => wd.day === workoutDays[dIdx].day);
      const groups = WEEKLY_ROUTINE[dayIdx].groups;
      return groups.every((g: Group, gIdx: number) =>
        g.exercises.every((_: string, eIdx: number) => state[dayIdx]?.[gIdx]?.[eIdx])
      );
    });
    if (allDone && !showWeekComplete) {
      setToast("HULK SMASH");
      setShowWeekComplete(true);
    }
  }, [state, selectedDay, showWeekComplete, clientReady]);

  useEffect(() => {
    if (showWeekComplete) {
      const t = setTimeout(() => {
        if (window.confirm("You completed the week! Start a new week?")) {
          archiveWeek(state);
          setState({});
          setShowWeekComplete(false);
        }
      }, 4200);
      return () => clearTimeout(t);
    }
  }, [showWeekComplete, state]);

  // Only after all hooks, do an early return for loading
  if (!clientReady || selectedDay === null || !dayData) {
    return <div className="min-h-screen flex items-center justify-center text-xl text-orange-400 bg-black">Loading...</div>;
  }

  const handleToggle = (groupIdx: number, exIdx: number) => {
    setState((prev: ExerciseState) => {
      const newState = { ...prev };
      newState[selectedDay!] = { ...(newState[selectedDay!] || {}) };
      newState[selectedDay!][groupIdx] = { ...(newState[selectedDay!][groupIdx] || {}) };
      newState[selectedDay!][groupIdx][exIdx] = !newState[selectedDay!][groupIdx][exIdx];
      return newState;
    });
  };

  const stats = WEEKLY_ROUTINE.map((day: Day, dIdx: number) => {
    if (!day.groups.length) return null;
    let done = 0, total = 0;
    day.groups.forEach((g: Group, gIdx: number) => {
      g.exercises.forEach((_: string, eIdx: number) => {
        total++;
        if (state[dIdx]?.[gIdx]?.[eIdx]) done++;
      });
    });
    return { day: day.day, done, total };
  }).filter(Boolean);

  const { data: graphData, weekLabels } = getMonthlyGraphData();

  return (
    <div className="min-h-screen bg-black flex flex-col items-center py-8 px-2">
      {/* Toast */}
      {toast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-orange-500 text-black px-6 py-3 rounded-xl shadow-lg font-bold text-lg animate-bounce border-2 border-orange-400 backdrop-blur-md">
          {toast}
        </div>
      )}
      <h1 className="text-4xl font-bold mb-2 text-orange-400 drop-shadow-[0_0_10px_rgba(255,115,0,0.8)]">Weekly Tracking</h1>
      <div className="flex gap-2 mb-8 mt-2">
        {WEEKLY_ROUTINE.map((d, idx) => (
          <button
            key={d.day}
            className={`px-3 py-1 rounded-full text-sm font-semibold transition-all border-2 backdrop-blur-md bg-black/60 border-orange-400 shadow-[0_2px_10px_rgba(255,115,0,0.2)] ${selectedDay === idx ? "bg-orange-500 text-black border-orange-400" : "text-orange-400 hover:bg-orange-900/40"} ${!d.groups.length ? "opacity-40 cursor-not-allowed" : ""}`}
            onClick={() => d.groups.length && setSelectedDay(idx)}
            disabled={!d.groups.length}
          >
            {d.day}
          </button>
        ))}
      </div>
      <div className="w-full max-w-2xl rounded-2xl shadow-lg p-6 mb-8 backdrop-blur-md bg-black/60 border border-orange-400">
        <h2 className="text-2xl font-semibold mb-2 text-orange-300">{dayData.day}</h2>
        {isRestDay ? (
          <div className="text-lg text-orange-200 py-12 text-center">Rest Day! 💤</div>
        ) : (
          dayData.groups.map((group, gIdx) => (
            <div key={group.name} className="mb-6">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg font-bold text-orange-400">{group.name}</span>
                <span className="text-xs text-orange-200">{group.time}</span>
              </div>
              <ul className="space-y-2">
                {group.exercises.map((ex, eIdx) => (
                  <li key={ex} className="flex items-center gap-3 p-2 rounded-lg bg-orange-900/30 backdrop-blur-sm">
                    <input
                      type="checkbox"
                      checked={!!state[selectedDay!]?.[gIdx]?.[eIdx]}
                      onChange={() => handleToggle(gIdx, eIdx)}
                      className="accent-orange-400 w-5 h-5"
                      id={`ex-${gIdx}-${eIdx}`}
                    />
                    <label htmlFor={`ex-${gIdx}-${eIdx}`} className="text-base cursor-pointer select-none text-orange-100">
                      {ex}
                    </label>
                  </li>
                ))}
              </ul>
            </div>
          ))
        )}
        {/* Progress Bar */}
        {!isRestDay && (
          <div className="mt-4 mb-2">
            <div className="w-full h-4 bg-orange-900/40 rounded-full overflow-hidden">
              <div
                className="h-full bg-orange-400 transition-all duration-500"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <div className="text-xs text-orange-200 mt-1 text-right">{progress}% complete</div>
          </div>
        )}
      </div>
      <div className="w-full max-w-2xl rounded-2xl shadow p-6 backdrop-blur-md bg-black/70 border border-orange-400">
        <h3 className="text-xl font-semibold mb-4 text-orange-400">Weekly Report</h3>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          {stats.map((s: any) => (
            <div key={s.day} className="flex flex-col items-center">
              <span className="font-bold text-orange-300">{s.day}</span>
              <span className="text-lg font-mono mt-1 text-orange-100">
                {s.done} / {s.total}
              </span>
              <span className="text-xs text-orange-400">{s.total === 0 ? "Rest" : s.done === s.total ? "Done!" : "In Progress"}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="w-full max-w-2xl rounded-2xl shadow p-6 mt-8 backdrop-blur-md bg-black/80 border border-orange-400">
        <h3 className="text-xl font-semibold mb-4 text-orange-400">Monthly Training Trends</h3>
        {graphData.length > 0 && weekLabels.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={graphData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ff7300" opacity={0.2} />
              <XAxis dataKey="name" stroke="#ff7300" tick={{ fill: '#ff7300', fontWeight: 'bold' }} />
              <YAxis stroke="#ff7300" tick={{ fill: '#ff7300' }} allowDecimals={false} />
              <Tooltip contentStyle={{ background: '#1a1a1a', border: '1px solid #ff7300', color: '#ff7300' }} labelStyle={{ color: '#ff7300' }} />
              <Legend wrapperStyle={{ color: '#ff7300' }} />
              {weekLabels.map((w, idx) => (
                <Line key={w} type="monotone" dataKey={w} stroke="#ff7300" strokeWidth={2 + idx} dot={{ r: 4 + idx, fill: '#ff7300' }} />
              ))}
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="text-orange-200">No data yet. Complete a week to see your trends!</div>
        )}
      </div>
      <footer className="mt-10 text-orange-400 text-xs">&copy; {new Date().getFullYear()} Workout Tracker</footer>
    </div>
  );
}

import { useEffect, useMemo, useState } from "react";
import GameIcon from "../../../assets/images/game_icon.png";

type GameModeViewProps = {
  onBack: () => void;
};

const missions = [
  {
    title: "Token Tumble",
    text: "Sort tokens into the right lexical category before the timer expires.",
  },
  {
    title: "AST Builder",
    text: "Assemble syntax trees like a puzzle to help the cat compile a bedtime story.",
  },
  {
    title: "Pipeline Rush",
    text: "Fix missing compiler stages so the output lights blink in the right order.",
  },
];

type Bucket = "DATATYPE" | "KEYWORD" | "IDENTIFIER" | "LITERAL" | "OPERATOR" | "DELIMITER";

type TokenChallenge = {
  token: string;
  bucket: Bucket;
  clue: string;
};

const tokenChallenges: TokenChallenge[] = [
  { token: "whole", bucket: "DATATYPE", clue: "Used to declare numeric variables." },
  { token: "decimal", bucket: "DATATYPE", clue: "Floating-point data type keyword." },
  { token: "text", bucket: "DATATYPE", clue: "String data type keyword." },
  { token: "logic", bucket: "DATATYPE", clue: "Boolean data type keyword." },
  { token: "if", bucket: "KEYWORD", clue: "Starts a conditional branch." },
  { token: "while", bucket: "KEYWORD", clue: "Begins a loop." },
  { token: "show", bucket: "KEYWORD", clue: "Outputs a value." },
  { token: "playerScore", bucket: "IDENTIFIER", clue: "Valid user-defined variable name." },
  { token: "counter_1", bucket: "IDENTIFIER", clue: "Variable with underscore and number." },
  { token: "10", bucket: "LITERAL", clue: "Numeric constant." },
  { token: "\"Pixel\"", bucket: "LITERAL", clue: "String constant." },
  { token: "true", bucket: "LITERAL", clue: "Boolean constant value." },
  { token: "is", bucket: "OPERATOR", clue: "PseudoScript assignment operator." },
  { token: "+", bucket: "OPERATOR", clue: "Arithmetic operator." },
  { token: ">=", bucket: "OPERATOR", clue: "Comparison operator." },
  { token: ".", bucket: "DELIMITER", clue: "Ends a statement." },
  { token: ":", bucket: "DELIMITER", clue: "Used for block headers." },
  { token: ",", bucket: "DELIMITER", clue: "Separates items in a sequence." },
];

const buckets: Bucket[] = ["DATATYPE", "KEYWORD", "IDENTIFIER", "LITERAL", "OPERATOR", "DELIMITER"];

const GAME_DURATION_SECONDS = 60;
const STARTING_LIVES = 3;

const GameModeView = ({ onBack }: GameModeViewProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(GAME_DURATION_SECONDS);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [lives, setLives] = useState(STARTING_LIVES);
  const [feedback, setFeedback] = useState("Sort each token into the correct bucket to build streaks.");
  const [roundIndex, setRoundIndex] = useState(0);

  const deck = useMemo(() => {
    const shuffled = [...tokenChallenges];
    for (let i = shuffled.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }, [isPlaying]);

  const currentChallenge = deck[roundIndex] ?? null;
  const gameEnded = isPlaying && (secondsLeft === 0 || lives === 0 || roundIndex >= deck.length);

  useEffect(() => {
    if (!isPlaying || gameEnded) {
      return;
    }

    const timer = window.setInterval(() => {
      setSecondsLeft((prev) => Math.max(prev - 1, 0));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [isPlaying, gameEnded]);

  useEffect(() => {
    if (gameEnded) {
      setIsPlaying(false);
    }
  }, [gameEnded]);

  const startGame = () => {
    setIsPlaying(true);
    setSecondsLeft(GAME_DURATION_SECONDS);
    setScore(0);
    setStreak(0);
    setLives(STARTING_LIVES);
    setRoundIndex(0);
    setFeedback("Timer started. Lock in your first token.");
  };

  const handleBucketChoice = (selectedBucket: Bucket) => {
    if (!isPlaying || !currentChallenge) {
      return;
    }

    const isCorrect = selectedBucket === currentChallenge.bucket;

    if (isCorrect) {
      const nextStreak = streak + 1;
      const earned = 10 + Math.min(nextStreak * 2, 12);
      setStreak(nextStreak);
      setScore((prev) => prev + earned);
      setFeedback(`Correct! +${earned} points. ${currentChallenge.token} is ${currentChallenge.bucket}.`);
    } else {
      setLives((prev) => Math.max(prev - 1, 0));
      setStreak(0);
      setFeedback(`Miss. ${currentChallenge.token} belongs to ${currentChallenge.bucket}.`);
    }

    setRoundIndex((prev) => prev + 1);
  };

  const progress = Math.min((roundIndex / deck.length) * 100, 100);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#2a0f46_0%,#130825_45%,#070411_100%)] text-white px-4 py-8">
      <div className="mx-auto flex max-w-5xl flex-col gap-8">
        <header className="flex items-start justify-between gap-6">
          <div className="flex items-center gap-4">
            <img src={GameIcon} alt="Game mode" className="h-12 w-12" />
            <div>
              <p className="text-xs uppercase tracking-[0.5em] text-white/50">Playground</p>
              <h1 className="text-3xl font-display">Game Mode</h1>
              <p className="text-sm text-white/70">
                Train compiler instincts with Token Tumble while AST Builder and Pipeline Rush are in production.
              </p>
            </div>
          </div>
          <button
            onClick={onBack}
            className="text-xs uppercase tracking-[0.5em] text-white/50 hover:text-white transition"
          >
            ← desktop
          </button>
        </header>

        <section className="grid gap-4 md:grid-cols-3">
          {missions.map((mission, index) => {
            const active = index === 0;

            return (
              <article
                key={mission.title}
                className={`rounded-2xl border p-5 backdrop-blur ${
                  active ? "border-[#f8d296]/50 bg-[#ffdca51f]" : "border-white/10 bg-white/5"
                }`}
              >
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="text-lg font-semibold">{mission.title}</h2>
                  <span className="rounded-full border border-white/20 px-2 py-1 text-[10px] uppercase tracking-[0.2em] text-white/70">
                    {active ? "Live" : "Soon"}
                  </span>
                </div>
                <p className="text-sm text-white/70">{mission.text}</p>
              </article>
            );
          })}
        </section>

        <section className="rounded-3xl border border-[#f4d8ff2e] bg-[#120a24d9] p-5 shadow-[0_30px_60px_rgba(5,0,20,0.45)]">
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={startGame}
              className="rounded-xl bg-gradient-to-r from-[#f7c77c] to-[#f9a7a7] px-4 py-2 text-sm font-semibold text-[#291022] transition hover:brightness-105"
            >
              {gameEnded || !isPlaying ? "Start Token Tumble" : "Restart"}
            </button>
            <p className="text-xs uppercase tracking-[0.25em] text-white/60">60-second challenge</p>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
              <p className="text-xs uppercase tracking-[0.25em] text-white/50">Score</p>
              <p className="text-2xl font-display text-[#ffd99d]">{score}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
              <p className="text-xs uppercase tracking-[0.25em] text-white/50">Streak</p>
              <p className="text-2xl font-display text-[#ffc9f2]">{streak}x</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
              <p className="text-xs uppercase tracking-[0.25em] text-white/50">Lives</p>
              <p className="text-2xl font-display text-[#ffb6c8]">{"❤".repeat(Math.max(lives, 0)) || "0"}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
              <p className="text-xs uppercase tracking-[0.25em] text-white/50">Time</p>
              <p className="text-2xl font-display text-[#a9ebff]">{secondsLeft}s</p>
            </div>
          </div>

          <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#f7c77c] via-[#ff9fd8] to-[#81e5ff] transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="mt-6 rounded-2xl border border-white/10 bg-black/20 p-4">
            {!isPlaying && !gameEnded && (
              <p className="text-sm text-white/80">
                Press Start Token Tumble, then classify each token by tapping the correct lexical bucket.
              </p>
            )}

            {!isPlaying && gameEnded && (
              <div className="space-y-2 text-sm text-white/80">
                <p className="text-lg font-semibold text-[#ffd7ea]">Round Complete</p>
                <p>
                  Final score: <span className="font-semibold text-white">{score}</span> | Tokens solved: {roundIndex}
                </p>
                <p className="text-white/60">{secondsLeft === 0 ? "Time is up." : "All lives spent or deck completed."}</p>
              </div>
            )}

            {isPlaying && currentChallenge && (
              <div className="space-y-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-white/50">Current token</p>
                  <p className="mt-2 inline-flex rounded-xl border border-white/20 bg-[#ffffff14] px-4 py-2 font-mono text-xl text-[#ffe9b4]">
                    {currentChallenge.token}
                  </p>
                </div>
                <p className="text-sm text-white/70">Clue: {currentChallenge.clue}</p>

                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {buckets.map((bucket) => (
                    <button
                      key={bucket}
                      onClick={() => handleBucketChoice(bucket)}
                      className="rounded-xl border border-white/20 bg-white/5 px-4 py-3 text-left text-sm font-semibold tracking-wide text-white transition hover:border-[#ffd79f] hover:bg-[#ffe4b314]"
                    >
                      {bucket}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <p className="mt-4 text-sm text-white/70">{feedback}</p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default GameModeView;

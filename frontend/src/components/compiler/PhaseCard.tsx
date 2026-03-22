type PhaseCardProps = {
  title: string;
  emoji: string;
  description: string;
  status: string;
};

const PhaseCard = ({ title, emoji, description, status }: PhaseCardProps) => (
  <div className="rounded-2xl border border-white/30 bg-white/80 p-4 shadow-md">
    <div className="flex items-center gap-3">
      <span className="text-3xl" aria-hidden>
        {emoji}
      </span>
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-midnight/40">{title}</p>
        <p className="font-semibold text-midnight">{status}</p>
      </div>
    </div>
    <p className="mt-3 text-sm text-midnight/70">{description}</p>
  </div>
);

export default PhaseCard;

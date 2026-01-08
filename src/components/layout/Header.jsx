import { TrendingUp } from './icons';

export default function Header() {
  return (
    <header className="flex items-center gap-3">
      <div className="p-2.5 bg-surface-800/50 border border-white/10 rounded-xl shadow-lg shadow-black/20">
        <TrendingUp className="w-6 h-6 text-primary-400" />
      </div>
      <div>
        <h1 className="text-xl font-bold text-white tracking-tight">
          FinSim <span className="text-surface-500 font-normal">Pro</span>
        </h1>
      </div>
    </header>
  );
}

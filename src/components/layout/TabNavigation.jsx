export default function TabNavigation({ activeTab, onTabChange }) {
  const tabs = [
    { id: 'input', label: 'Input' },
    { id: 'analysis', label: 'Analysis' },
    { id: 'details', label: 'Details' },
    { id: 'goal', label: 'Goal Finder' },
  ];

  return (
    <nav className="inline-flex bg-surface-900/40 border border-white/5 rounded-xl p-1 gap-1">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`
            px-4 py-2 rounded-lg text-sm font-medium
            transition-all duration-300 ease-out
            ${activeTab === tab.id 
              ? 'bg-surface-800 text-white shadow-lg shadow-black/20' 
              : 'text-surface-400 hover:text-surface-200 hover:bg-surface-800/40'
            }
          `}
        >
          {tab.label}
        </button>
      ))}
    </nav>
  );
}

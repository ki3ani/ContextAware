interface AIModeBadgeProps {
  mode: 'local' | 'cloud';
}

function AIModeBadge({ mode }: AIModeBadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
        mode === 'local'
          ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300'
          : 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'
      }`}
    >
      <span>{mode === 'local' ? '⚡' : '☁️'}</span>
      {mode === 'local' ? 'Local' : 'Cloud'}
    </span>
  );
}

export default AIModeBadge;

import { DIFFICULTY_LABEL } from '@/lib/constants';

const styles = {
  EASY: 'bg-easy/12 text-easy',
  MEDIUM: 'bg-medium/12 text-medium',
  HARD: 'bg-hard/12 text-hard',
};

export default function DifficultyBadge({ difficulty }) {
  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-sm font-semibold ${styles[difficulty]}`}>
      {DIFFICULTY_LABEL[difficulty]}
    </span>
  );
}

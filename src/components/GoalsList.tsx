import { useGoals } from '@/hooks/useGoals';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const GoalsList = () => {
  const { goals, loading, addGoal, toggleGoal, deleteGoal } = useGoals();
  const [newGoal, setNewGoal] = useState('');

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newGoal.trim()) {
      await addGoal(newGoal);
      setNewGoal('');
    }
  };

  return (
    <div className="max-w-xl mx-auto my-8 p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Shared Goals & Bucket List</h2>
      <form onSubmit={handleAdd} className="flex gap-2 mb-4">
        <Input
          value={newGoal}
          onChange={e => setNewGoal(e.target.value)}
          placeholder="Add a new goal..."
        />
        <Button type="submit">Add</Button>
      </form>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <ul className="space-y-2">
          {goals.map(goal => (
            <li key={goal.id} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={goal.completed}
                onChange={() => toggleGoal(goal.id, !goal.completed)}
              />
              <span className={goal.completed ? 'line-through text-gray-400' : ''}>{goal.title}</span>
              <Button size="sm" variant="ghost" onClick={() => deleteGoal(goal.id)}>
                Delete
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default GoalsList;

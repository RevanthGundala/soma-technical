// import { Todo } from '@prisma/client';

// We define the Todo type manually to include relations for use in graph algorithms.
export interface Todo {
  id: number;
  title: string;
  createdAt: Date;
  dueDate: Date | null;
  imageUrl: string | null;
  dependencies: Todo[];
  dependencyFor: Todo[];
}

export function topologicalSort(todos: Todo[]): { sorted: Todo[], hasCycle: boolean } {
  const adjList: Map<number, number[]> = new Map();
  const inDegree = new Map<number, number>();
  const todoMap = new Map(todos.map(t => [t.id, t]));

  todos.forEach(todo => {
    adjList.set(todo.id, []);
    inDegree.set(todo.id, 0);
  });

  todos.forEach(todo => {
    (todo.dependencies || []).forEach(dep => {
      // Edge from dep -> todo
      adjList.get(dep.id)?.push(todo.id);
      inDegree.set(todo.id, (inDegree.get(todo.id) || 0) + 1);
    });
  });

  const queue = todos.filter(todo => inDegree.get(todo.id) === 0);
  const sorted: Todo[] = [];

  while (queue.length > 0) {
    const current = queue.shift()!;
    sorted.push(current);

    const dependents = adjList.get(current.id) || [];
    for (const dependentId of dependents) {
      inDegree.set(dependentId, (inDegree.get(dependentId) || 0) - 1);
      if (inDegree.get(dependentId) === 0) {
        queue.push(todoMap.get(dependentId)!);
      }
    }
  }

  if (sorted.length !== todos.length) {
    return { sorted: [], hasCycle: true };
  }

  return { sorted, hasCycle: false };
}

export function calculateCriticalPath(todos: Todo[]): {
  sorted: Todo[],
  est: Map<number, number>,
  eft: Map<number, number>,
  lst: Map<number, number>,
  lft: Map<number, number>,
  criticalPath: number[],
} {
  const { sorted, hasCycle } = topologicalSort(todos);
  if (hasCycle) {
    return { sorted: [], est: new Map(), eft: new Map(), lst: new Map(), lft: new Map(), criticalPath: [] };
  }

  const todoMap = new Map(todos.map(t => [t.id, t]));
  const duration = 1; // Assuming a fixed duration of 1 day for all tasks.

  const est = new Map<number, number>();
  const eft = new Map<number, number>();
  sorted.forEach(todo => {
    const dependencies = todo.dependencies || [];
    const maxEftOfDeps = Math.max(0, ...dependencies.map(dep => eft.get(dep.id) || 0));
    est.set(todo.id, maxEftOfDeps);
    eft.set(todo.id, maxEftOfDeps + duration);
  });

  const lft = new Map<number, number>();
  const lst = new Map<number, number>();
  const projectEndDate = Math.max(...Array.from(eft.values()));

  [...sorted].reverse().forEach(todo => {
    const dependents = todos.filter(t => t.dependencies.some(d => d.id === todo.id));
    if (dependents.length === 0) {
      lft.set(todo.id, projectEndDate);
    } else {
      const minLstOfDependents = Math.min(...dependents.map(dep => lst.get(dep.id) || Infinity));
      lft.set(todo.id, minLstOfDependents);
    }
    lst.set(todo.id, (lft.get(todo.id) || 0) - duration);
  });

  const criticalPath: number[] = [];
  sorted.forEach(todo => {
    if (est.get(todo.id) === lst.get(todo.id)) {
      criticalPath.push(todo.id);
    }
  });

  return { sorted, est, eft, lst, lft, criticalPath };
} 
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface Params {
  params: {
    id: string;
  };
}

export async function DELETE(request: Request, { params }: Params) {
  const id = parseInt(params.id);
  if (isNaN(id)) {
    return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
  }

  try {
    await prisma.todo.delete({
      where: { id },
    });
    return NextResponse.json({ message: 'Todo deleted' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Error deleting todo' }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: Params) {
  const id = parseInt(params.id);
  if (isNaN(id)) {
    return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
  }

  try {
    const { title, dueDate, dependencies } = await request.json();

    // Circular dependency check
    if (dependencies && dependencies.length > 0) {
      for (const depId of dependencies) {
        const hasCycle = await checkForCycle(depId, id);
        if (hasCycle) {
          return NextResponse.json({ error: 'Circular dependency detected' }, { status: 400 });
        }
      }
    }

    const updatedTodo = await prisma.todo.update({
      where: { id },
      data: {
        title,
        dueDate: dueDate ? new Date(dueDate) : null,
        dependencies: {
          set: dependencies.map((depId: number) => ({ id: depId })),
        },
      },
      include: {
        dependencies: true,
        dependencyFor: true,
      },
    });

    return NextResponse.json(updatedTodo);
  } catch (error) {
    return NextResponse.json({ error: 'Error updating todo' }, { status: 500 });
  }
}

async function checkForCycle(startNodeId: number, endNodeId: number): Promise<boolean> {
  const queue: number[] = [startNodeId];
  const visited: Set<number> = new Set([startNodeId]);

  while (queue.length > 0) {
    const currentNodeId = queue.shift()!;
    if (currentNodeId === endNodeId) {
      return true;
    }

    const todo = await prisma.todo.findUnique({
      where: { id: currentNodeId },
      include: { dependencies: true },
    });

    if (todo && todo.dependencies) {
      for (const dependency of todo.dependencies) {
        if (!visited.has(dependency.id)) {
          visited.add(dependency.id);
          queue.push(dependency.id);
        }
      }
    }
  }

  return false;
}

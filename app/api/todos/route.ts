import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createClient } from 'pexels';

const pexelsClient = createClient(process.env.PEXELS_API_KEY!);

export async function GET() {
  try {
    const todos = await prisma.todo.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        dependencies: true,
        dependencyFor: true,
      },
    });
    return NextResponse.json(todos);
  } catch (error) {
    return NextResponse.json({ error: 'Error fetching todos' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { title, dueDate, dependencies } = await request.json();
    if (!title || title.trim() === '') {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }
    
    const todo = await prisma.todo.create({
      data: {
        title,
        dueDate: dueDate ? new Date(dueDate) : null,
        dependencies: {
          connect: dependencies.map((id: number) => ({ id })),
        },
      },
    });

    let imageUrl: string | null = null;
    try {
      const response = await pexelsClient.photos.search({ query: title, per_page: 1 });
      if ('photos' in response && response.photos.length > 0) {
        imageUrl = response.photos[0].src.medium;
      }
    } catch (error) {
      console.error("Could not fetch image from Pexels", error);
      // Not returning an error to the client, as this is not a critical failure
    }

    if (imageUrl) {
      const updatedTodo = await prisma.todo.update({
        where: { id: todo.id },
        data: { imageUrl },
      });
      return NextResponse.json(updatedTodo, { status: 201 });
    }

    const finalTodo = await prisma.todo.findUnique({
      where: { id: todo.id },
      include: { dependencies: true, dependencyFor: true },
    });

    return NextResponse.json(finalTodo, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Error creating todo' }, { status: 500 });
  }
}
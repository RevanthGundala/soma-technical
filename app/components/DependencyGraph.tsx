"use client";

import React, { useEffect, useState } from 'react';
import mermaid from 'mermaid';
import type { Todo } from '@/lib/graph';

interface DependencyGraphProps {
  todos: Todo[];
  criticalPath: number[];
}

const DependencyGraph: React.FC<DependencyGraphProps> = ({ todos, criticalPath }) => {
  const [svg, setSvg] = useState('');

  useEffect(() => {
    mermaid.initialize({ startOnLoad: false, theme: 'default', securityLevel: 'loose' });
    
    const generateGraph = async () => {
      let graphDefinition = 'graph TD;\n';
      todos.forEach(todo => {
        graphDefinition += `  ${todo.id}["${todo.title}"];\n`;
        if (criticalPath.includes(todo.id)) {
          graphDefinition += `  style ${todo.id} fill:#f87171,stroke:#b91c1c,stroke-width:4px;\n`;
        }
      });
      todos.forEach(todo => {
        todo.dependencies.forEach(dep => {
          graphDefinition += `  ${dep.id} --> ${todo.id};\n`;
        });
      });

      try {
        const { svg } = await mermaid.render('graphDiv', graphDefinition);
        setSvg(svg);
      } catch (error) {
        console.error('Mermaid rendering error:', error);
      }
    };

    if (todos.length > 0) {
      generateGraph();
    }
  }, [todos, criticalPath]);

  return (
    <div className="mt-8 p-4 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-center mb-4">Dependency Graph</h2>
      {svg ? (
        <div dangerouslySetInnerHTML={{ __html: svg }} />
      ) : (
        <p>Loading graph...</p>
      )}
    </div>
  );
};

export default DependencyGraph; 
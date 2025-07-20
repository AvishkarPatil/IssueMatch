import React, { useCallback, useEffect, useState } from 'react';
import ReactFlow, { 
  Background, 
  Controls, 
  MiniMap, 
  Node, 
  Edge, 
  useNodesState, 
  useEdgesState,
  Position,
  MarkerType
} from 'reactflow';
import 'reactflow/dist/style.css';

type MentorNode = {
  id: string;
  name: string;
  avatarUrl: string;
  skills: string[];
  rating: number;
  availability: string;
  experience?: number;
};

type MentorGalaxyProps = {
  mentors: MentorNode[];
  onSelectMentor: (mentorId: string) => void;
  isLoading: boolean;
};

// Custom node component for mentors
const MentorNodeComponent = ({ data }: { data: any }) => {
  const availabilityColor = {
    available: '#10B981', // green
    busy: '#F59E0B',      // yellow
    unavailable: '#EF4444' // red
  }[data.availability] || '#6B7280'; // gray default

  return (
    <div className="group relative">
      <div 
        className={`w-12 h-12 rounded-full overflow-hidden border-2 transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-purple-500/30`}
        style={{ borderColor: availabilityColor }}
      >
        <img 
          src={data.avatarUrl} 
          alt={data.name} 
          className="w-full h-full object-cover"
        />
      </div>
      <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap bg-gray-900/90 text-white text-xs py-1 px-2 rounded">
        <div className="font-medium">{data.name}</div>
        <div className="flex items-center justify-center gap-1">
          <span className="text-yellow-400">★</span>
          <span>{data.rating.toFixed(1)}</span>
        </div>
      </div>
    </div>
  );
};

// Custom node component for user
const UserNodeComponent = ({ data }: { data: any }) => {
  return (
    <div className="relative">
      <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-purple-500 shadow-lg shadow-purple-500/50 animate-pulse">
        <img 
          src={data.avatarUrl || "https://github.com/identicons/app/icon.png"} 
          alt="You" 
          className="w-full h-full object-cover"
        />
      </div>
      <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 whitespace-nowrap bg-purple-900/90 text-white text-xs py-1 px-2 rounded">
        You
      </div>
    </div>
  );
};

// Node types for ReactFlow
const nodeTypes = {
  mentorNode: MentorNodeComponent,
  userNode: UserNodeComponent
};

export default function MentorGalaxy({ mentors, onSelectMentor, isLoading }: MentorGalaxyProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  // Generate nodes and edges from mentors data
  useEffect(() => {
    if (isLoading || !mentors.length) return;

    // Create user node at center
    const userNode: Node = {
      id: 'user',
      type: 'userNode',
      position: { x: 0, y: 0 },
      data: { 
        label: 'You',
        avatarUrl: 'https://github.com/identicons/app/icon.png'
      }
    };

    // Create mentor nodes in a circle around the user
    const mentorNodes: Node[] = mentors.map((mentor, index) => {
      // Calculate position in a circle
      const angle = (index / mentors.length) * 2 * Math.PI;
      const radius = 250; // Distance from center
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;

      return {
        id: mentor.id,
        type: 'mentorNode',
        position: { x, y },
        data: { 
          ...mentor,
          label: mentor.name
        }
      };
    });

    // Create edges from user to mentors
    const mentorEdges: Edge[] = mentors.map((mentor) => {
      // Calculate match score based on rating and skills
      const matchScore = (mentor.rating / 5) * 100;
      const thickness = 1 + (matchScore / 25); // 1-5 based on match score
      
      return {
        id: `user-${mentor.id}`,
        source: 'user',
        target: mentor.id,
        animated: mentor.availability === 'available',
        style: { 
          strokeWidth: thickness,
          stroke: mentor.availability === 'available' ? '#10B981' : '#6366F1'
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: mentor.availability === 'available' ? '#10B981' : '#6366F1',
        }
      };
    });

    // Create edges between mentors with similar skills
    const skillEdges: Edge[] = [];
    for (let i = 0; i < mentors.length; i++) {
      for (let j = i + 1; j < mentors.length; j++) {
        const mentor1 = mentors[i];
        const mentor2 = mentors[j];
        
        // Find common skills
        const commonSkills = mentor1.skills.filter(skill => 
          mentor2.skills.includes(skill)
        );
        
        if (commonSkills.length > 0) {
          skillEdges.push({
            id: `${mentor1.id}-${mentor2.id}`,
            source: mentor1.id,
            target: mentor2.id,
            style: { 
              strokeWidth: commonSkills.length * 0.5,
              stroke: '#6366F1',
              opacity: 0.3,
              strokeDasharray: '5 5'
            }
          });
        }
      }
    }

    setNodes([userNode, ...mentorNodes]);
    setEdges([...mentorEdges, ...skillEdges]);
  }, [mentors, isLoading, setNodes, setEdges]);

  const handleNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    if (node.id !== 'user') {
      onSelectMentor(node.id);
    }
  }, [onSelectMentor]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[600px] bg-gray-900/30 rounded-lg">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="h-[600px] bg-gray-900/30 rounded-lg border border-gray-700 overflow-hidden">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={handleNodeClick}
        nodeTypes={nodeTypes}
        fitView
        attributionPosition="bottom-right"
      >
        <Background color="#6366F1" variant="dots" gap={12} size={1} />
        <Controls />
        <MiniMap 
          nodeColor={(node) => {
            if (node.id === 'user') return '#9333EA';
            
            const availability = (node.data?.availability as string) || 'unavailable';
            switch (availability) {
              case 'available': return '#10B981';
              case 'busy': return '#F59E0B';
              case 'unavailable': return '#EF4444';
              default: return '#6B7280';
            }
          }}
          maskColor="rgba(0, 0, 0, 0.5)"
        />
      </ReactFlow>
    </div>
  );
}
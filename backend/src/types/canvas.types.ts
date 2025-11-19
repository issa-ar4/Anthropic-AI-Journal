export type NodeType = 
  | 'entry'           // Journal entry
  | 'emotion'         // Detected emotion
  | 'theme'           // Key theme/topic
  | 'pattern'         // Recurring pattern
  | 'distortion'      // Cognitive distortion
  | 'event';          // Life event

export type EdgeType =
  | 'contains'        // Entry contains emotion/theme
  | 'relates'         // Related to each other
  | 'triggers'        // Causes/triggers
  | 'temporal';       // Time-based connection

export interface CanvasNode {
  id: string;
  type: NodeType;
  label: string;
  description?: string;
  metadata: {
    entryId?: string;
    date?: string;
    intensity?: number;
    frequency?: number;
    sentiment?: number;
    color?: string;
    size?: number;
    [key: string]: any;
  };
  position?: {
    x: number;
    y: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface CanvasEdge {
  id: string;
  sourceId: string;
  targetId: string;
  type: EdgeType;
  weight: number; // Connection strength 0-1
  label?: string;
  metadata?: {
    [key: string]: any;
  };
  createdAt: Date;
}

export interface CanvasGraph {
  nodes: CanvasNode[];
  edges: CanvasEdge[];
  metadata: {
    centerNode?: string;
    timeRange?: {
      start: Date;
      end: Date;
    };
    filters?: {
      nodeTypes?: NodeType[];
      edgeTypes?: EdgeType[];
      dateRange?: [Date, Date];
    };
    sessionId?: string;
    initialEmotion?: string;
    rootCause?: string;
    turnCount?: number;
    [key: string]: any;
  };
}

export interface GraphGenerationOptions {
  userId: string;
  includeEntries?: boolean;
  includeEmotions?: boolean;
  includeThemes?: boolean;
  includePatterns?: boolean;
  includeDistortions?: boolean;
  timeRange?: {
    start: Date;
    end: Date;
  };
  maxNodes?: number;
  minConnectionWeight?: number;
}

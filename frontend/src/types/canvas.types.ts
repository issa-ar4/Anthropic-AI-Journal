export type NodeType = 
  | 'entry'
  | 'emotion'
  | 'theme'
  | 'pattern'
  | 'distortion'
  | 'event';

export type EdgeType =
  | 'contains'
  | 'relates'
  | 'triggers'
  | 'temporal';

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
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface CanvasEdge {
  id: string;
  sourceId: string;
  targetId: string;
  type: EdgeType;
  weight: number;
  label?: string;
  metadata?: {
    [key: string]: any;
  };
  createdAt: string | Date;
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
  };
}

export interface D3Node extends CanvasNode {
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
  fx?: number | null;
  fy?: number | null;
}

export interface D3Edge extends CanvasEdge {
  source: D3Node | string;
  target: D3Node | string;
}

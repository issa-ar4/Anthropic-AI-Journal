import { PrismaClient } from '@prisma/client';
import { CanvasGraph, CanvasNode, CanvasEdge, GraphGenerationOptions } from '../types/canvas.types';

const prisma = new PrismaClient();

export class CanvasService {
  /**
   * Generate a complete graph from user's journal data
   */
  async generateGraph(options: GraphGenerationOptions): Promise<CanvasGraph> {
    const {
      userId,
      includeEntries = true,
      includeEmotions = true,
      includeThemes = true,
      includePatterns = true,
      includeDistortions = true,
      timeRange,
      maxNodes = 100,
      minConnectionWeight = 0.1,
    } = options;

    const nodes: CanvasNode[] = [];
    const edges: CanvasEdge[] = [];
    const nodeMap = new Map<string, CanvasNode>();
    
    // Build where clause for time filtering
    const whereClause: any = { userId };
    if (timeRange) {
      whereClause.createdAt = {
        gte: timeRange.start,
        lte: timeRange.end,
      };
    }

    // 1. Add journal entry nodes
    if (includeEntries) {
      const entries = await prisma.journalEntry.findMany({
        where: whereClause,
        include: {
          analyses: {
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
        },
        orderBy: { createdAt: 'desc' },
        take: Math.floor(maxNodes / 2),
      });

      for (const entry of entries) {
        const analysis = entry.analyses[0];
        const sentiment = analysis ? (analysis.sentiment as any)?.score || 0 : 0;
        
        const node: CanvasNode = {
          id: `entry-${entry.id}`,
          type: 'entry',
          label: entry.title || `Entry ${new Date(entry.createdAt).toLocaleDateString()}`,
          description: entry.content.substring(0, 200) + '...',
          metadata: {
            entryId: entry.id,
            date: entry.createdAt.toISOString(),
            sentiment,
            color: this.getSentimentColor(sentiment),
            size: 1 + (Math.abs(sentiment) * 0.5),
          },
          createdAt: entry.createdAt,
          updatedAt: entry.updatedAt,
        };
        
        nodes.push(node);
        nodeMap.set(node.id, node);

        // 2. Add emotion nodes from analysis
        if (includeEmotions && analysis) {
          const emotions = analysis.emotions as any;
          
          // Handle both array of strings and array of objects
          const emotionList = Array.isArray(emotions) 
            ? emotions.map(e => typeof e === 'string' ? { name: e, intensity: 50, category: 'neutral' } : e)
            : [];
          
          for (const emotion of emotionList) {
            const emotionName = typeof emotion === 'string' ? emotion : emotion.name;
            if (!emotionName) continue;
            
            const emotionId = `emotion-${emotionName.toLowerCase()}`;
            
            // Create or get emotion node
            if (!nodeMap.has(emotionId)) {
              const emotionNode: CanvasNode = {
                id: emotionId,
                type: 'emotion',
                label: emotionName,
                metadata: {
                  intensity: emotion.intensity || 50,
                  category: emotion.category || 'neutral',
                  frequency: 1,
                  color: this.getEmotionColor(emotion.category || 'neutral'),
                  size: 1,
                },
                createdAt: entry.createdAt,
                updatedAt: entry.updatedAt,
              };
              nodes.push(emotionNode);
              nodeMap.set(emotionId, emotionNode);
            } else {
              // Update frequency
              const existingNode = nodeMap.get(emotionId)!;
              existingNode.metadata.frequency = (existingNode.metadata.frequency || 1) + 1;
              existingNode.metadata.size = 1 + (existingNode.metadata.frequency * 0.1);
            }

            // Create edge
            const intensity = typeof emotion === 'object' ? emotion.intensity : 50;
            edges.push({
              id: `${node.id}-${emotionId}`,
              sourceId: node.id,
              targetId: emotionId,
              type: 'contains',
              weight: (intensity || 50) / 100,
              createdAt: entry.createdAt,
            });
          }
        }

        // 3. Add theme nodes
        if (includeThemes && analysis) {
          const themes = Array.isArray(analysis.keyThemes) ? analysis.keyThemes as string[] : [];
          
          for (const theme of themes) {
            if (!theme || typeof theme !== 'string') continue;
            const themeId = `theme-${theme.toLowerCase().replace(/\s+/g, '-')}`;
            
            if (!nodeMap.has(themeId)) {
              const themeNode: CanvasNode = {
                id: themeId,
                type: 'theme',
                label: theme,
                metadata: {
                  frequency: 1,
                  color: '#8b5cf6',
                  size: 1,
                },
                createdAt: entry.createdAt,
                updatedAt: entry.updatedAt,
              };
              nodes.push(themeNode);
              nodeMap.set(themeId, themeNode);
            } else {
              const existingNode = nodeMap.get(themeId)!;
              existingNode.metadata.frequency = (existingNode.metadata.frequency || 1) + 1;
              existingNode.metadata.size = 1 + (existingNode.metadata.frequency * 0.15);
            }

            edges.push({
              id: `${node.id}-${themeId}`,
              sourceId: node.id,
              targetId: themeId,
              type: 'contains',
              weight: 0.7,
              createdAt: entry.createdAt,
            });
          }
        }

        // 4. Add distortion nodes
        if (includeDistortions && analysis) {
          const distortions = Array.isArray(analysis.cognitiveDistortions) 
            ? analysis.cognitiveDistortions as any[]
            : [];
          
          for (const distortion of distortions) {
            // Handle both string and object formats
            const distortionType = typeof distortion === 'string' ? distortion : distortion.type;
            if (!distortionType) continue;
            
            const distortionId = `distortion-${distortionType.toLowerCase().replace(/\s+/g, '-')}`;
            
            if (!nodeMap.has(distortionId)) {
              const distortionNode: CanvasNode = {
                id: distortionId,
                type: 'distortion',
                label: distortionType,
                description: typeof distortion === 'object' ? distortion.explanation : undefined,
                metadata: {
                  severity: typeof distortion === 'object' ? distortion.severity : 'medium',
                  frequency: 1,
                  color: '#f59e0b',
                  size: 1,
                },
                createdAt: entry.createdAt,
                updatedAt: entry.updatedAt,
              };
              nodes.push(distortionNode);
              nodeMap.set(distortionId, distortionNode);
            } else {
              const existingNode = nodeMap.get(distortionId)!;
              existingNode.metadata.frequency = (existingNode.metadata.frequency || 1) + 1;
              existingNode.metadata.size = 1 + (existingNode.metadata.frequency * 0.2);
            }

            const severity = typeof distortion === 'object' ? distortion.severity : 'medium';
            const severityWeight = 
              severity === 'high' ? 0.9 :
              severity === 'medium' ? 0.6 : 0.3;

            edges.push({
              id: `${node.id}-${distortionId}`,
              sourceId: node.id,
              targetId: distortionId,
              type: 'contains',
              weight: severityWeight,
              createdAt: entry.createdAt,
            });
          }
        }
      }

      // 5. Add temporal edges between consecutive entries
      for (let i = 0; i < entries.length - 1; i++) {
        const current = `entry-${entries[i].id}`;
        const next = `entry-${entries[i + 1].id}`;
        
        if (nodeMap.has(current) && nodeMap.has(next)) {
          edges.push({
            id: `${current}-${next}-temporal`,
            sourceId: next, // Older entry
            targetId: current, // Newer entry
            type: 'temporal',
            weight: 0.3,
            label: 'followed by',
            createdAt: entries[i].createdAt,
          });
        }
      }
    }

    // 6. Add pattern nodes
    if (includePatterns) {
      const patterns = await prisma.pattern.findMany({
        where: { userId },
        orderBy: { frequency: 'desc' },
        take: 20,
      });

      for (const pattern of patterns) {
        const patternNode: CanvasNode = {
          id: `pattern-${pattern.id}`,
          type: 'pattern',
          label: pattern.type.replace('_', ' '),
          description: pattern.description,
          metadata: {
            patternType: pattern.type,
            frequency: pattern.frequency,
            color: '#10b981',
            size: 1 + (pattern.frequency * 0.1),
          },
          createdAt: pattern.createdAt,
          updatedAt: pattern.updatedAt,
        };
        
        nodes.push(patternNode);
        nodeMap.set(patternNode.id, patternNode);

        // Connect pattern to related entries
        const relatedIds = pattern.relatedEntryIds as string[];
        for (const entryId of relatedIds.slice(0, 5)) { // Limit connections
          const entryNodeId = `entry-${entryId}`;
          if (nodeMap.has(entryNodeId)) {
            edges.push({
              id: `${patternNode.id}-${entryNodeId}`,
              sourceId: patternNode.id,
              targetId: entryNodeId,
              type: 'relates',
              weight: 0.6,
              label: 'appears in',
              createdAt: pattern.createdAt,
            });
          }
        }
      }
    }

    // Filter edges by minimum weight
    const filteredEdges = edges.filter(e => e.weight >= minConnectionWeight);

    return {
      nodes: nodes.slice(0, maxNodes),
      edges: filteredEdges,
      metadata: {
        timeRange,
        filters: {
          nodeTypes: [],
          edgeTypes: [],
        },
      },
    };
  }

  /**
   * Save graph to database
   */
  async saveGraph(userId: string, graph: CanvasGraph): Promise<void> {
    // Delete existing nodes and edges
    await prisma.canvasNode.deleteMany({ where: { userId } });
    await prisma.canvasEdge.deleteMany({ where: { userId } });

    // Save new nodes
    for (const node of graph.nodes) {
      await prisma.canvasNode.create({
        data: {
          id: node.id,
          userId,
          type: node.type,
          label: node.label,
          description: node.description,
          metadata: node.metadata,
          positionX: node.position?.x,
          positionY: node.position?.y,
        },
      });
    }

    // Save new edges
    for (const edge of graph.edges) {
      await prisma.canvasEdge.create({
        data: {
          id: edge.id,
          userId,
          sourceId: edge.sourceId,
          targetId: edge.targetId,
          type: edge.type,
          weight: edge.weight,
          label: edge.label,
          metadata: edge.metadata,
        },
      });
    }
  }

  /**
   * Load saved graph from database
   */
  async loadGraph(userId: string): Promise<CanvasGraph | null> {
    const nodes = await prisma.canvasNode.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    const edges = await prisma.canvasEdge.findMany({
      where: { userId },
    });

    if (nodes.length === 0) {
      return null;
    }

    return {
      nodes: nodes.map(n => ({
        id: n.id,
        type: n.type as any,
        label: n.label,
        description: n.description || undefined,
        metadata: n.metadata as any,
        position: n.positionX && n.positionY ? { x: n.positionX, y: n.positionY } : undefined,
        createdAt: n.createdAt,
        updatedAt: n.updatedAt,
      })),
      edges: edges.map(e => ({
        id: e.id,
        sourceId: e.sourceId,
        targetId: e.targetId,
        type: e.type as any,
        weight: e.weight,
        label: e.label || undefined,
        metadata: e.metadata as any,
        createdAt: e.createdAt,
      })),
      metadata: {},
    };
  }

  private getSentimentColor(sentiment: number): string {
    if (sentiment > 0.3) return '#10b981'; // Green
    if (sentiment < -0.3) return '#ef4444'; // Red
    return '#6b7280'; // Gray
  }

  private getEmotionColor(category: string): string {
    switch (category) {
      case 'positive': return '#10b981';
      case 'negative': return '#ef4444';
      default: return '#6b7280';
    }
  }

  /**
   * Get count of journal entries that have been analyzed
   */
  async getAnalyzedEntriesCount(userId: string): Promise<number> {
    const count = await prisma.journalEntry.count({
      where: {
        userId,
        analyses: {
          some: {},
        },
      },
    });
    return count;
  }

  /**
   * Generate a graph from a completed root cause analysis session
   * Visualizes the path from surface emotion to root cause
   */
  async generateSessionGraph(sessionId: string, userId: string): Promise<CanvasGraph> {
    const session = await prisma.session.findFirst({
      where: { id: sessionId, userId },
    });

    if (!session) {
      throw new Error('Session not found');
    }

    const messages = JSON.parse(session.messages as any);
    const metadata = session.metadata ? JSON.parse(session.metadata as any) : {};
    const nodes: CanvasNode[] = [];
    const edges: CanvasEdge[] = [];

    // 1. Add the initial emotion node (starting point)
    const initialNode: CanvasNode = {
      id: `session-${sessionId}-initial`,
      type: 'emotion',
      label: session.initialEmotion,
      description: 'Surface-level emotion',
      metadata: {
        sessionId: session.id,
        nodeIndex: 0,
        color: '#ef4444', // Red for surface emotion
        size: 2,
      },
      createdAt: session.createdAt,
      updatedAt: session.updatedAt,
    };
    nodes.push(initialNode);

    // 2. Create nodes for each user response (the journey)
    const userMessages = messages.filter((m: any) => m.role === 'user').slice(1); // Skip first (initial emotion)
    
    userMessages.forEach((msg: any, index: number) => {
      const node: CanvasNode = {
        id: `session-${sessionId}-step-${index + 1}`,
        type: 'event',
        label: `Layer ${index + 1}`,
        description: msg.content.substring(0, 100) + (msg.content.length > 100 ? '...' : ''),
        metadata: {
          sessionId: session.id,
          nodeIndex: index + 1,
          fullText: msg.content,
          color: '#8b5cf6', // Purple for intermediate steps
          size: 1.5,
        },
        createdAt: new Date(msg.timestamp),
        updatedAt: new Date(msg.timestamp),
      };
      nodes.push(node);

      // Create edge from previous node
      const prevNodeId = index === 0 
        ? `session-${sessionId}-initial`
        : `session-${sessionId}-step-${index}`;
      
      edges.push({
        id: `${prevNodeId}-to-${node.id}`,
        sourceId: prevNodeId,
        targetId: node.id,
        type: 'triggers',
        weight: 0.8,
        label: 'led to',
        createdAt: new Date(msg.timestamp),
      });
    });

    // 3. Add the root cause node (destination)
    if (session.rootCause) {
      const rootCauseNode: CanvasNode = {
        id: `session-${sessionId}-root`,
        type: 'pattern',
        label: 'Root Cause',
        description: session.rootCause,
        metadata: {
          sessionId: session.id,
          nodeIndex: userMessages.length + 1,
          color: '#10b981', // Green for root cause (resolution)
          size: 2.5,
          themes: metadata.themes || [],
        },
        createdAt: session.completedAt || session.updatedAt,
        updatedAt: session.updatedAt,
      };
      nodes.push(rootCauseNode);

      // Connect last step to root cause
      const lastStepId = userMessages.length > 0
        ? `session-${sessionId}-step-${userMessages.length}`
        : `session-${sessionId}-initial`;

      edges.push({
        id: `${lastStepId}-to-root`,
        sourceId: lastStepId,
        targetId: rootCauseNode.id,
        type: 'triggers',
        weight: 1.0,
        label: 'revealed',
        createdAt: session.completedAt || session.updatedAt,
      });
    }

    // 4. Add theme nodes if available
    if (metadata.themes && metadata.themes.length > 0) {
      metadata.themes.forEach((theme: string, index: number) => {
        const themeNode: CanvasNode = {
          id: `session-${sessionId}-theme-${index}`,
          type: 'theme',
          label: theme,
          metadata: {
            sessionId: session.id,
            color: '#f59e0b', // Orange for themes
            size: 1.2,
          },
          createdAt: session.completedAt || session.updatedAt,
          updatedAt: session.updatedAt,
        };
        nodes.push(themeNode);

        // Connect theme to root cause
        if (session.rootCause) {
          edges.push({
            id: `theme-${index}-to-root`,
            sourceId: themeNode.id,
            targetId: `session-${sessionId}-root`,
            type: 'relates',
            weight: 0.6,
            label: 'contributes to',
            createdAt: session.completedAt || session.updatedAt,
          });
        }
      });
    }

    return {
      nodes,
      edges,
      metadata: {
        sessionId: session.id,
        initialEmotion: session.initialEmotion,
        rootCause: session.rootCause || undefined,
        turnCount: session.turnCount,
      },
    };
  }
}

export const canvasService = new CanvasService();

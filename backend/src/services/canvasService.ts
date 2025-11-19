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
          const emotions = analysis.emotions as any[];
          
          for (const emotion of emotions) {
            const emotionId = `emotion-${emotion.name.toLowerCase()}`;
            
            // Create or get emotion node
            if (!nodeMap.has(emotionId)) {
              const emotionNode: CanvasNode = {
                id: emotionId,
                type: 'emotion',
                label: emotion.name,
                metadata: {
                  intensity: emotion.intensity,
                  category: emotion.category,
                  frequency: 1,
                  color: this.getEmotionColor(emotion.category),
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
            edges.push({
              id: `${node.id}-${emotionId}`,
              sourceId: node.id,
              targetId: emotionId,
              type: 'contains',
              weight: emotion.intensity / 100,
              createdAt: entry.createdAt,
            });
          }
        }

        // 3. Add theme nodes
        if (includeThemes && analysis) {
          const themes = analysis.keyThemes as string[];
          
          for (const theme of themes) {
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
          const distortions = analysis.cognitiveDistortions as any[];
          
          for (const distortion of distortions) {
            const distortionId = `distortion-${distortion.type.toLowerCase().replace(/\s+/g, '-')}`;
            
            if (!nodeMap.has(distortionId)) {
              const distortionNode: CanvasNode = {
                id: distortionId,
                type: 'distortion',
                label: distortion.type,
                description: distortion.explanation,
                metadata: {
                  severity: distortion.severity,
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

            const severityWeight = 
              distortion.severity === 'high' ? 0.9 :
              distortion.severity === 'medium' ? 0.6 : 0.3;

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
}

export const canvasService = new CanvasService();

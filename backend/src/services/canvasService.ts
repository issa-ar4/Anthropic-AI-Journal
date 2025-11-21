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
            const distortionType = typeof distortion === 'string' ? distortion : distortion?.type;
            // Skip if distortionType is invalid (null, undefined, empty string)
            if (!distortionType || typeof distortionType !== 'string' || distortionType.trim() === '') continue;
            
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

    // 7. Create inter-column connections (emotion -> theme -> pattern -> distortion)
    const emotionNodes = nodes.filter(n => n.type === 'emotion');
    const themeNodes = nodes.filter(n => n.type === 'theme');
    const patternNodes = nodes.filter(n => n.type === 'pattern');
    const distortionNodes = nodes.filter(n => n.type === 'distortion');

    // Build a co-occurrence matrix between all node types through entries
    const buildCooccurrenceMap = (sourceType: string, targetType: string) => {
      const cooccurrence = new Map<string, Map<string, number>>();
      
      // Get all entries
      const entryNodes = nodes.filter(n => n.type === 'entry');
      
      for (const entry of entryNodes) {
        const entryId = entry.id;
        
        // Find all source nodes connected to this entry
        const sourceNodes = edges
          .filter(e => e.sourceId === entryId && nodeMap.has(e.targetId) && nodeMap.get(e.targetId)!.type === sourceType)
          .map(e => e.targetId);
        
        // Find all target nodes connected to this entry
        const targetNodes = edges
          .filter(e => e.sourceId === entryId && nodeMap.has(e.targetId) && nodeMap.get(e.targetId)!.type === targetType)
          .map(e => e.targetId);
        
        // Also check patterns which connect differently (pattern -> entry)
        if (targetType === 'pattern') {
          const patternToEntry = edges
            .filter(e => e.targetId === entryId && e.sourceId.startsWith('pattern-'))
            .map(e => e.sourceId);
          targetNodes.push(...patternToEntry);
        }
        
        // Record co-occurrences
        for (const sourceId of sourceNodes) {
          if (!cooccurrence.has(sourceId)) {
            cooccurrence.set(sourceId, new Map());
          }
          const targetMap = cooccurrence.get(sourceId)!;
          
          for (const targetId of targetNodes) {
            targetMap.set(targetId, (targetMap.get(targetId) || 0) + 1);
          }
        }
      }
      
      return cooccurrence;
    };

    // Connect emotions to themes based on co-occurrence
    if (includeEmotions && includeThemes && emotionNodes.length > 0 && themeNodes.length > 0) {
      const emotionThemeCooccurrence = buildCooccurrenceMap('emotion', 'theme');
      
      for (const emotion of emotionNodes) {
        const cooccurringThemes = emotionThemeCooccurrence.get(emotion.id);
        if (!cooccurringThemes || cooccurringThemes.size === 0) continue;
        
        // Get top 3 most co-occurring themes
        const sortedThemes = Array.from(cooccurringThemes.entries())
          .sort((a, b) => b[1] - a[1])
          .slice(0, 3);
        
        for (const [themeId, count] of sortedThemes) {
          const weight = Math.min(0.5 + (count * 0.1), 1);
          edges.push({
            id: `${emotion.id}-${themeId}-cooccur`,
            sourceId: emotion.id,
            targetId: themeId,
            type: 'relates',
            weight,
            label: 'relates to',
            createdAt: new Date(),
          });
        }
      }
    }

    // Connect themes to patterns based on co-occurrence
    if (includeThemes && includePatterns && themeNodes.length > 0 && patternNodes.length > 0) {
      const themePatternCooccurrence = buildCooccurrenceMap('theme', 'pattern');
      
      for (const theme of themeNodes) {
        const cooccurringPatterns = themePatternCooccurrence.get(theme.id);
        if (!cooccurringPatterns || cooccurringPatterns.size === 0) continue;
        
        // Get top 3 most co-occurring patterns
        const sortedPatterns = Array.from(cooccurringPatterns.entries())
          .sort((a, b) => b[1] - a[1])
          .slice(0, 3);
        
        for (const [patternId, count] of sortedPatterns) {
          const weight = Math.min(0.5 + (count * 0.1), 1);
          edges.push({
            id: `${theme.id}-${patternId}-cooccur`,
            sourceId: theme.id,
            targetId: patternId,
            type: 'relates',
            weight,
            label: 'appears in',
            createdAt: new Date(),
          });
        }
      }
    }

    // Connect patterns to distortions based on co-occurrence
    if (includePatterns && includeDistortions && patternNodes.length > 0 && distortionNodes.length > 0) {
      // For patterns to distortions, we need to check entries that patterns relate to
      const patternDistortionCooccurrence = new Map<string, Map<string, number>>();
      
      for (const pattern of patternNodes) {
        // Find entries this pattern relates to
        const patternEntries = edges
          .filter(e => e.sourceId === pattern.id && e.targetId.startsWith('entry-'))
          .map(e => e.targetId);
        
        const distortionMap = new Map<string, number>();
        
        // Find distortions in those same entries
        for (const entryId of patternEntries) {
          const entryDistortions = edges
            .filter(e => e.sourceId === entryId && e.targetId.startsWith('distortion-'))
            .map(e => e.targetId);
          
          for (const distortionId of entryDistortions) {
            distortionMap.set(distortionId, (distortionMap.get(distortionId) || 0) + 1);
          }
        }
        
        if (distortionMap.size > 0) {
          patternDistortionCooccurrence.set(pattern.id, distortionMap);
        }
      }
      
      for (const pattern of patternNodes) {
        const cooccurringDistortions = patternDistortionCooccurrence.get(pattern.id);
        if (!cooccurringDistortions || cooccurringDistortions.size === 0) continue;
        
        // Get top 3 most co-occurring distortions
        const sortedDistortions = Array.from(cooccurringDistortions.entries())
          .sort((a, b) => b[1] - a[1])
          .slice(0, 3);
        
        for (const [distortionId, count] of sortedDistortions) {
          const weight = Math.min(0.5 + (count * 0.1), 1);
          edges.push({
            id: `${pattern.id}-${distortionId}-cooccur`,
            sourceId: pattern.id,
            targetId: distortionId,
            type: 'relates',
            weight,
            label: 'linked to',
            createdAt: new Date(),
          });
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
   * Generate emotion timeline data for the past 30 days
   */
  async generateTimelineData(userId: string, days: number = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const entries = await prisma.journalEntry.findMany({
      where: {
        userId,
        createdAt: { gte: startDate },
      },
      include: {
        analyses: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    // Group emotions by date
    const emotionsByDate = new Map<string, Map<string, number[]>>();

    entries.forEach(entry => {
      if (entry.analyses.length === 0) return;

      const date = entry.createdAt.toISOString().split('T')[0];
      const emotions = entry.analyses[0].emotions as any[];

      if (!emotionsByDate.has(date)) {
        emotionsByDate.set(date, new Map());
      }

      const dateEmotions = emotionsByDate.get(date)!;

      if (Array.isArray(emotions)) {
        emotions.forEach((emotion: any) => {
          const name = typeof emotion === 'string' ? emotion : emotion.name;
          const intensity = typeof emotion === 'object' ? emotion.intensity : 50;

          if (!name) return;

          if (!dateEmotions.has(name)) {
            dateEmotions.set(name, []);
          }
          dateEmotions.get(name)!.push(intensity);
        });
      }
    });

    // Calculate averages and trends
    const timeline = [];
    const allDates = Array.from(emotionsByDate.keys()).sort();

    for (const date of allDates) {
      const dateEmotions = emotionsByDate.get(date)!;
      const emotions: any[] = [];

      dateEmotions.forEach((intensities, name) => {
        const avgIntensity = intensities.reduce((a, b) => a + b, 0) / intensities.length;
        emotions.push({
          name,
          intensity: Math.round(avgIntensity),
        });
      });

      timeline.push({ date, emotions });
    }

    // Calculate trends for each emotion
    const emotionTrends = new Map<string, 'up' | 'down' | 'stable'>();
    const allEmotions = new Set<string>();

    timeline.forEach(day => {
      day.emotions.forEach((e: any) => allEmotions.add(e.name));
    });

    allEmotions.forEach(emotionName => {
      const recentIntensities: number[] = [];
      const olderIntensities: number[] = [];

      timeline.forEach((day, idx) => {
        const emotion = day.emotions.find((e: any) => e.name === emotionName);
        if (emotion) {
          if (idx >= timeline.length / 2) {
            recentIntensities.push(emotion.intensity);
          } else {
            olderIntensities.push(emotion.intensity);
          }
        }
      });

      if (recentIntensities.length === 0 || olderIntensities.length === 0) {
        emotionTrends.set(emotionName, 'stable');
      } else {
        const recentAvg = recentIntensities.reduce((a, b) => a + b, 0) / recentIntensities.length;
        const olderAvg = olderIntensities.reduce((a, b) => a + b, 0) / olderIntensities.length;
        const diff = recentAvg - olderAvg;

        if (diff > 10) emotionTrends.set(emotionName, 'up');
        else if (diff < -10) emotionTrends.set(emotionName, 'down');
        else emotionTrends.set(emotionName, 'stable');
      }
    });

    // Add trends to timeline
    timeline.forEach(day => {
      day.emotions = day.emotions.map((e: any) => ({
        ...e,
        trend: emotionTrends.get(e.name) || 'stable',
      }));
    });

    return { timeline, emotionTrends: Object.fromEntries(emotionTrends) };
  }

  /**
   * Generate root cause tree showing emotion -> trigger -> distortion -> pattern hierarchy
   */
  async generateRootCauseTree(userId: string) {
    const entries = await prisma.journalEntry.findMany({
      where: { userId },
      include: {
        analyses: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    const patterns = await prisma.pattern.findMany({
      where: { userId },
      orderBy: { frequency: 'desc' },
      take: 10,
    });

    // Build tree structure: emotion -> themes -> distortions -> patterns
    const emotionMap = new Map<string, {
      triggers: Set<string>;
      distortions: Set<string>;
      patterns: Set<string>;
      entryIds: string[];
    }>();

    entries.forEach(entry => {
      if (entry.analyses.length === 0) return;

      const analysis = entry.analyses[0];
      const emotions = analysis.emotions as any[];
      const themes = Array.isArray(analysis.keyThemes) ? analysis.keyThemes as string[] : [];
      const distortions = Array.isArray(analysis.cognitiveDistortions) 
        ? analysis.cognitiveDistortions as any[] 
        : [];

      if (Array.isArray(emotions)) {
        emotions.forEach((emotion: any) => {
          const emotionName = typeof emotion === 'string' ? emotion : emotion.name;
          if (!emotionName) return;

          if (!emotionMap.has(emotionName)) {
            emotionMap.set(emotionName, {
              triggers: new Set(),
              distortions: new Set(),
              patterns: new Set(),
              entryIds: [],
            });
          }

          const emotionData = emotionMap.get(emotionName)!;
          emotionData.entryIds.push(entry.id);

          // Add triggers (themes)
          themes.forEach(theme => {
            if (theme && typeof theme === 'string') {
              emotionData.triggers.add(theme);
            }
          });

          // Add distortions
          distortions.forEach((d: any) => {
            const distType = typeof d === 'string' ? d : d?.type;
            if (distType && typeof distType === 'string' && distType.trim() !== '') {
              emotionData.distortions.add(distType);
            }
          });
        });
      }
    });

    // Add patterns to emotions
    patterns.forEach(pattern => {
      const relatedIds = pattern.relatedEntryIds as string[];
      
      emotionMap.forEach((data, emotionName) => {
        const overlap = relatedIds.filter(id => data.entryIds.includes(id)).length;
        if (overlap > 0) {
          data.patterns.add(pattern.type);
        }
      });
    });

    // Convert to array format
    const tree = Array.from(emotionMap.entries()).map(([emotion, data]) => ({
      emotion,
      triggers: Array.from(data.triggers),
      distortions: Array.from(data.distortions),
      patterns: Array.from(data.patterns),
      entryIds: data.entryIds,
      frequency: data.entryIds.length,
    })).sort((a, b) => b.frequency - a.frequency);

    return tree;
  }

  /**
   * Generate distortion dashboard with actionable challenges
   */
  async generateDistortionDashboard(userId: string) {
    const entries = await prisma.journalEntry.findMany({
      where: { userId },
      include: {
        analyses: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    // Count distortions
    const distortionMap = new Map<string, {
      count: number;
      descriptions: string[];
      entryIds: string[];
      severities: string[];
    }>();

    entries.forEach(entry => {
      if (entry.analyses.length === 0) return;

      const distortions = entry.analyses[0].cognitiveDistortions as any[];
      
      if (Array.isArray(distortions)) {
        distortions.forEach((d: any) => {
          const type = typeof d === 'string' ? d : d?.type;
          if (!type || typeof type !== 'string' || type.trim() === '') return;

          if (!distortionMap.has(type)) {
            distortionMap.set(type, {
              count: 0,
              descriptions: [],
              entryIds: [],
              severities: [],
            });
          }

          const data = distortionMap.get(type)!;
          data.count++;
          data.entryIds.push(entry.id);

          if (typeof d === 'object') {
            if (d.explanation) data.descriptions.push(d.explanation);
            if (d.severity) data.severities.push(d.severity);
          }
        });
      }
    });

    // Define challenges for common distortions
    const challenges: Record<string, string> = {
      'Catastrophizing': 'Ask yourself: "What evidence do I actually have?" and "What\'s the most likely outcome?"',
      'Black-and-white thinking': 'Look for the gray areas. What\'s one thing that\'s partially true?',
      'Mind Reading': 'Challenge: "What actual evidence do I have about what they\'re thinking?"',
      'Overgeneralization': 'Replace "always" and "never" with specific instances.',
      'Emotional Reasoning': 'Remember: Feeling something doesn\'t make it true. What are the facts?',
      'Should Statements': 'Replace "should" with "prefer" or "choose to".',
      'Mental Filter': 'List 3 positive things that happened today, even small ones.',
      'Personalization': 'Ask: "What other factors might have contributed to this?"',
    };

    // Convert to sorted array
    const dashboard = Array.from(distortionMap.entries())
      .map(([type, data]) => {
        const avgSeverity = data.severities.length > 0
          ? data.severities.filter(s => s === 'high').length > data.severities.length / 2 ? 'high'
          : data.severities.filter(s => s === 'medium').length > data.severities.length / 2 ? 'medium'
          : 'low'
          : 'medium';

        return {
          type,
          frequency: data.count,
          description: data.descriptions[0] || `Tendency toward ${type.toLowerCase()}`,
          challenge: challenges[type] || 'Notice when this pattern occurs and pause to question it.',
          relatedEntries: data.entryIds.slice(0, 5),
          severity: avgSeverity,
        };
      })
      .sort((a, b) => b.frequency - a.frequency);

    return dashboard;
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

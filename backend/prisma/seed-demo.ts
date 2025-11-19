import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function seedDemoAccount() {
  console.log('🌱 Starting demo account seeding...');

  // Create demo user
  const hashedPassword = await bcrypt.hash('demo123', 10);
  
  const demoUser = await prisma.user.upsert({
    where: { email: 'demo@cognitivecanvas.com' },
    update: {},
    create: {
      email: 'demo@cognitivecanvas.com',
      password: hashedPassword,
      name: 'Demo User',
    },
  });

  console.log('✅ Demo user created:', demoUser.email);

  // Create journal entries with varied dates
  const now = new Date();
  const entries = [];

  const journalData = [
    {
      daysAgo: 1,
      title: 'Morning Reflection',
      content: `Today started with a sense of unease. I woke up feeling anxious about the presentation at work tomorrow. My chest feels tight and I can't shake this feeling that something will go wrong. I know I've prepared well, but the fear of judgment from my colleagues is overwhelming. Maybe this stems from my childhood when my parents were highly critical of my school presentations.`,
    },
    {
      daysAgo: 3,
      title: 'Weekend Thoughts',
      content: `Spent the weekend alone again. I turned down Sarah's invitation to the party because I felt too drained. Lately, I've been withdrawing from social situations more and more. I tell myself it's because I need alone time to recharge, but part of me wonders if I'm just avoiding potential rejection. When did I become so afraid of connecting with people?`,
    },
    {
      daysAgo: 5,
      title: 'Work Frustrations',
      content: `My manager gave feedback on my project today. Even though it was mostly positive, I fixated on the one critical comment about improving communication. I felt like a complete failure for hours. Why do I always focus on the negative? This perfectionism is exhausting. I realize I'm holding myself to impossible standards.`,
    },
    {
      daysAgo: 7,
      title: 'Family Dinner',
      content: `Had dinner with my parents tonight. The usual dynamics emerged - Dad comparing me to my brother's achievements, Mom asking when I'll settle down. I smiled through it but inside I felt inadequate. I'm 28 and still seeking their approval. When will I break free from this pattern?`,
    },
    {
      daysAgo: 10,
      title: 'Therapy Session',
      content: `Today's therapy session was eye-opening. We discussed my fear of failure and how it's connected to my self-worth. I've been defining my value by external achievements rather than recognizing my intrinsic worth. This awareness feels both liberating and scary. There's so much work to do.`,
    },
    {
      daysAgo: 12,
      title: 'Midnight Thoughts',
      content: `Can't sleep. My mind is racing with worry about the future. What if I never achieve my goals? What if I'm not good enough? These thoughts spiral endlessly. I need to remember what my therapist said about cognitive distortions - I'm catastrophizing again.`,
    },
    {
      daysAgo: 14,
      title: 'Small Victory',
      content: `Something good happened today! I finally finished that difficult project and my team appreciated my work. For once, I let myself feel proud instead of immediately moving to the next challenge. This is progress. I'm learning to acknowledge my accomplishments.`,
    },
    {
      daysAgo: 18,
      title: 'Relationship Reflections',
      content: `Thinking about my past relationships today. I see a pattern - I always push people away when they get too close. My fear of vulnerability keeps me isolated. I want deep connections but I'm terrified of being hurt. This contradiction is exhausting.`,
    },
    {
      daysAgo: 21,
      title: 'Career Crossroads',
      content: `Received a job offer from another company today. Better pay, more responsibility. But I'm paralyzed by indecision. What if I fail? What if I can't handle the pressure? I'm caught between the desire for growth and the comfort of the familiar.`,
    },
    {
      daysAgo: 25,
      title: 'Inner Critic',
      content: `My inner critic was particularly loud today. Every decision I made felt wrong. I second-guessed everything from what I wore to what I said in meetings. This constant self-monitoring is exhausting. I need to develop more self-compassion.`,
    },
  ];

  for (const data of journalData) {
    const entryDate = new Date(now);
    entryDate.setDate(entryDate.getDate() - data.daysAgo);

    const entry = await prisma.journalEntry.create({
      data: {
        userId: demoUser.id,
        title: data.title,
        content: data.content,
        createdAt: entryDate,
        updatedAt: entryDate,
      },
    });

    entries.push(entry);
    console.log(`✅ Created entry: ${data.title}`);
  }

  // Create analyses for the entries
  const analysesData = [
    {
      emotions: ['anxiety', 'fear', 'inadequacy'],
      sentiment: { score: -0.6, label: 'negative' },
      cognitiveDistortions: ['catastrophizing', 'personalization'],
      causalLinks: ['childhood criticism -> fear of judgment', 'presentation anxiety -> physical symptoms'],
      keyThemes: ['performance anxiety', 'fear of judgment', 'childhood experiences'],
      summary: 'The entry reveals deep-seated anxiety about performance and judgment, rooted in childhood experiences with critical parents.',
    },
    {
      emotions: ['loneliness', 'fear', 'avoidance'],
      sentiment: { score: -0.7, label: 'negative' },
      cognitiveDistortions: ['avoidance', 'mind reading'],
      causalLinks: ['fear of rejection -> social withdrawal', 'isolation -> increased anxiety'],
      keyThemes: ['social anxiety', 'isolation', 'fear of rejection'],
      summary: 'Shows a pattern of social withdrawal driven by fear of rejection, creating a cycle of isolation.',
    },
    {
      emotions: ['inadequacy', 'frustration', 'exhaustion'],
      sentiment: { score: -0.5, label: 'negative' },
      cognitiveDistortions: ['mental filtering', 'all-or-nothing thinking'],
      causalLinks: ['perfectionism -> focus on criticism', 'impossible standards -> exhaustion'],
      keyThemes: ['perfectionism', 'self-criticism', 'negative focus'],
      summary: 'Demonstrates perfectionism and selective attention to negative feedback while discounting positive input.',
    },
    {
      emotions: ['inadequacy', 'frustration', 'resentment'],
      sentiment: { score: -0.6, label: 'negative' },
      cognitiveDistortions: ['approval seeking', 'external validation'],
      causalLinks: ['parental comparison -> inadequacy', 'seeking approval -> diminished self-worth'],
      keyThemes: ['family dynamics', 'approval seeking', 'comparison'],
      summary: 'Highlights ongoing struggle with seeking parental approval and impact of family comparisons on self-worth.',
    },
    {
      emotions: ['hope', 'vulnerability', 'awareness'],
      sentiment: { score: 0.3, label: 'slightly positive' },
      cognitiveDistortions: [],
      causalLinks: ['therapy insight -> self-awareness', 'external achievement focus -> diminished self-worth'],
      keyThemes: ['self-awareness', 'personal growth', 'therapy progress'],
      summary: 'Shows therapeutic breakthrough in recognizing patterns of self-worth tied to external achievement.',
    },
    {
      emotions: ['anxiety', 'worry', 'overwhelm'],
      sentiment: { score: -0.8, label: 'very negative' },
      cognitiveDistortions: ['catastrophizing', 'fortune telling'],
      causalLinks: ['worry about future -> insomnia', 'catastrophic thinking -> anxiety spiral'],
      keyThemes: ['future anxiety', 'catastrophizing', 'sleep disturbance'],
      summary: 'Reveals intense anxiety about the future characterized by catastrophic thinking patterns.',
    },
    {
      emotions: ['pride', 'satisfaction', 'hope'],
      sentiment: { score: 0.7, label: 'positive' },
      cognitiveDistortions: [],
      causalLinks: ['team recognition -> self-acknowledgment', 'allowing pride -> progress'],
      keyThemes: ['achievement', 'self-acknowledgment', 'progress'],
      summary: 'Positive shift showing ability to acknowledge accomplishments and feel pride, marking therapeutic progress.',
    },
    {
      emotions: ['loneliness', 'fear', 'conflict'],
      sentiment: { score: -0.5, label: 'negative' },
      cognitiveDistortions: ['avoidance', 'fear of vulnerability'],
      causalLinks: ['fear of hurt -> pushing away', 'desire for connection vs fear -> inner conflict'],
      keyThemes: ['relationship patterns', 'vulnerability', 'fear of intimacy'],
      summary: 'Identifies pattern of self-sabotage in relationships driven by fear of vulnerability and potential hurt.',
    },
    {
      emotions: ['anxiety', 'indecision', 'fear'],
      sentiment: { score: -0.4, label: 'negative' },
      cognitiveDistortions: ['catastrophizing', 'fortune telling'],
      causalLinks: ['opportunity -> paralysis', 'fear of failure -> stuck in comfort zone'],
      keyThemes: ['career decisions', 'fear of failure', 'avoidance of growth'],
      summary: 'Shows how fear of failure creates paralysis in decision-making, preventing personal and professional growth.',
    },
    {
      emotions: ['inadequacy', 'exhaustion', 'self-criticism'],
      sentiment: { score: -0.7, label: 'negative' },
      cognitiveDistortions: ['overgeneralization', 'labeling'],
      causalLinks: ['harsh self-criticism -> decision paralysis', 'constant monitoring -> exhaustion'],
      keyThemes: ['inner critic', 'self-monitoring', 'need for self-compassion'],
      summary: 'Demonstrates the debilitating effect of harsh self-criticism and need for developing self-compassion.',
    },
  ];

  for (let i = 0; i < entries.length; i++) {
    await prisma.analysis.create({
      data: {
        entryId: entries[i].id,
        emotions: analysesData[i].emotions,
        sentiment: analysesData[i].sentiment,
        cognitiveDistortions: analysesData[i].cognitiveDistortions,
        causalLinks: analysesData[i].causalLinks,
        keyThemes: analysesData[i].keyThemes,
        summary: analysesData[i].summary,
      },
    });
    console.log(`✅ Created analysis for: ${entries[i].title}`);
  }

  // Create patterns
  const patterns = [
    {
      type: 'cognitive_distortion',
      description: 'Catastrophizing pattern: Tendency to imagine worst-case scenarios, especially regarding performance and future outcomes.',
      frequency: 5,
      relatedEntryIds: [entries[0].id, entries[5].id, entries[8].id],
    },
    {
      type: 'emotional',
      description: 'Anxiety and fear pattern: Recurring feelings of anxiety, particularly in social and performance contexts.',
      frequency: 7,
      relatedEntryIds: [entries[0].id, entries[1].id, entries[5].id, entries[8].id],
    },
    {
      type: 'behavioral',
      description: 'Social withdrawal pattern: Repeated avoidance of social situations and pushing people away when relationships deepen.',
      frequency: 3,
      relatedEntryIds: [entries[1].id, entries[7].id],
    },
    {
      type: 'cognitive_distortion',
      description: 'Mental filtering and negative focus: Selective attention to criticism while discounting positive feedback.',
      frequency: 4,
      relatedEntryIds: [entries[2].id, entries[3].id, entries[9].id],
    },
  ];

  for (const pattern of patterns) {
    await prisma.pattern.create({
      data: {
        userId: demoUser.id,
        type: pattern.type,
        description: pattern.description,
        frequency: pattern.frequency,
        relatedEntryIds: pattern.relatedEntryIds,
      },
    });
    console.log(`✅ Created pattern: ${pattern.type}`);
  }

  // Create completed root cause analysis sessions
  const sessions = [
    {
      daysAgo: 2,
      initialEmotion: 'I feel anxious about my work presentation',
      rootCause: 'Fear of being judged stems from childhood experiences of harsh criticism from parents, leading to a belief that my worth depends on perfect performance.',
      messages: [
        { role: 'user', content: 'I feel anxious about my work presentation', timestamp: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString() },
        { role: 'assistant', content: 'I hear you. Can you tell me more about what specifically makes you anxious about this presentation?', timestamp: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000 + 60000).toISOString() },
        { role: 'user', content: 'I worry that people will judge me if I make a mistake', timestamp: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000 + 120000).toISOString() },
        { role: 'assistant', content: 'That fear of judgment sounds difficult. When did you first start feeling this way about being judged?', timestamp: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000 + 180000).toISOString() },
        { role: 'user', content: 'I remember my parents being very critical when I gave presentations in school', timestamp: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000 + 240000).toISOString() },
        { role: 'assistant', content: 'That connection is important. How did their criticism affect how you saw yourself?', timestamp: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000 + 300000).toISOString() },
        { role: 'user', content: 'I started believing that I was only valuable when I performed perfectly', timestamp: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000 + 360000).toISOString() },
        { role: 'assistant', content: 'It sounds like you learned to tie your worth to perfect performance because of those early experiences with criticism. Does this feel like the root of your current anxiety?', timestamp: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000 + 420000).toISOString() },
        { role: 'user', content: 'Yes, that makes so much sense. I see it now.', timestamp: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000 + 480000).toISOString() },
      ],
      turnCount: 9,
      status: 'completed',
    },
    {
      daysAgo: 6,
      initialEmotion: 'I feel lonely and isolated',
      rootCause: 'Withdrawing from social situations is a protective mechanism developed from early rejection experiences, creating a self-fulfilling prophecy of isolation.',
      messages: [
        { role: 'user', content: 'I feel lonely and isolated', timestamp: new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000).toISOString() },
        { role: 'assistant', content: 'Loneliness can be really painful. What do you think contributes to feeling isolated?', timestamp: new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000 + 60000).toISOString() },
        { role: 'user', content: 'I keep turning down invitations from friends', timestamp: new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000 + 120000).toISOString() },
        { role: 'assistant', content: 'What happens inside you when you receive those invitations? What makes you want to say no?', timestamp: new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000 + 180000).toISOString() },
        { role: 'user', content: 'I feel afraid they will realize I am not worth being around', timestamp: new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000 + 240000).toISOString() },
        { role: 'assistant', content: 'That fear sounds powerful. Where do you think that belief about your worth came from?', timestamp: new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000 + 300000).toISOString() },
        { role: 'user', content: 'I was rejected by a close friend group in high school. It really hurt.', timestamp: new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000 + 360000).toISOString() },
        { role: 'assistant', content: 'So now you protect yourself from potential rejection by withdrawing first. How does that strategy affect your current loneliness?', timestamp: new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000 + 420000).toISOString() },
        { role: 'user', content: 'Oh... I am creating the very isolation I am trying to avoid by protecting myself', timestamp: new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000 + 480000).toISOString() },
      ],
      turnCount: 9,
      status: 'completed',
    },
    {
      daysAgo: 15,
      initialEmotion: 'I feel like a failure',
      rootCause: 'Perfectionism and all-or-nothing thinking developed from parents comparing achievements to siblings, leading to impossible standards and chronic feelings of inadequacy.',
      messages: [
        { role: 'user', content: 'I feel like a failure', timestamp: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000).toISOString() },
        { role: 'assistant', content: 'That must feel heavy. What happened that brings up this feeling?', timestamp: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000 + 60000).toISOString() },
        { role: 'user', content: 'My manager pointed out one thing to improve in my otherwise positive review', timestamp: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000 + 120000).toISOString() },
        { role: 'assistant', content: 'So one piece of constructive feedback led to feeling like a complete failure. What does that tell you about your standards for yourself?', timestamp: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000 + 180000).toISOString() },
        { role: 'user', content: 'I guess I expect myself to be perfect. Anything less feels like failure.', timestamp: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000 + 240000).toISOString() },
        { role: 'assistant', content: 'When did you start believing that anything less than perfect equals failure?', timestamp: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000 + 300000).toISOString() },
        { role: 'user', content: 'My parents always compared me to my brother. He excelled at everything. I felt I had to be perfect to measure up.', timestamp: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000 + 360000).toISOString() },
        { role: 'assistant', content: 'So these impossible standards you hold yourself to came from trying to compete with your brother to earn your parents approval. Is this what drives your perfectionism now?', timestamp: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000 + 420000).toISOString() },
        { role: 'user', content: 'Yes, exactly. I am still trying to prove my worth through perfect achievement.', timestamp: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000 + 480000).toISOString() },
      ],
      turnCount: 9,
      status: 'completed',
    },
  ];

  for (const sessionData of sessions) {
    const sessionDate = new Date(now);
    sessionDate.setDate(sessionDate.getDate() - sessionData.daysAgo);

    await prisma.session.create({
      data: {
        userId: demoUser.id,
        status: sessionData.status,
        initialEmotion: sessionData.initialEmotion,
        rootCause: sessionData.rootCause,
        messages: sessionData.messages,
        turnCount: sessionData.turnCount,
        createdAt: sessionDate,
        updatedAt: sessionDate,
        completedAt: sessionDate,
      },
    });
    console.log(`✅ Created session: ${sessionData.initialEmotion}`);
  }

  // Create canvas nodes
  const nodes = [
    // Entry nodes
    { type: 'entry', label: 'Work Anxiety', description: 'Presentation fears and performance anxiety', color: '#6366f1' },
    { type: 'entry', label: 'Social Withdrawal', description: 'Avoiding friends and social situations', color: '#6366f1' },
    { type: 'entry', label: 'Perfectionism', description: 'Impossible standards and self-criticism', color: '#6366f1' },
    { type: 'entry', label: 'Family Dynamics', description: 'Parental comparison and approval seeking', color: '#6366f1' },
    { type: 'entry', label: 'Career Indecision', description: 'Paralyzed by fear of making wrong choice', color: '#6366f1' },
    
    // Emotion nodes
    { type: 'emotion', label: 'Anxiety', description: 'Chronic worry and nervousness', color: '#ef4444' },
    { type: 'emotion', label: 'Fear of Judgment', description: 'Worry about others\' opinions', color: '#ef4444' },
    { type: 'emotion', label: 'Inadequacy', description: 'Feeling not good enough', color: '#ef4444' },
    { type: 'emotion', label: 'Loneliness', description: 'Feeling isolated and disconnected', color: '#ef4444' },
    
    // Theme nodes
    { type: 'theme', label: 'Fear of Failure', description: 'Recurring theme across entries', color: '#f59e0b' },
    { type: 'theme', label: 'Approval Seeking', description: 'Need for external validation', color: '#f59e0b' },
    { type: 'theme', label: 'Vulnerability Avoidance', description: 'Protecting self from potential hurt', color: '#f59e0b' },
    
    // Pattern nodes
    { type: 'pattern', label: 'Catastrophizing', description: 'Imagining worst-case scenarios', color: '#8b5cf6' },
    { type: 'pattern', label: 'All-or-Nothing Thinking', description: 'Black and white perspective', color: '#8b5cf6' },
    { type: 'pattern', label: 'Mental Filtering', description: 'Focus on negative, ignore positive', color: '#8b5cf6' },
    
    // Root causes
    { type: 'distortion', label: 'Childhood Criticism', description: 'Harsh parental feedback shaped self-worth', color: '#ec4899' },
    { type: 'distortion', label: 'Sibling Comparison', description: 'Constant comparison created perfectionism', color: '#ec4899' },
    { type: 'distortion', label: 'Past Rejection', description: 'High school rejection created fear of intimacy', color: '#ec4899' },
  ];

  const createdNodes = [];
  for (const node of nodes) {
    const canvasNode = await prisma.canvasNode.create({
      data: {
        userId: demoUser.id,
        type: node.type,
        label: node.label,
        description: node.description,
        metadata: { color: node.color, size: 20 },
      },
    });
    createdNodes.push(canvasNode);
    console.log(`✅ Created node: ${node.label}`);
  }

  // Create canvas edges
  const edges = [
    // Entries to emotions
    { source: 0, target: 5, type: 'contains', weight: 0.9 },
    { source: 0, target: 6, type: 'contains', weight: 0.8 },
    { source: 1, target: 8, type: 'contains', weight: 0.9 },
    { source: 2, target: 7, type: 'contains', weight: 0.8 },
    { source: 3, target: 7, type: 'contains', weight: 0.7 },
    { source: 4, target: 5, type: 'contains', weight: 0.8 },
    
    // Emotions to themes
    { source: 5, target: 9, type: 'relates', weight: 0.9 },
    { source: 6, target: 9, type: 'relates', weight: 0.8 },
    { source: 7, target: 10, type: 'relates', weight: 0.9 },
    { source: 8, target: 11, type: 'relates', weight: 0.8 },
    
    // Themes to patterns
    { source: 9, target: 12, type: 'triggers', weight: 0.8 },
    { source: 10, target: 14, type: 'triggers', weight: 0.7 },
    { source: 11, target: 13, type: 'triggers', weight: 0.8 },
    
    // Patterns to root causes
    { source: 12, target: 15, type: 'caused_by', weight: 0.9 },
    { source: 13, target: 16, type: 'caused_by', weight: 0.8 },
    { source: 14, target: 16, type: 'caused_by', weight: 0.9 },
    { source: 13, target: 17, type: 'caused_by', weight: 0.7 },
  ];

  for (const edge of edges) {
    await prisma.canvasEdge.create({
      data: {
        userId: demoUser.id,
        sourceId: createdNodes[edge.source].id,
        targetId: createdNodes[edge.target].id,
        type: edge.type,
        weight: edge.weight,
      },
    });
  }
  console.log(`✅ Created ${edges.length} canvas edges`);

  console.log('\n🎉 Demo account seeding complete!');
  console.log('\n📧 Login credentials:');
  console.log('   Email: demo@cognitivecanvas.com');
  console.log('   Password: demo123');
  console.log('\n💡 This account includes:');
  console.log('   - 10 journal entries with rich, psychological content');
  console.log('   - 10 AI analyses of the entries');
  console.log('   - 4 detected behavioral patterns');
  console.log('   - 3 completed root cause analysis sessions');
  console.log('   - Interactive canvas with 18 nodes and 17 edges');
}

seedDemoAccount()
  .catch((e) => {
    console.error('❌ Error seeding demo account:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

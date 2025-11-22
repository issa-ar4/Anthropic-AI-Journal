import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const prisma = new PrismaClient();

async function seedAdvancedAccount() {
  console.log('🌱 Starting advanced account seeding...');

  // Create advanced user
  const hashedPassword = await bcrypt.hash('advanced123', 10);
  
  const advancedUser = await prisma.user.upsert({
    where: { email: 'advanced@cognitivecanvas.com' },
    update: {},
    create: {
      email: 'advanced@cognitivecanvas.com',
      password: hashedPassword,
      name: 'Advanced User',
    },
  });

  console.log('✅ Advanced user created:', advancedUser.email);

  // Create 60 journal entries with varied dates over 6 months
  const now = new Date();
  const entries = [];

  const journalTopics = [
    // Anxiety & Stress themes
    { title: 'Morning Anxiety', content: 'Woke up with racing thoughts about work deadlines. My chest feels tight and I can\'t seem to catch my breath. This overwhelming sense of dread about the day ahead is becoming a pattern.' },
    { title: 'Work Pressure', content: 'The project deadline is approaching and I feel completely overwhelmed. Every task seems insurmountable. I\'m working late nights but never feel like it\'s enough.' },
    { title: 'Panic Attack', content: 'Had a panic attack in the grocery store today. The crowds, the noise, everything felt like too much. I had to leave my cart and go sit in my car for 20 minutes to calm down.' },
    { title: 'Sunday Scaries', content: 'The weekend is ending and the dread of Monday is creeping in. Why do I feel this way every week? It\'s exhausting to constantly battle this anxiety.' },
    
    // Relationship themes
    { title: 'Communication Breakdown', content: 'Another argument with my partner about the same things. I feel like we\'re speaking different languages. I shut down when conflict arises, just like I did growing up.' },
    { title: 'Feeling Disconnected', content: 'Even when surrounded by people, I feel alone. There\'s this invisible wall I\'ve built around myself. I want connection but I\'m terrified of vulnerability.' },
    { title: 'Friend Cancellation', content: 'My friend cancelled plans again. Part of me is relieved - I won\'t have to mask how I\'m really feeling. But another part feels rejected and wonders if I\'m too much.' },
    { title: 'Dating Anxiety', content: 'First date tonight and I\'m spiraling. What if they don\'t like me? What if I say something stupid? Maybe I should just cancel.' },
    
    // Self-worth themes
    { title: 'Imposter Syndrome', content: 'Got praised at work today but I can\'t accept it. I feel like a fraud who\'s fooling everyone. Surely they\'ll discover I don\'t actually know what I\'m doing.' },
    { title: 'Comparing Myself', content: 'Scrolled through social media for hours. Everyone else seems to have it together. Their lives look perfect while mine feels like chaos. I know it\'s not real, but the comparison hurts.' },
    { title: 'Self-Criticism', content: 'Made a small mistake in a presentation and I can\'t let it go. I\'ve replayed that moment a hundred times. Why am I so hard on myself?' },
    { title: 'Body Image Struggle', content: 'Avoided looking in mirrors today. The critical voice in my head was especially loud. When did I start being so cruel to myself?' },
    
    // Depression themes
    { title: 'Can\'t Get Out of Bed', content: 'The alarm went off hours ago but I\'m still here. Everything feels pointless. Even basic tasks like showering seem impossible today.' },
    { title: 'Emotional Numbness', content: 'I don\'t feel sad or happy, just... empty. It\'s like I\'m watching life happen from behind glass. Nothing excites me anymore.' },
    { title: 'Lost Interest', content: 'Used to love painting but picked up a brush today and felt nothing. All my hobbies feel like chores now. Where did my passion go?' },
    { title: 'Crying Spell', content: 'Broke down crying in the shower for no apparent reason. Or maybe for every reason. The weight of everything just became too much.' },
    
    // Trauma processing
    { title: 'Nightmare Again', content: 'Same nightmare about childhood. Woke up sweating and disoriented. These memories won\'t leave me alone, even after all these years.' },
    { title: 'Triggered', content: 'A random smell today brought back a flood of memories I\'ve been trying to forget. My body remembered even though my mind tried to protect me.' },
    { title: 'Hypervigilance', content: 'Constantly on edge, scanning for danger that isn\'t there. My nervous system is stuck in fight-or-flight mode. I\'m exhausted from being this alert.' },
    
    // Growth moments
    { title: 'Small Victory', content: 'Actually spoke up in the meeting today. My voice shook but I did it. It felt terrifying and empowering at the same time.' },
    { title: 'Therapy Breakthrough', content: 'My therapist helped me connect some dots today. Realized my avoidance isn\'t protecting me, it\'s keeping me stuck. This is hard to accept but important.' },
    { title: 'Setting Boundaries', content: 'Said no to an extra project at work. Felt guilty immediately but also relieved. I\'m allowed to have limits.' },
    { title: 'Compassionate Moment', content: 'Caught myself in negative self-talk and actually challenged it. Asked myself "would I say this to a friend?" The answer was no.' },
    
    // Daily life struggles
    { title: 'Procrastination Loop', content: 'Spent the entire day avoiding the one important task I needed to do. Now it\'s midnight and I\'m filled with anxiety about tomorrow.' },
    { title: 'Decision Paralysis', content: 'Couldn\'t decide what to eat for lunch and ended up not eating. Why are simple decisions so overwhelming? Everything feels like it has huge consequences.' },
    { title: 'Overstimulated', content: 'Too much noise, too much light, too many people today. My nervous system is fried. Need to hide in a dark room and reset.' },
    { title: 'Exhausted', content: 'Slept 10 hours but still tired. This isn\'t physical exhaustion - it\'s emotional. Carrying all these feelings is draining.' },
  ];

  // Generate 60 entries spread across 180 days (6 months)
  for (let i = 0; i < 60; i++) {
    const daysAgo = Math.floor(Math.random() * 180);
    const topic = journalTopics[i % journalTopics.length];
    const entryDate = new Date(now);
    entryDate.setDate(entryDate.getDate() - daysAgo);
    entryDate.setHours(Math.floor(Math.random() * 24), Math.floor(Math.random() * 60));

    entries.push({
      userId: advancedUser.id,
      title: `${topic.title} ${i > journalTopics.length - 1 ? '(Day ' + Math.floor(i / journalTopics.length + 1) + ')' : ''}`,
      content: topic.content + (i % 3 === 0 ? '\n\nI notice this pattern keeps repeating. Maybe there\'s something deeper I need to explore.' : ''),
      createdAt: entryDate,
      updatedAt: entryDate,
    });
  }

  // Sort entries by date for realistic ordering
  entries.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

  await prisma.journalEntry.createMany({
    data: entries,
  });

  console.log(`✅ Created ${entries.length} journal entries`);

  // Create 10 root cause analysis sessions
  const sessions = [
    {
      initialEmotion: 'Anxiety about work presentation',
      status: 'completed',
      rootCause: 'Fear of judgment stems from childhood experiences where performance was tied to parental approval and love. The anxiety isn\'t really about the presentation - it\'s about feeling worthy of acceptance.',
      turnCount: 12,
      messages: [
        { role: 'user', content: 'I feel anxious about my work presentation tomorrow', timestamp: new Date(now.getTime() - 150 * 24 * 60 * 60 * 1000) },
        { role: 'assistant', content: 'I hear that you\'re feeling anxious about your presentation. Let\'s explore this together. What specifically about the presentation is causing you the most anxiety?', timestamp: new Date(now.getTime() - 150 * 24 * 60 * 60 * 1000) },
        { role: 'user', content: 'I keep thinking about what my colleagues will think if I mess up', timestamp: new Date(now.getTime() - 150 * 24 * 60 * 60 * 1000) },
        { role: 'assistant', content: 'The fear of your colleagues\' judgment seems central. When you imagine messing up, what\'s the worst thing you believe would happen?', timestamp: new Date(now.getTime() - 150 * 24 * 60 * 60 * 1000) },
        { role: 'user', content: 'They would think I\'m incompetent and don\'t deserve to be here', timestamp: new Date(now.getTime() - 150 * 24 * 60 * 60 * 1000) },
        { role: 'assistant', content: 'So there\'s a belief that a mistake would mean you don\'t deserve your position. When did you first start believing that mistakes equal unworthiness?', timestamp: new Date(now.getTime() - 150 * 24 * 60 * 60 * 1000) },
        { role: 'user', content: 'Probably in school... my parents only seemed proud when I got perfect grades', timestamp: new Date(now.getTime() - 150 * 24 * 60 * 60 * 1000) },
        { role: 'assistant', content: 'That\'s a significant connection. So your sense of being worthy of love and approval became tied to perfect performance. How does it feel to recognize that pattern?', timestamp: new Date(now.getTime() - 150 * 24 * 60 * 60 * 1000) },
      ],
      completedAt: new Date(now.getTime() - 150 * 24 * 60 * 60 * 1000),
    },
    {
      initialEmotion: 'Loneliness despite being around people',
      status: 'completed',
      rootCause: 'The loneliness comes from showing a false self to others while hiding authentic feelings. This protective mechanism developed as a response to early experiences where vulnerability was met with dismissal or criticism.',
      turnCount: 10,
      messages: [
        { role: 'user', content: 'I feel lonely even when I\'m with friends', timestamp: new Date(now.getTime() - 130 * 24 * 60 * 60 * 1000) },
        { role: 'assistant', content: 'That sounds painful - to be physically present with others but still feel alone. What do you think creates that sense of loneliness?', timestamp: new Date(now.getTime() - 130 * 24 * 60 * 60 * 1000) },
        { role: 'user', content: 'I never really share what I\'m actually feeling. I just go along with everything', timestamp: new Date(now.getTime() - 130 * 24 * 60 * 60 * 1000) },
        { role: 'assistant', content: 'So there\'s a part of you that stays hidden. What makes it unsafe to share your real feelings?', timestamp: new Date(now.getTime() - 130 * 24 * 60 * 60 * 1000) },
      ],
      completedAt: new Date(now.getTime() - 130 * 24 * 60 * 60 * 1000),
    },
    {
      initialEmotion: 'Overwhelming shame after small mistake',
      status: 'completed',
      rootCause: 'Perfectionism as a defense mechanism to prevent criticism. The intense shame response to mistakes is disproportionate because it activates deep beliefs about being fundamentally flawed.',
      turnCount: 11,
      messages: [
        { role: 'user', content: 'I made a typo in an email and I can\'t stop thinking about it', timestamp: new Date(now.getTime() - 110 * 24 * 60 * 60 * 1000) },
        { role: 'assistant', content: 'A typo seems like a small thing to be so distressed about. What does that typo mean to you?', timestamp: new Date(now.getTime() - 110 * 24 * 60 * 60 * 1000) },
      ],
      completedAt: new Date(now.getTime() - 110 * 24 * 60 * 60 * 1000),
    },
    {
      initialEmotion: 'Anger at partner for minor issue',
      status: 'completed',
      rootCause: 'The anger is displaced emotion from feeling unheard and invisible, patterns that originated in family dynamics where needs were consistently dismissed.',
      turnCount: 9,
      messages: [
        { role: 'user', content: 'My partner forgot to text me back and I\'m furious', timestamp: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000) },
        { role: 'assistant', content: 'That level of anger about a missed text suggests something deeper. What did it mean to you that they didn\'t text back?', timestamp: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000) },
      ],
      completedAt: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000),
    },
    {
      initialEmotion: 'Procrastination on important project',
      status: 'completed',
      rootCause: 'Procrastination is a form of self-sabotage rooted in fear of success and the responsibilities/expectations that come with it. Also serves to avoid potential failure - if you don\'t try your hardest, failure doesn\'t reflect your true capabilities.',
      turnCount: 13,
      messages: [
        { role: 'user', content: 'I keep putting off this project even though it\'s important', timestamp: new Date(now.getTime() - 70 * 24 * 60 * 60 * 1000) },
        { role: 'assistant', content: 'Procrastination often protects us from something. What might happen if you completed this project?', timestamp: new Date(now.getTime() - 70 * 24 * 60 * 60 * 1000) },
      ],
      completedAt: new Date(now.getTime() - 70 * 24 * 60 * 60 * 1000),
    },
    {
      initialEmotion: 'Exhaustion that sleep doesn\'t fix',
      status: 'completed',
      rootCause: 'Emotional exhaustion from constantly suppressing authentic emotions and maintaining a facade. The nervous system is depleted from chronic hypervigilance and people-pleasing.',
      turnCount: 10,
      messages: [
        { role: 'user', content: 'I\'m tired all the time no matter how much I sleep', timestamp: new Date(now.getTime() - 50 * 24 * 60 * 60 * 1000) },
        { role: 'assistant', content: 'This sounds like more than physical tiredness. What\'s exhausting about your daily life beyond the physical demands?', timestamp: new Date(now.getTime() - 50 * 24 * 60 * 60 * 1000) },
      ],
      completedAt: new Date(now.getTime() - 50 * 24 * 60 * 60 * 1000),
    },
    {
      initialEmotion: 'Social anxiety in group settings',
      status: 'completed',
      rootCause: 'Fear of authentic self-expression due to past experiences of ridicule or rejection. The anxiety protects against potential judgment by preventing genuine participation.',
      turnCount: 11,
      messages: [
        { role: 'user', content: 'I freeze up in group conversations and can\'t think of anything to say', timestamp: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) },
        { role: 'assistant', content: 'Freezing is your nervous system\'s response to perceived threat. What feels threatening about speaking in groups?', timestamp: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) },
      ],
      completedAt: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
    },
    {
      initialEmotion: 'Guilt about setting boundaries',
      status: 'completed',
      rootCause: 'Internalized belief that self-care is selfish, developed through experiences where personal needs were labeled as burdensome or unimportant.',
      turnCount: 8,
      messages: [
        { role: 'user', content: 'I said no to helping my friend move and I feel terrible', timestamp: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000) },
        { role: 'assistant', content: 'Guilt about saying no suggests a belief about what you "should" do. Where did you learn that your needs come second?', timestamp: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000) },
      ],
      completedAt: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000),
    },
    {
      initialEmotion: 'Jealousy of friend\'s success',
      status: 'completed',
      rootCause: 'Scarcity mindset where others\' success feels threatening to your own potential. Rooted in competitive family dynamics where love/attention felt limited.',
      turnCount: 12,
      messages: [
        { role: 'user', content: 'My friend got promoted and I should be happy but I just feel jealous', timestamp: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000) },
        { role: 'assistant', content: 'Jealousy often points to something we want for ourselves. What does their promotion represent to you?', timestamp: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000) },
      ],
      completedAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
    },
    {
      initialEmotion: 'Feeling stuck in life',
      status: 'completed',
      rootCause: 'Paralysis from trying to meet everyone else\'s expectations rather than identifying authentic desires. The "stuckness" is actually avoiding the risk of disappointing others by choosing your own path.',
      turnCount: 14,
      messages: [
        { role: 'user', content: 'I feel like my life isn\'t going anywhere', timestamp: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000) },
        { role: 'assistant', content: 'When you imagine your life "going somewhere," where would you want it to go? What direction feels right?', timestamp: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000) },
      ],
      completedAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
    },
  ];

  for (const sessionData of sessions) {
    const createdAt = sessionData.completedAt || new Date();
    await prisma.session.create({
      data: {
        userId: advancedUser.id,
        status: sessionData.status,
        initialEmotion: sessionData.initialEmotion,
        rootCause: sessionData.rootCause,
        turnCount: sessionData.turnCount,
        messages: sessionData.messages,
        metadata: {
          themes: ['self-worth', 'relationships', 'anxiety'],
          insights: ['Pattern recognition', 'Childhood connections'],
        },
        createdAt: createdAt,
        updatedAt: createdAt,
        completedAt: sessionData.completedAt,
      },
    });
  }

  console.log(`✅ Created ${sessions.length} root cause analysis sessions`);
  console.log('\n🎉 Advanced account seeding complete!');
  console.log('📧 Email: advanced@cognitivecanvas.com');
  console.log('🔑 Password: advanced123');
}

seedAdvancedAccount()
  .catch((e) => {
    console.error('❌ Error seeding advanced account:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

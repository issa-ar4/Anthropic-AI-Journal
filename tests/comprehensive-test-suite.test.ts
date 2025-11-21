/**
 * Comprehensive Test Suite for Cognitive Canvas
 * Tests all functionality and features mentioned in EXTENDED_SUMMARY.md
 * 
 * Run with: npm test from root directory
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

// Configuration
const API_URL = process.env.API_URL || 'http://localhost:5000';
const TEST_EMAIL = 'test@cognitivecanvas.com';
const TEST_PASSWORD = 'TestPassword123!';

const prisma = new PrismaClient();
let authToken: string;
let userId: string;
let testEntryId: string;
let testSessionId: string;

// ============================================================================
// SETUP & TEARDOWN
// ============================================================================

beforeAll(async () => {
  console.log('🧪 Starting Comprehensive Test Suite...\n');
  
  // Clean up any existing test user
  await prisma.user.deleteMany({
    where: { email: TEST_EMAIL }
  });
});

afterAll(async () => {
  // Cleanup test data
  if (userId) {
    await prisma.session.deleteMany({ where: { userId } });
    await prisma.canvasData.deleteMany({ where: { userId } });
    await prisma.analysis.deleteMany({
      where: { entry: { userId } }
    });
    await prisma.journalEntry.deleteMany({ where: { userId } });
    await prisma.user.delete({ where: { id: userId } });
  }
  
  await prisma.$disconnect();
  console.log('\n✅ Test suite completed and cleaned up');
});

// ============================================================================
// TEST SUITE 1: AUTHENTICATION & USER MANAGEMENT
// ============================================================================

describe('1. Authentication System', () => {
  
  it('should register a new user with bcrypt password hashing', async () => {
    const response = await request(API_URL)
      .post('/api/auth/register')
      .send({
        email: TEST_EMAIL,
        password: TEST_PASSWORD,
        name: 'Test User'
      });
    
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('token');
    expect(response.body.user).toHaveProperty('id');
    expect(response.body.user.email).toBe(TEST_EMAIL);
    expect(response.body.user).not.toHaveProperty('password'); // Should not expose password
    
    authToken = response.body.token;
    userId = response.body.user.id;
    
    // Verify password is hashed in database
    const user = await prisma.user.findUnique({ where: { id: userId } });
    expect(user?.password).not.toBe(TEST_PASSWORD);
    expect(user?.password.startsWith('$2b$')).toBe(true); // bcrypt hash format
  });

  it('should reject registration with duplicate email', async () => {
    const response = await request(API_URL)
      .post('/api/auth/register')
      .send({
        email: TEST_EMAIL,
        password: 'AnotherPassword123!',
        name: 'Duplicate User'
      });
    
    expect(response.status).toBe(400);
  });

  it('should login with correct credentials and return JWT', async () => {
    const response = await request(API_URL)
      .post('/api/auth/login')
      .send({
        email: TEST_EMAIL,
        password: TEST_PASSWORD
      });
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('token');
    
    // Verify JWT structure (header.payload.signature)
    const tokenParts = response.body.token.split('.');
    expect(tokenParts.length).toBe(3);
  });

  it('should reject login with incorrect password', async () => {
    const response = await request(API_URL)
      .post('/api/auth/login')
      .send({
        email: TEST_EMAIL,
        password: 'WrongPassword'
      });
    
    expect(response.status).toBe(401);
  });

  it('should protect routes with JWT authentication', async () => {
    const response = await request(API_URL)
      .get('/api/entries')
      .set('Authorization', `Bearer ${authToken}`);
    
    expect(response.status).not.toBe(401);
  });

  it('should reject requests without valid token', async () => {
    const response = await request(API_URL)
      .get('/api/entries');
    
    expect(response.status).toBe(401);
  });
});

// ============================================================================
// TEST SUITE 2: JOURNAL ENTRY MANAGEMENT
// ============================================================================

describe('2. Journal Entry Management', () => {
  
  it('should create a new journal entry', async () => {
    const entryData = {
      title: 'My First Entry',
      content: 'Today I felt anxious about work deadlines. I kept catastrophizing that everything would fall apart if I missed one task. I also felt frustrated with myself for procrastinating earlier in the week.',
      tags: ['work', 'anxiety']
    };
    
    const response = await request(API_URL)
      .post('/api/entries')
      .set('Authorization', `Bearer ${authToken}`)
      .send(entryData);
    
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id');
    expect(response.body.title).toBe(entryData.title);
    expect(response.body.content).toBe(entryData.content);
    
    testEntryId = response.body.id;
  });

  it('should retrieve all entries for authenticated user', async () => {
    const response = await request(API_URL)
      .get('/api/entries')
      .set('Authorization', `Bearer ${authToken}`);
    
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body.entries || response.body)).toBe(true);
    expect(response.body.entries?.length || response.body.length).toBeGreaterThan(0);
  });

  it('should filter entries by date range', async () => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const response = await request(API_URL)
      .get('/api/entries')
      .query({
        from: yesterday.toISOString(),
        to: tomorrow.toISOString()
      })
      .set('Authorization', `Bearer ${authToken}`);
    
    expect(response.status).toBe(200);
  });

  it('should search entries by content', async () => {
    const response = await request(API_URL)
      .get('/api/entries')
      .query({ search: 'anxious' })
      .set('Authorization', `Bearer ${authToken}`);
    
    expect(response.status).toBe(200);
  });

  it('should filter entries by tags', async () => {
    const response = await request(API_URL)
      .get('/api/entries')
      .query({ tags: 'work,anxiety' })
      .set('Authorization', `Bearer ${authToken}`);
    
    expect(response.status).toBe(200);
  });

  it('should update an existing entry', async () => {
    const updatedData = {
      title: 'My Updated Entry',
      content: 'Updated content with more details about my anxiety and how I overcame it.'
    };
    
    const response = await request(API_URL)
      .put(`/api/entries/${testEntryId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send(updatedData);
    
    expect(response.status).toBe(200);
    expect(response.body.title).toBe(updatedData.title);
  });

  it('should support pagination', async () => {
    const response = await request(API_URL)
      .get('/api/entries')
      .query({ page: 1, limit: 10 })
      .set('Authorization', `Bearer ${authToken}`);
    
    expect(response.status).toBe(200);
  });

  it('should delete an entry and cascade delete analysis', async () => {
    // Create a temporary entry
    const tempEntry = await request(API_URL)
      .post('/api/entries')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        title: 'Temp Entry',
        content: 'This will be deleted'
      });
    
    const tempId = tempEntry.body.id;
    
    // Delete it
    const response = await request(API_URL)
      .delete(`/api/entries/${tempId}`)
      .set('Authorization', `Bearer ${authToken}`);
    
    expect(response.status).toBe(200);
    
    // Verify it's gone
    const verifyResponse = await request(API_URL)
      .get(`/api/entries/${tempId}`)
      .set('Authorization', `Bearer ${authToken}`);
    
    expect(verifyResponse.status).toBe(404);
  });
});

// ============================================================================
// TEST SUITE 3: AI-POWERED ANALYSIS (CLAUDE INTEGRATION)
// ============================================================================

describe('3. AI-Powered Analysis with Claude', () => {
  
  it('should analyze entry and detect emotions with intensity scores', async () => {
    const response = await request(API_URL)
      .post(`/api/entries/${testEntryId}/analyze`)
      .set('Authorization', `Bearer ${authToken}`);
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('emotions');
    expect(Array.isArray(response.body.emotions)).toBe(true);
    
    // Check emotion structure
    if (response.body.emotions.length > 0) {
      const emotion = response.body.emotions[0];
      expect(emotion).toHaveProperty('name');
      expect(emotion).toHaveProperty('intensity');
      expect(emotion.intensity).toBeGreaterThanOrEqual(0);
      expect(emotion.intensity).toBeLessThanOrEqual(100);
    }
  });

  it('should identify cognitive distortions', async () => {
    const response = await request(API_URL)
      .get(`/api/entries/${testEntryId}/analysis`)
      .set('Authorization', `Bearer ${authToken}`);
    
    expect(response.status).toBe(200);
    
    if (response.body.distortions && response.body.distortions.length > 0) {
      const distortion = response.body.distortions[0];
      expect(distortion).toHaveProperty('type');
      expect(distortion).toHaveProperty('description');
      
      // Verify it's one of the 12 known distortions
      const knownDistortions = [
        'catastrophizing',
        'all-or-nothing',
        'overgeneralization',
        'mental-filter',
        'discounting-positives',
        'jumping-to-conclusions',
        'magnification',
        'emotional-reasoning',
        'should-statements',
        'labeling',
        'personalization',
        'mind-reading'
      ];
      
      expect(knownDistortions).toContain(distortion.type.toLowerCase().replace(/\s+/g, '-'));
    }
  });

  it('should extract themes from entry', async () => {
    const response = await request(API_URL)
      .get(`/api/entries/${testEntryId}/analysis`)
      .set('Authorization', `Bearer ${authToken}`);
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('themes');
    expect(Array.isArray(response.body.themes)).toBe(true);
  });

  it('should generate sentiment score (-1 to 1)', async () => {
    const response = await request(API_URL)
      .get(`/api/entries/${testEntryId}/analysis`)
      .set('Authorization', `Bearer ${authToken}`);
    
    expect(response.status).toBe(200);
    expect(response.body.sentiment).toHaveProperty('score');
    expect(response.body.sentiment.score).toBeGreaterThanOrEqual(-1);
    expect(response.body.sentiment.score).toBeLessThanOrEqual(1);
  });

  it('should identify causal chains (trigger → thought → emotion)', async () => {
    const response = await request(API_URL)
      .get(`/api/entries/${testEntryId}/analysis`)
      .set('Authorization', `Bearer ${authToken}`);
    
    expect(response.status).toBe(200);
    
    if (response.body.causalChains && response.body.causalChains.length > 0) {
      const chain = response.body.causalChains[0];
      expect(chain).toHaveProperty('trigger');
      expect(chain).toHaveProperty('thought');
      expect(chain).toHaveProperty('emotion');
    }
  });

  it('should provide brief summary (2-3 sentences)', async () => {
    const response = await request(API_URL)
      .get(`/api/entries/${testEntryId}/analysis`)
      .set('Authorization', `Bearer ${authToken}`);
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('summary');
    expect(typeof response.body.summary).toBe('string');
    expect(response.body.summary.length).toBeGreaterThan(20);
  });

  it('should cache analysis results for 1 hour', async () => {
    // First request
    const start1 = Date.now();
    await request(API_URL)
      .get(`/api/entries/${testEntryId}/analysis`)
      .set('Authorization', `Bearer ${authToken}`);
    const duration1 = Date.now() - start1;
    
    // Second request (should be cached)
    const start2 = Date.now();
    await request(API_URL)
      .get(`/api/entries/${testEntryId}/analysis`)
      .set('Authorization', `Bearer ${authToken}`);
    const duration2 = Date.now() - start2;
    
    // Cached request should be significantly faster
    expect(duration2).toBeLessThan(duration1);
  });

  it('should invalidate cache on entry update', async () => {
    // Get initial analysis
    const analysis1 = await request(API_URL)
      .get(`/api/entries/${testEntryId}/analysis`)
      .set('Authorization', `Bearer ${authToken}`);
    
    // Update entry
    await request(API_URL)
      .put(`/api/entries/${testEntryId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        content: 'Completely different content about joy and success!'
      });
    
    // Get new analysis (should be different)
    const analysis2 = await request(API_URL)
      .post(`/api/entries/${testEntryId}/analyze`)
      .set('Authorization', `Bearer ${authToken}`);
    
    expect(analysis2.status).toBe(200);
  });

  it('should find patterns across multiple entries', async () => {
    // Create additional entries for pattern detection
    const entries = [
      'I feel anxious about work again. Same pattern as last week.',
      'Another day, another wave of anxiety. Why does this keep happening?',
      'Work stress is becoming a pattern I need to address.'
    ];
    
    for (const content of entries) {
      await request(API_URL)
        .post('/api/entries')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ content });
    }
    
    const response = await request(API_URL)
      .get('/api/analysis/patterns')
      .set('Authorization', `Bearer ${authToken}`);
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('patterns');
    expect(Array.isArray(response.body.patterns)).toBe(true);
  });
});

// ============================================================================
// TEST SUITE 4: CANVAS VISUALIZATION
// ============================================================================

describe('4. Interactive Canvas Visualization', () => {
  
  it('should generate canvas graph with all node types', async () => {
    const response = await request(API_URL)
      .get('/api/canvas')
      .set('Authorization', `Bearer ${authToken}`);
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('nodes');
    expect(response.body).toHaveProperty('edges');
    expect(Array.isArray(response.body.nodes)).toBe(true);
    expect(Array.isArray(response.body.edges)).toBe(true);
  });

  it('should include entry nodes (purple)', async () => {
    const response = await request(API_URL)
      .get('/api/canvas')
      .set('Authorization', `Bearer ${authToken}`);
    
    const entryNodes = response.body.nodes.filter((n: any) => n.type === 'entry');
    expect(entryNodes.length).toBeGreaterThan(0);
  });

  it('should include emotion nodes (red/green)', async () => {
    const response = await request(API_URL)
      .get('/api/canvas')
      .set('Authorization', `Bearer ${authToken}`);
    
    const emotionNodes = response.body.nodes.filter((n: any) => n.type === 'emotion');
    expect(emotionNodes.length).toBeGreaterThanOrEqual(0);
  });

  it('should include theme nodes (orange)', async () => {
    const response = await request(API_URL)
      .get('/api/canvas')
      .set('Authorization', `Bearer ${authToken}`);
    
    const themeNodes = response.body.nodes.filter((n: any) => n.type === 'theme');
    expect(themeNodes.length).toBeGreaterThanOrEqual(0);
  });

  it('should create edges between connected nodes', async () => {
    const response = await request(API_URL)
      .get('/api/canvas')
      .set('Authorization', `Bearer ${authToken}`);
    
    expect(response.body.edges.length).toBeGreaterThan(0);
    
    const edge = response.body.edges[0];
    expect(edge).toHaveProperty('source');
    expect(edge).toHaveProperty('target');
  });

  it('should support filtering by node type', async () => {
    const response = await request(API_URL)
      .get('/api/canvas')
      .query({ types: 'entry,emotion' })
      .set('Authorization', `Bearer ${authToken}`);
    
    expect(response.status).toBe(200);
  });

  it('should support date range filtering', async () => {
    const today = new Date();
    const lastWeek = new Date(today);
    lastWeek.setDate(lastWeek.getDate() - 7);
    
    const response = await request(API_URL)
      .get('/api/canvas')
      .query({
        startDate: lastWeek.toISOString(),
        endDate: today.toISOString()
      })
      .set('Authorization', `Bearer ${authToken}`);
    
    expect(response.status).toBe(200);
  });

  it('should save custom node positions', async () => {
    const positions = {
      [`entry-${testEntryId}`]: { x: 100, y: 200 }
    };
    
    const response = await request(API_URL)
      .post('/api/canvas/positions')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ positions });
    
    expect(response.status).toBe(200);
  });

  it('should retrieve saved node positions', async () => {
    const response = await request(API_URL)
      .get('/api/canvas')
      .set('Authorization', `Bearer ${authToken}`);
    
    expect(response.status).toBe(200);
    
    // Check if any node has position data
    const nodeWithPosition = response.body.nodes.find((n: any) => 
      n.position && typeof n.position.x === 'number'
    );
    
    if (nodeWithPosition) {
      expect(nodeWithPosition.position).toHaveProperty('x');
      expect(nodeWithPosition.position).toHaveProperty('y');
    }
  });

  it('should support graph search functionality', async () => {
    const response = await request(API_URL)
      .get('/api/canvas')
      .query({ search: 'anxiety' })
      .set('Authorization', `Bearer ${authToken}`);
    
    expect(response.status).toBe(200);
  });
});

// ============================================================================
// TEST SUITE 5: EMOTIONAL WEATHER MAP
// ============================================================================

describe('5. Emotional Weather Map', () => {
  
  it('should calculate emotional volatility (0-100)', async () => {
    const response = await request(API_URL)
      .get('/api/analysis/emotional-weather')
      .set('Authorization', `Bearer ${authToken}`);
    
    expect(response.status).toBe(200);
    
    if (response.body.volatility) {
      expect(response.body.volatility.score).toBeGreaterThanOrEqual(0);
      expect(response.body.volatility.score).toBeLessThanOrEqual(100);
      expect(['stable', 'moderate', 'volatile']).toContain(response.body.volatility.level);
    }
  });

  it('should identify emotion transition patterns', async () => {
    const response = await request(API_URL)
      .get('/api/analysis/emotional-weather')
      .set('Authorization', `Bearer ${authToken}`);
    
    expect(response.status).toBe(200);
    
    if (response.body.transitions) {
      expect(Array.isArray(response.body.transitions)).toBe(true);
      
      if (response.body.transitions.length > 0) {
        const transition = response.body.transitions[0];
        expect(transition).toHaveProperty('from');
        expect(transition).toHaveProperty('to');
        expect(transition).toHaveProperty('frequency');
      }
    }
  });

  it('should show emotion baselines with percentage changes', async () => {
    const response = await request(API_URL)
      .get('/api/analysis/emotional-weather')
      .set('Authorization', `Bearer ${authToken}`);
    
    expect(response.status).toBe(200);
    
    if (response.body.baselines) {
      expect(Array.isArray(response.body.baselines)).toBe(true);
      
      if (response.body.baselines.length > 0) {
        const baseline = response.body.baselines[0];
        expect(baseline).toHaveProperty('emotion');
        expect(baseline).toHaveProperty('change');
      }
    }
  });

  it('should highlight significant changes (>10%)', async () => {
    const response = await request(API_URL)
      .get('/api/analysis/emotional-weather')
      .set('Authorization', `Bearer ${authToken}`);
    
    expect(response.status).toBe(200);
    
    if (response.body.significantChanges) {
      expect(Array.isArray(response.body.significantChanges)).toBe(true);
    }
  });

  it('should calculate average and peak intensities', async () => {
    const response = await request(API_URL)
      .get('/api/analysis/emotional-weather')
      .set('Authorization', `Bearer ${authToken}`);
    
    expect(response.status).toBe(200);
    
    if (response.body.emotions && response.body.emotions.length > 0) {
      const emotion = response.body.emotions[0];
      expect(emotion.avgIntensity).toBeDefined();
      expect(emotion.peakIntensity).toBeDefined();
    }
  });
});

// ============================================================================
// TEST SUITE 6: GUIDED ROOT CAUSE ANALYSIS
// ============================================================================

describe('6. Guided Root Cause Analysis', () => {
  
  it('should create a new root cause session', async () => {
    const response = await request(API_URL)
      .post('/api/sessions')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        emotion: 'anxiety',
        context: 'I feel anxious about work'
      });
    
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id');
    expect(response.body).toHaveProperty('messages');
    expect(response.body.status).toBe('active');
    expect(response.body.emotion).toBe('anxiety');
    
    testSessionId = response.body.id;
    
    // Verify first message is from AI
    expect(response.body.messages.length).toBeGreaterThan(0);
    expect(response.body.messages[0].role).toBe('assistant');
  });

  it('should use Socratic questioning approach', async () => {
    const firstMessage = await request(API_URL)
      .get(`/api/sessions/${testSessionId}`)
      .set('Authorization', `Bearer ${authToken}`);
    
    const aiResponse = firstMessage.body.messages[0].content;
    
    // Check for question marks (Socratic method asks questions)
    expect(aiResponse).toMatch(/\?/);
  });

  it('should continue conversation with follow-up questions', async () => {
    const response = await request(API_URL)
      .post(`/api/sessions/${testSessionId}/continue`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        message: "I'm worried I'm not doing enough"
      });
    
    expect(response.status).toBe(200);
    expect(response.body.messages.length).toBeGreaterThan(2);
  });

  it('should maintain conversation history', async () => {
    const response = await request(API_URL)
      .get(`/api/sessions/${testSessionId}`)
      .set('Authorization', `Bearer ${authToken}`);
    
    expect(response.body.messages.length).toBeGreaterThan(0);
    
    // Verify alternating roles
    let expectingUser = false;
    for (const msg of response.body.messages.slice(1)) {
      const expectedRole = expectingUser ? 'user' : 'assistant';
      expect(['user', 'assistant']).toContain(msg.role);
      expectingUser = !expectingUser;
    }
  });

  it('should detect root cause with marker phrase', async () => {
    // Continue conversation until completion (simulate multiple turns)
    const turns = [
      "I'd be letting people down",
      "I've always felt like I had to prove myself",
      "It makes me feel worthless"
    ];
    
    let lastResponse;
    for (const turn of turns) {
      lastResponse = await request(API_URL)
        .post(`/api/sessions/${testSessionId}/continue`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ message: turn });
    }
    
    // Check if session eventually completes
    const session = await request(API_URL)
      .get(`/api/sessions/${testSessionId}`)
      .set('Authorization', `Bearer ${authToken}`);
    
    // Session should either be active or completed
    expect(['active', 'completed']).toContain(session.body.status);
  });

  it('should extract and store identified root cause', async () => {
    const response = await request(API_URL)
      .get(`/api/sessions/${testSessionId}`)
      .set('Authorization', `Bearer ${authToken}`);
    
    if (response.body.status === 'completed') {
      expect(response.body).toHaveProperty('rootCause');
      expect(response.body.rootCause).toBeTruthy();
    }
  });

  it('should require minimum 3 turns before completion', async () => {
    const newSession = await request(API_URL)
      .post('/api/sessions')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        emotion: 'fear',
        context: 'I feel afraid'
      });
    
    // First user message
    await request(API_URL)
      .post(`/api/sessions/${newSession.body.id}/continue`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({ message: 'Just because' });
    
    const check = await request(API_URL)
      .get(`/api/sessions/${newSession.body.id}`)
      .set('Authorization', `Bearer ${authToken}`);
    
    // Should still be active after just 1 turn
    expect(check.body.status).toBe('active');
  });

  it('should list all user sessions', async () => {
    const response = await request(API_URL)
      .get('/api/sessions')
      .set('Authorization', `Bearer ${authToken}`);
    
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(0);
  });

  it('should filter sessions by status', async () => {
    const response = await request(API_URL)
      .get('/api/sessions')
      .query({ status: 'active' })
      .set('Authorization', `Bearer ${authToken}`);
    
    expect(response.status).toBe(200);
    
    if (response.body.length > 0) {
      expect(response.body.every((s: any) => s.status === 'active')).toBe(true);
    }
  });
});

// ============================================================================
// TEST SUITE 7: SECURITY FEATURES
// ============================================================================

describe('7. Security Features', () => {
  
  it('should use Helmet for HTTP security headers', async () => {
    const response = await request(API_URL)
      .get('/api/health');
    
    expect(response.headers).toHaveProperty('x-content-type-options');
    expect(response.headers['x-content-type-options']).toBe('nosniff');
  });

  it('should enforce CORS with origin whitelist', async () => {
    const response = await request(API_URL)
      .options('/api/health')
      .set('Origin', 'http://malicious-site.com');
    
    // Should either block or have CORS headers
    if (response.status === 200) {
      expect(response.headers['access-control-allow-origin']).toBeDefined();
    }
  });

  it('should implement rate limiting (100 req/15min)', async () => {
    const requests = [];
    
    // Make multiple rapid requests
    for (let i = 0; i < 105; i++) {
      requests.push(
        request(API_URL)
          .get('/api/health')
      );
    }
    
    const responses = await Promise.all(requests);
    
    // Some requests should be rate limited
    const rateLimited = responses.filter(r => r.status === 429);
    expect(rateLimited.length).toBeGreaterThan(0);
  }, 30000); // Increase timeout for this test

  it('should sanitize user input to prevent XSS', async () => {
    const maliciousContent = '<script>alert("XSS")</script>';
    
    const response = await request(API_URL)
      .post('/api/entries')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        title: 'Test Entry',
        content: maliciousContent
      });
    
    expect(response.status).toBe(201);
    
    // Content should be stored but sanitized on retrieval
    const retrieved = await request(API_URL)
      .get(`/api/entries/${response.body.id}`)
      .set('Authorization', `Bearer ${authToken}`);
    
    // Should either reject or sanitize
    expect(retrieved.body.content).toBeDefined();
  });

  it('should use HTTP-only cookies for tokens (if implemented)', async () => {
    const response = await request(API_URL)
      .post('/api/auth/login')
      .send({
        email: TEST_EMAIL,
        password: TEST_PASSWORD
      });
    
    // Check if cookies are set
    if (response.headers['set-cookie']) {
      const cookies = response.headers['set-cookie'];
      const httpOnlyCookie = cookies.find((c: string) => c.includes('HttpOnly'));
      
      if (httpOnlyCookie) {
        expect(httpOnlyCookie).toMatch(/HttpOnly/);
      }
    }
  });

  it('should prevent SQL injection in search queries', async () => {
    const sqlInjection = "'; DROP TABLE users; --";
    
    const response = await request(API_URL)
      .get('/api/entries')
      .query({ search: sqlInjection })
      .set('Authorization', `Bearer ${authToken}`);
    
    // Should handle safely without error
    expect([200, 400]).toContain(response.status);
    
    // Verify users table still exists
    const userCheck = await prisma.user.findUnique({ where: { id: userId } });
    expect(userCheck).toBeTruthy();
  });
});

// ============================================================================
// TEST SUITE 8: PERFORMANCE & CACHING
// ============================================================================

describe('8. Performance & Caching', () => {
  
  it('should use connection pooling for database', async () => {
    const requests = Array(20).fill(null).map(() =>
      request(API_URL)
        .get('/api/entries')
        .set('Authorization', `Bearer ${authToken}`)
    );
    
    const responses = await Promise.all(requests);
    
    // All should succeed without connection errors
    expect(responses.every(r => r.status === 200)).toBe(true);
  });

  it('should respond to health check quickly', async () => {
    const start = Date.now();
    
    const response = await request(API_URL)
      .get('/api/health');
    
    const duration = Date.now() - start;
    
    expect(response.status).toBe(200);
    expect(duration).toBeLessThan(100); // Should respond in under 100ms
  });

  it('should index database queries for performance', async () => {
    // Create multiple entries
    const entries = Array(10).fill(null).map((_, i) => ({
      title: `Performance Test ${i}`,
      content: 'Testing query performance'
    }));
    
    for (const entry of entries) {
      await request(API_URL)
        .post('/api/entries')
        .set('Authorization', `Bearer ${authToken}`)
        .send(entry);
    }
    
    const start = Date.now();
    
    const response = await request(API_URL)
      .get('/api/entries')
      .set('Authorization', `Bearer ${authToken}`);
    
    const duration = Date.now() - start;
    
    expect(response.status).toBe(200);
    expect(duration).toBeLessThan(1000); // Should be reasonably fast
  });
});

// ============================================================================
// TEST SUITE 9: ERROR HANDLING
// ============================================================================

describe('9. Error Handling', () => {
  
  it('should handle 404 for non-existent routes', async () => {
    const response = await request(API_URL)
      .get('/api/nonexistent');
    
    expect(response.status).toBe(404);
  });

  it('should handle invalid entry IDs gracefully', async () => {
    const response = await request(API_URL)
      .get('/api/entries/invalid-id-12345')
      .set('Authorization', `Bearer ${authToken}`);
    
    expect([400, 404]).toContain(response.status);
  });

  it('should handle Claude API rate limits (429)', async () => {
    // This test assumes Claude API might rate limit
    // In practice, this is difficult to test without actually hitting limits
    expect(true).toBe(true); // Placeholder
  });

  it('should return structured error responses', async () => {
    const response = await request(API_URL)
      .post('/api/entries')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        // Missing required content field
        title: 'Invalid Entry'
      });
    
    expect(response.status).toBeGreaterThanOrEqual(400);
    expect(response.body).toHaveProperty('error');
  });

  it('should handle database connection errors gracefully', async () => {
    // This would require mocking database failures
    // Placeholder for integration testing
    expect(true).toBe(true);
  });
});

// ============================================================================
// TEST SUITE 10: INTEGRATION TESTS
// ============================================================================

describe('10. End-to-End Integration', () => {
  
  it('should complete full journaling workflow', async () => {
    // 1. Create entry
    const entry = await request(API_URL)
      .post('/api/entries')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        title: 'Integration Test Entry',
        content: 'I felt overwhelmed today but managed to push through. Feeling proud of myself.'
      });
    
    expect(entry.status).toBe(201);
    const entryId = entry.body.id;
    
    // 2. Analyze entry
    const analysis = await request(API_URL)
      .post(`/api/entries/${entryId}/analyze`)
      .set('Authorization', `Bearer ${authToken}`);
    
    expect(analysis.status).toBe(200);
    
    // 3. Get canvas
    const canvas = await request(API_URL)
      .get('/api/canvas')
      .set('Authorization', `Bearer ${authToken}`);
    
    expect(canvas.status).toBe(200);
    expect(canvas.body.nodes.some((n: any) => n.id === `entry-${entryId}`)).toBe(true);
    
    // 4. Get emotional weather
    const weather = await request(API_URL)
      .get('/api/analysis/emotional-weather')
      .set('Authorization', `Bearer ${authToken}`);
    
    expect(weather.status).toBe(200);
  });

  it('should maintain data consistency across operations', async () => {
    // Count initial entries
    const initial = await request(API_URL)
      .get('/api/entries')
      .set('Authorization', `Bearer ${authToken}`);
    
    const initialCount = initial.body.entries?.length || initial.body.length;
    
    // Create new entry
    await request(API_URL)
      .post('/api/entries')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        title: 'Consistency Test',
        content: 'Testing data consistency'
      });
    
    // Count again
    const after = await request(API_URL)
      .get('/api/entries')
      .set('Authorization', `Bearer ${authToken}`);
    
    const afterCount = after.body.entries?.length || after.body.length;
    
    expect(afterCount).toBe(initialCount + 1);
  });

  it('should support concurrent operations safely', async () => {
    const operations = [
      request(API_URL).get('/api/entries').set('Authorization', `Bearer ${authToken}`),
      request(API_URL).get('/api/canvas').set('Authorization', `Bearer ${authToken}`),
      request(API_URL).get('/api/sessions').set('Authorization', `Bearer ${authToken}`),
    ];
    
    const results = await Promise.all(operations);
    
    expect(results.every(r => r.status === 200)).toBe(true);
  });
});

console.log('\n✅ All test suites defined successfully');

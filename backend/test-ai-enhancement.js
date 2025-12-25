/**
 * Simple test script for AI Enhancement functionality
 * Run with: node test-ai-enhancement.js
 */

const { gemini } = require('./dist/shared/clients/gemini');

async function testTitleEnhancement() {
  console.log('🧪 Testing Title Enhancement...');

  const originalTitle = 'Food Tracker App';
  const context = {
    category: 'mobile',
    difficulty: 'beginner',
    skills: ['React Native', 'Firebase'],
    description: 'An app to track food waste on campus',
  };

  try {
    // Analyze the input title to create a more targeted prompt
    const titleWords = originalTitle.toLowerCase().split(' ');
    const hasApp = titleWords.some((word) => ['app', 'application', 'mobile'].includes(word));
    const hasTracker = titleWords.some((word) =>
      ['track', 'tracker', 'monitor', 'log'].includes(word)
    );

    let specificGuidance = '';
    if (hasApp && hasTracker) {
      specificGuidance =
        'Focus on the tracking functionality and mobile user experience. Make it sound innovative and user-friendly for campus food management.';
    }

    const prompt = `Analyze and enhance this hackathon idea title based on its specific content and context.

Original Title: "${originalTitle}"

Context:
- Category: ${context.category}
- Difficulty: ${context.difficulty}
- Skills: ${context.skills.join(', ')}
- Description: ${context.description}

Analysis Instructions:
${specificGuidance}

Enhancement Requirements:
- Create a completely new, enhanced title that captures the essence better
- Keep it concise (under 80 characters)
- Make it more specific and actionable based on the actual content
- Ensure it's catchy and memorable for the target audience
- Maintain the original concept but make it more compelling
- Make it suitable for a hackathon project
- Use plain text only - NO special characters, NO markdown formatting
- Make it professional but exciting
- Consider the category (${context.category}) and difficulty (${context.difficulty})

Provide:
1. One enhanced title that directly improves upon the original
2. Three alternative title suggestions that take different approaches

Format your response as JSON:
{
  "enhanced": "Enhanced title here",
  "suggestions": ["Alternative 1", "Alternative 2", "Alternative 3"]
}`;

    const response = await gemini.generateJSON(prompt, {
      config: {
        temperature: 0.7,
        maxOutputTokens: 200,
      },
    });

    console.log('✅ Title Enhancement Result:');
    console.log('Original:', originalTitle);
    console.log('Enhanced:', response.enhanced);
    console.log('Suggestions:', response.suggestions);
    console.log('');
  } catch (error) {
    console.error('❌ Title Enhancement Failed:', error.message);
  }
}

async function testDescriptionEnhancement() {
  console.log('🧪 Testing Advanced Description Enhancement...');

  const originalDescription =
    'An app to track food waste on campus and help students find sustainable dining options.';
  const context = {
    title: 'Sustainable Campus Food Tracker',
    category: 'mobile',
    difficulty: 'beginner',
    skills: ['React Native', 'Firebase', 'UI/UX Design'],
  };

  try {
    // Simulate the deep content analysis
    const descLower = originalDescription.toLowerCase();
    const words = descLower.split(/\s+/);
    const sentences = originalDescription.split(/[.!?]+/).filter((s) => s.trim().length > 0);

    // Content analysis results
    const hasProblemStatement =
      /\b(problem|issue|challenge|difficulty|struggle|pain\s*point|bottleneck|obstacle)\b/i.test(
        originalDescription
      );
    const hasTechDetails =
      /\b(api|database|server|frontend|backend|framework|library|algorithm|architecture)\b/i.test(
        originalDescription
      );
    const hasImpact =
      /\b(impact|benefit|improve|better|efficient|effective|optimize|enhance|streamline)\b/i.test(
        originalDescription
      );

    // Identify dominant domain
    const environmentKeywords =
      originalDescription.match(
        /\b(environment|green|sustainable|eco|climate|carbon|waste|energy|renewable)\b/gi
      ) || [];
    const dominantDomain = environmentKeywords.length > 0 ? 'environment' : 'general';

    // Determine content gaps
    const contentGaps = [];
    if (!hasProblemStatement) contentGaps.push('problem_definition');
    if (!hasTechDetails) contentGaps.push('technical_implementation');
    if (!hasImpact) contentGaps.push('impact_articulation');

    const contentComplexity = originalDescription.length < 100 ? 'brief' : 'moderate';
    const enhancementStrategy =
      contentGaps.length >= 3 ? 'targeted_enhancement' : 'refinement_and_polish';

    console.log('📊 Content Analysis:');
    console.log('- Length:', originalDescription.length, 'characters');
    console.log('- Sentences:', sentences.length);
    console.log('- Complexity:', contentComplexity);
    console.log('- Dominant Domain:', dominantDomain);
    console.log('- Content Gaps:', contentGaps.join(', ') || 'None');
    console.log('- Strategy:', enhancementStrategy);
    console.log('');

    const prompt = `Analyze and intelligently enhance this hackathon idea description based on deep content analysis and contextual understanding.

ORIGINAL DESCRIPTION: "${originalDescription}"

Context:
- Title: ${context.title}
- Category: ${context.category}
- Difficulty: ${context.difficulty}
- Skills: ${context.skills.join(', ')}

CONTENT ANALYSIS RESULTS:
- Content Complexity: ${contentComplexity} (${originalDescription.length} chars, ${sentences.length} sentences)
- Dominant Domain Theme: ${dominantDomain}
- Content Gaps: ${contentGaps.join(', ') || 'None identified'}
- Enhancement Strategy: ${enhancementStrategy}

ENHANCEMENT INSTRUCTIONS:
The description needs enhancement in: ${contentGaps.join(', ')}. Focus on filling these specific gaps while preserving the sustainability focus.

CATEGORY-SPECIFIC FOCUS:
Focus on mobile-first design, user experience, offline capabilities, and platform-specific features. Mention cross-platform compatibility if relevant. Additionally, since this appears to be environment-focused: Emphasize sustainability metrics, environmental impact, carbon footprint reduction, and green technology.

TECHNICAL IMPLEMENTATION GUIDANCE:
Integrate specific technical implementation details using React Native, Firebase, UI/UX Design. Explain the architecture, data flow, and how these technologies work together to solve the problem.

DIFFICULTY & SCOPE GUIDANCE:
Ensure the technical scope is achievable for beginners within 24-48 hours. Focus on proven technologies and straightforward implementation approaches.

ENHANCEMENT REQUIREMENTS:
1. Create a completely new, enhanced description that incorporates and improves upon the original content
2. Address the identified content gaps while preserving existing strengths
3. Follow the ${enhancementStrategy} approach based on the content analysis
4. Structure the response as: Problem Context → Solution Approach → Technical Implementation → Key Features → Expected Impact
5. Use plain text only - NO markdown formatting, NO asterisks, NO bold text
6. Keep it hackathon-appropriate (2-4 paragraphs, 300-600 words)
7. Make it compelling for both technical team members and non-technical judges
8. Ensure technical details match the specified skills and difficulty level
9. Incorporate domain-specific terminology and concepts where relevant
10. Maintain the original concept's core value proposition while significantly enhancing its presentation

Format your response as JSON:
{
  "enhanced": "Complete enhanced description here in plain text that follows all requirements...",
  "suggestions": ["Specific improvement 1 based on analysis", "Specific improvement 2 based on analysis", "Specific improvement 3 based on analysis"]
}`;

    const response = await gemini.generateJSON(prompt, {
      config: {
        temperature: 0.7,
        maxOutputTokens: 800,
      },
    });

    console.log('✅ Advanced Description Enhancement Result:');
    console.log('Original:', originalDescription);
    console.log('Enhanced:', response.enhanced);
    console.log('Suggestions:', response.suggestions);
    console.log('');
  } catch (error) {
    console.error('❌ Description Enhancement Failed:', error.message);
  }
}

async function runTests() {
  console.log('🚀 Starting AI Enhancement Tests...\n');

  // Check if Gemini API key is configured
  if (!process.env.GEMINI_API_KEY) {
    console.error('❌ GEMINI_API_KEY not found in environment variables');
    console.log('Please add GEMINI_API_KEY to your .env file');
    process.exit(1);
  }

  await testTitleEnhancement();
  await testDescriptionEnhancement();

  console.log('✅ All tests completed!');
}

// Load environment variables
require('dotenv').config();

// Run tests
runTests().catch(console.error);

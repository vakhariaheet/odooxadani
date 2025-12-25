/**
 * AI Enhancement Handler
 * Provides AI-powered enhancement for idea titles and descriptions
 */

import { APIGatewayProxyHandler } from 'aws-lambda';
import { successResponse, errorResponse } from '../../../shared/response';
import { createLogger } from '../../../shared/logger';
import { gemini } from '../../../shared/clients/gemini';
import { z } from 'zod';

const logger = createLogger('EnhanceIdeaHandler');

// Request validation schema
const enhanceRequestSchema = z.object({
  type: z.enum(['title', 'description']),
  content: z.string().min(1, 'Content is required').max(2000, 'Content too long'),
  context: z
    .object({
      title: z.string().optional(),
      description: z.string().optional(),
      category: z.string().optional(),
      difficulty: z.string().optional(),
      skills: z.array(z.string()).optional(),
    })
    .optional(),
});

type EnhanceRequest = z.infer<typeof enhanceRequestSchema>;

interface EnhanceResponse {
  originalContent: string;
  enhancedContent: string;
  suggestions: string[];
}

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    logger.info('AI Enhancement request received', {
      method: event.httpMethod,
      path: event.path,
    });

    // Validate request method
    if (event.httpMethod !== 'POST') {
      return errorResponse('METHOD_NOT_ALLOWED', 'Method not allowed', 405);
    }

    // Parse and validate request body
    if (!event.body) {
      return errorResponse('BAD_REQUEST', 'Request body is required', 400);
    }

    let requestData: EnhanceRequest;
    try {
      const parsedBody = JSON.parse(event.body);
      requestData = enhanceRequestSchema.parse(parsedBody);
    } catch (error) {
      logger.warn('Invalid request body', error);
      return errorResponse('BAD_REQUEST', 'Invalid request format', 400);
    }

    const { type, content, context } = requestData;

    logger.debug('Processing enhancement request', {
      type,
      contentLength: content.length,
      hasContext: !!context,
    });

    let enhancedContent: string;
    let suggestions: string[] = [];

    if (type === 'title') {
      const result = await enhanceTitle(content, context);
      enhancedContent = result.enhanced;
      suggestions = result.suggestions;
    } else {
      const result = await enhanceDescription(content, context);
      enhancedContent = result.enhanced;
      suggestions = result.suggestions;
    }

    const response: EnhanceResponse = {
      originalContent: content,
      enhancedContent,
      suggestions,
    };

    logger.info('AI Enhancement completed successfully', {
      type,
      originalLength: content.length,
      enhancedLength: enhancedContent.length,
      suggestionsCount: suggestions.length,
    });

    return successResponse({
      success: true,
      data: response,
    });
  } catch (error) {
    logger.error('AI Enhancement failed', error);
    return errorResponse('INTERNAL_SERVER_ERROR', 'Failed to enhance content', 500);
  }
};

/**
 * Enhance idea title using AI
 */
async function enhanceTitle(
  title: string,
  context?: EnhanceRequest['context']
): Promise<{ enhanced: string; suggestions: string[] }> {
  try {
    const contextInfo = context
      ? `
Context:
- Category: ${context.category || 'Not specified'}
- Difficulty: ${context.difficulty || 'Not specified'}
- Skills: ${context.skills?.join(', ') || 'Not specified'}
- Description: ${context.description ? context.description.substring(0, 200) + '...' : 'Not provided'}
`
      : '';

    // Analyze the input title to create a more targeted prompt
    const titleWords = title.toLowerCase().split(' ');
    const hasApp = titleWords.some((word) => ['app', 'application', 'mobile'].includes(word));
    const hasWeb = titleWords.some((word) => ['web', 'website', 'platform', 'site'].includes(word));
    const hasAI = titleWords.some((word) =>
      ['ai', 'artificial', 'intelligence', 'smart', 'ml', 'machine'].includes(word)
    );
    const hasGame = titleWords.some((word) => ['game', 'gaming', 'play', 'arcade'].includes(word));
    const hasTracker = titleWords.some((word) =>
      ['track', 'tracker', 'monitor', 'log'].includes(word)
    );
    const hasSystem = titleWords.some((word) =>
      ['system', 'management', 'manager', 'tool'].includes(word)
    );

    let specificGuidance = '';
    if (hasApp || hasWeb) {
      specificGuidance =
        'Focus on the user experience and key functionality. Make it sound innovative and user-friendly.';
    } else if (hasAI) {
      specificGuidance =
        'Emphasize the intelligent features and how AI solves the problem. Make it sound cutting-edge but practical.';
    } else if (hasGame) {
      specificGuidance =
        'Highlight the interactive and engaging aspects. Make it sound fun and compelling for players.';
    } else if (hasTracker || hasSystem) {
      specificGuidance =
        'Focus on efficiency, organization, and problem-solving capabilities. Make it sound professional and useful.';
    } else {
      specificGuidance =
        'Identify the core value proposition and make it more compelling and specific to the problem it solves.';
    }

    const prompt = `Analyze and enhance this hackathon idea title based on its specific content and context.

Original Title: "${title}"
${contextInfo}

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
- Consider the category (${context?.category || 'general'}) and difficulty (${context?.difficulty || 'intermediate'})

Provide:
1. One enhanced title that directly improves upon the original
2. Three alternative title suggestions that take different approaches

Format your response as JSON:
{
  "enhanced": "Enhanced title here",
  "suggestions": ["Alternative 1", "Alternative 2", "Alternative 3"]
}`;

    const response = await gemini.generateJSON<{
      enhanced: string;
      suggestions: string[];
    }>(prompt, {
      config: {
        temperature: 0.7,
        maxOutputTokens: 200,
      },
    });

    // Clean any special characters or markdown from titles
    const cleanTitle = (str: string) =>
      str
        ?.replace(/[*_`#]/g, '') // Remove markdown characters
        ?.replace(/[^\w\s-]/g, '') // Remove special characters except hyphens
        ?.trim();

    return {
      enhanced: cleanTitle(response.enhanced) || title,
      suggestions: response.suggestions?.map(cleanTitle).filter(Boolean) || [],
    };
  } catch (error) {
    logger.warn('Title enhancement failed, using original', error);
    return {
      enhanced: title,
      suggestions: [],
    };
  }
}

/**
 * Enhance idea description using AI
 */
async function enhanceDescription(
  description: string,
  context?: EnhanceRequest['context']
): Promise<{ enhanced: string; suggestions: string[] }> {
  try {
    const contextInfo = context
      ? `
Context:
- Title: ${context.title || 'Not specified'}
- Category: ${context.category || 'Not specified'}
- Difficulty: ${context.difficulty || 'Not specified'}
- Skills: ${context.skills?.join(', ') || 'Not specified'}
`
      : '';

    // Deep content analysis for intelligent enhancement
    const descLower = description.toLowerCase();
    const sentences = description.split(/[.!?]+/).filter((s) => s.trim().length > 0);

    // Analyze content structure and themes
    const contentAnalysis = {
      // Problem identification
      hasProblemStatement:
        /\b(problem|issue|challenge|difficulty|struggle|pain\s*point|bottleneck|obstacle)\b/i.test(
          descLower
        ),
      problemKeywords:
        descLower.match(
          /\b(problem|issue|challenge|difficulty|struggle|pain\s*point|bottleneck|obstacle)\b/gi
        ) || [],

      // Solution identification
      hasSolutionStatement: /\b(solution|solve|fix|address|help|resolve|tackle|overcome)\b/i.test(
        descLower
      ),
      solutionKeywords:
        descLower.match(/\b(solution|solve|fix|address|help|resolve|tackle|overcome)\b/gi) || [],

      // Technical details
      hasTechDetails:
        /\b(api|database|server|frontend|backend|framework|library|algorithm|architecture)\b/i.test(
          descLower
        ),
      techKeywords:
        descLower.match(
          /\b(api|database|server|frontend|backend|framework|library|algorithm|architecture|react|node|python|javascript|firebase|mongodb|aws|docker)\b/gi
        ) || [],

      // User focus
      hasUserFocus:
        /\b(user|users|people|students|community|customers|clients|audience|participants)\b/i.test(
          descLower
        ),
      userKeywords:
        descLower.match(
          /\b(user|users|people|students|community|customers|clients|audience|participants)\b/gi
        ) || [],

      // Features and functionality
      hasFeatures:
        /\b(feature|features|functionality|capabilities|functions|tools|options)\b/i.test(
          descLower
        ),
      featureKeywords:
        descLower.match(
          /\b(feature|features|functionality|capabilities|functions|tools|options)\b/gi
        ) || [],

      // Impact and benefits
      hasImpact:
        /\b(impact|benefit|improve|better|efficient|effective|optimize|enhance|streamline)\b/i.test(
          descLower
        ),
      impactKeywords:
        descLower.match(
          /\b(impact|benefit|improve|better|efficient|effective|optimize|enhance|streamline)\b/gi
        ) || [],

      // Implementation approach
      hasImplementation:
        /\b(build|develop|create|implement|design|construct|using|with|through)\b/i.test(descLower),
      implementationKeywords:
        descLower.match(
          /\b(build|develop|create|implement|design|construct|using|with|through)\b/gi
        ) || [],

      // Domain-specific analysis
      domainKeywords: {
        healthcare:
          descLower.match(
            /\b(health|medical|patient|doctor|hospital|clinic|treatment|diagnosis|medicine|wellness)\b/gi
          ) || [],
        education:
          descLower.match(
            /\b(learn|education|student|teacher|school|university|course|study|knowledge|skill)\b/gi
          ) || [],
        finance:
          descLower.match(
            /\b(money|payment|bank|finance|transaction|budget|investment|crypto|blockchain)\b/gi
          ) || [],
        social:
          descLower.match(
            /\b(social|community|connect|share|network|friend|group|collaboration)\b/gi
          ) || [],
        environment:
          descLower.match(
            /\b(environment|green|sustainable|eco|climate|carbon|waste|energy|renewable)\b/gi
          ) || [],
        productivity:
          descLower.match(
            /\b(productivity|efficient|organize|manage|schedule|task|workflow|automation)\b/gi
          ) || [],
        entertainment:
          descLower.match(/\b(game|fun|entertainment|play|music|video|art|creative|media)\b/gi) ||
          [],
      },
    };

    // Identify the strongest domain theme
    const dominantDomain = Object.entries(contentAnalysis.domainKeywords).reduce(
      (max, [domain, keywords]) =>
        keywords.length > max.count ? { domain, count: keywords.length } : max,
      { domain: 'general', count: 0 }
    ).domain;

    // Analyze content gaps and strengths
    const contentGaps = [];
    const contentStrengths = [];

    if (!contentAnalysis.hasProblemStatement) contentGaps.push('problem_definition');
    else contentStrengths.push('problem_identification');

    if (!contentAnalysis.hasSolutionStatement) contentGaps.push('solution_approach');
    else contentStrengths.push('solution_clarity');

    if (!contentAnalysis.hasTechDetails) contentGaps.push('technical_implementation');
    else contentStrengths.push('technical_specificity');

    if (!contentAnalysis.hasUserFocus) contentGaps.push('user_targeting');
    else contentStrengths.push('user_awareness');

    if (!contentAnalysis.hasFeatures) contentGaps.push('feature_definition');
    else contentStrengths.push('feature_clarity');

    if (!contentAnalysis.hasImpact) contentGaps.push('impact_articulation');
    else contentStrengths.push('impact_awareness');

    if (!contentAnalysis.hasImplementation) contentGaps.push('implementation_plan');
    else contentStrengths.push('implementation_clarity');

    // Determine content complexity and enhancement strategy
    const contentComplexity =
      description.length < 100 ? 'brief' : description.length < 300 ? 'moderate' : 'detailed';

    const sentenceComplexity =
      sentences.length < 2 ? 'simple' : sentences.length < 5 ? 'structured' : 'complex';

    // Generate enhancement strategy based on analysis
    let enhancementStrategy = '';
    let structuralGuidance = '';
    let contentFocus = '';

    // Strategy based on content gaps
    if (contentGaps.length >= 5) {
      enhancementStrategy = 'comprehensive_expansion';
      structuralGuidance =
        'The description needs significant expansion across all key areas. Build a complete narrative from problem to solution to implementation.';
    } else if (contentGaps.length >= 3) {
      enhancementStrategy = 'targeted_enhancement';
      structuralGuidance = `The description has good foundation but needs enhancement in: ${contentGaps.join(', ')}. Focus on filling these specific gaps.`;
    } else if (contentGaps.length >= 1) {
      enhancementStrategy = 'refinement_and_polish';
      structuralGuidance = `The description is well-developed but could benefit from: ${contentGaps.join(', ')}. Polish and refine the existing content.`;
    } else {
      enhancementStrategy = 'optimization_and_clarity';
      structuralGuidance =
        'The description covers all key areas. Focus on improving clarity, flow, and impact while maintaining the comprehensive coverage.';
    }

    // Content focus based on dominant domain and category
    const categoryDomainMap = {
      ai: 'Focus on machine learning algorithms, data processing, intelligent automation, and how AI provides superior solutions compared to traditional approaches.',
      mobile:
        'Emphasize mobile-first design, cross-platform compatibility, offline functionality, push notifications, and mobile-specific user experience patterns.',
      web: 'Highlight responsive design, real-time features, scalable architecture, modern web standards, progressive web app capabilities, and browser compatibility.',
      blockchain:
        'Detail decentralized architecture, smart contracts, consensus mechanisms, tokenomics, transparency benefits, and how blockchain solves trust issues.',
      iot: 'Describe sensor integration, connectivity protocols, edge computing, real-time data collection, hardware-software interaction, and physical world integration.',
      gaming:
        'Explain gameplay mechanics, user engagement strategies, graphics/audio elements, multiplayer features, progression systems, and what makes it addictive.',
      fintech:
        'Address regulatory compliance, security measures, payment processing, financial APIs, risk management, and how it improves financial accessibility.',
      healthtech:
        'Focus on patient outcomes, medical accuracy, HIPAA compliance, clinical workflows, evidence-based features, and healthcare provider integration.',
      edtech:
        'Emphasize learning outcomes, pedagogical approaches, student engagement, progress tracking, adaptive learning, and measurable educational impact.',
      other:
        'Provide domain-specific technical details and explain the unique value proposition within the identified domain.',
    };

    contentFocus =
      categoryDomainMap[context?.category as keyof typeof categoryDomainMap] ||
      categoryDomainMap.other;

    // Domain-specific enhancement based on detected themes
    if (dominantDomain !== 'general') {
      const domainEnhancements = {
        healthcare:
          'Emphasize patient safety, clinical validation, regulatory considerations, and measurable health outcomes.',
        education:
          'Focus on learning theory, student engagement, knowledge retention, and educational effectiveness metrics.',
        finance:
          'Address security protocols, regulatory compliance, fraud prevention, and financial transparency.',
        social:
          'Highlight community building, user engagement, social dynamics, and network effects.',
        environment:
          'Emphasize sustainability metrics, environmental impact, carbon footprint reduction, and green technology.',
        productivity:
          'Focus on time savings, efficiency gains, workflow optimization, and measurable productivity improvements.',
        entertainment:
          'Highlight user engagement, entertainment value, creative expression, and audience appeal.',
      };

      contentFocus += ` Additionally, since this appears to be ${dominantDomain}-focused: ${domainEnhancements[dominantDomain as keyof typeof domainEnhancements]}`;
    }

    // Skills-based technical guidance
    const skillsGuidance = context?.skills?.length
      ? `Integrate specific technical implementation details using ${context.skills.slice(0, 3).join(', ')}. Explain the architecture, data flow, and how these technologies work together to solve the problem.`
      : 'Include relevant technical stack and implementation approach suitable for the project scope.';

    // Difficulty-based scope guidance
    const difficultyGuidance = {
      beginner:
        'Ensure the technical scope is achievable for beginners within 24-48 hours. Focus on proven technologies and straightforward implementation approaches.',
      intermediate:
        'Include moderately complex technical challenges that demonstrate skill while remaining achievable in a hackathon timeframe.',
      advanced:
        'Incorporate sophisticated technical approaches, complex algorithms, or innovative solutions that showcase advanced development capabilities.',
    };

    const scopeGuidance =
      difficultyGuidance[context?.difficulty as keyof typeof difficultyGuidance] ||
      difficultyGuidance.intermediate;

    const prompt = `Analyze and intelligently enhance this hackathon idea description based on deep content analysis and contextual understanding.

ORIGINAL DESCRIPTION: "${description}"
${contextInfo}

CONTENT ANALYSIS RESULTS:
- Content Complexity: ${contentComplexity} (${description.length} chars, ${sentences.length} sentences)
- Sentence Structure: ${sentenceComplexity}
- Dominant Domain Theme: ${dominantDomain}
- Content Strengths: ${contentStrengths.join(', ') || 'None identified'}
- Content Gaps: ${contentGaps.join(', ') || 'None identified'}
- Enhancement Strategy: ${enhancementStrategy}

ENHANCEMENT INSTRUCTIONS:
${structuralGuidance}

CATEGORY-SPECIFIC FOCUS:
${contentFocus}

TECHNICAL IMPLEMENTATION GUIDANCE:
${skillsGuidance}

DIFFICULTY & SCOPE GUIDANCE:
${scopeGuidance}

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

SPECIFIC IMPROVEMENTS TO MAKE:
Based on the content analysis, provide 3 specific, actionable improvements that directly address the identified gaps and enhance the existing strengths.

Format your response as JSON:
{
  "enhanced": "Complete enhanced description here in plain text that follows all requirements...",
  "suggestions": ["Specific improvement 1 based on analysis", "Specific improvement 2 based on analysis", "Specific improvement 3 based on analysis"]
}`;

    const response = await gemini.generateJSON<{
      enhanced: string;
      suggestions: string[];
    }>(prompt, {
      config: {
        temperature: 0.7,
        maxOutputTokens: 800,
      },
    });

    // Clean any remaining markdown from the response
    const cleanedEnhanced = response.enhanced
      ?.replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold
      ?.replace(/\*(.*?)\*/g, '$1') // Remove italic
      ?.replace(/`(.*?)`/g, '$1') // Remove code
      ?.replace(/#{1,6}\s/g, '') // Remove headers
      ?.replace(/^\s*[-*+]\s/gm, '• ') // Convert markdown lists to bullet points
      ?.trim();

    return {
      enhanced: cleanedEnhanced || description,
      suggestions: response.suggestions || [],
    };
  } catch (error) {
    logger.warn('Description enhancement failed, using original', error);
    return {
      enhanced: description,
      suggestions: [],
    };
  }
}

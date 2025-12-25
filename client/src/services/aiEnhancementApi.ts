/**
 * AI Enhancement API Service
 * Handles AI-powered enhancement of idea titles and descriptions
 */

import { apiClient } from './apiClient';

export interface EnhanceRequest {
  type: 'title' | 'description';
  content: string;
  context?: {
    title?: string;
    description?: string;
    category?: string;
    difficulty?: string;
    skills?: string[];
  };
}

export interface EnhanceResponse {
  originalContent: string;
  enhancedContent: string;
  suggestions: string[];
}

export interface EnhanceApiResponse {
  success: boolean;
  data: EnhanceResponse;
}

// Mock enhancement for development when backend is not available
const mockEnhanceTitle = (title: string, context?: EnhanceRequest['context']): EnhanceResponse => {
  // Analyze the input title for contextual enhancement
  const titleLower = title.toLowerCase();
  const category = context?.category || 'web';
  const skills = context?.skills || [];

  // Identify key themes in the title
  const hasApp = titleLower.includes('app') || titleLower.includes('application');
  const hasTracker = titleLower.includes('track') || titleLower.includes('monitor');
  const hasSystem = titleLower.includes('system') || titleLower.includes('platform');
  const hasAI =
    titleLower.includes('ai') || titleLower.includes('smart') || titleLower.includes('intelligent');
  const hasGame = titleLower.includes('game') || titleLower.includes('play');
  const hasFood = titleLower.includes('food') || titleLower.includes('meal');
  const hasHealth =
    titleLower.includes('health') ||
    titleLower.includes('medical') ||
    titleLower.includes('fitness');
  const hasEducation =
    titleLower.includes('learn') ||
    titleLower.includes('study') ||
    titleLower.includes('education');

  // Generate contextual enhancements based on content analysis
  let enhanced = title;
  let suggestions = [];

  if (hasFood && hasTracker) {
    enhanced = `Smart Campus Food Waste Tracker`;
    suggestions = [
      `Sustainable Food Management System`,
      `Campus Nutrition Monitor`,
      `EcoFood Tracking Platform`,
    ];
  } else if (hasAI && hasApp) {
    enhanced = `AI-Powered ${title.replace(/app|application/gi, '').trim()} Assistant`;
    suggestions = [
      `Intelligent ${title} Platform`,
      `Smart ${title} System`,
      `${title} with Machine Learning`,
    ];
  } else if (hasGame) {
    enhanced = `Interactive ${title.replace(/game/gi, '').trim()} Experience`;
    suggestions = [
      `Multiplayer ${title} Arena`,
      `${title} Challenge Platform`,
      `Social ${title} Network`,
    ];
  } else if (hasHealth) {
    enhanced = `Digital ${title.replace(/health|medical/gi, '').trim()} Platform`;
    suggestions = [
      `Personal ${title} Assistant`,
      `Smart ${title} Monitor`,
      `${title} Management System`,
    ];
  } else if (hasEducation) {
    enhanced = `Adaptive ${title.replace(/learn|study|education/gi, '').trim()} Platform`;
    suggestions = [
      `Personalized ${title} System`,
      `Interactive ${title} Hub`,
      `Smart ${title} Assistant`,
    ];
  } else if (hasTracker || hasSystem) {
    enhanced = `Advanced ${title.replace(/tracker|system|platform/gi, '').trim()} Management System`;
    suggestions = [
      `Real-time ${title}`,
      `Smart ${title} Dashboard`,
      `Integrated ${title} Platform`,
    ];
  } else {
    // Generic enhancement based on category
    const categoryPrefixes = {
      web: 'Modern Web-Based',
      mobile: 'Cross-Platform Mobile',
      ai: 'AI-Enhanced',
      blockchain: 'Decentralized',
      iot: 'Connected IoT',
      gaming: 'Interactive Gaming',
      fintech: 'Digital Finance',
      healthtech: 'Smart Healthcare',
      edtech: 'Adaptive Learning',
      other: 'Next-Generation',
    };

    const prefix =
      categoryPrefixes[category as keyof typeof categoryPrefixes] || categoryPrefixes.other;
    enhanced = `${prefix} ${title}`;
    suggestions = [
      `Smart ${title} Solution`,
      `${title} Management Platform`,
      `Innovative ${title} System`,
    ];
  }

  return {
    originalContent: title,
    enhancedContent: enhanced,
    suggestions: suggestions,
  };
};

const mockEnhanceDescription = (
  description: string,
  context?: EnhanceRequest['context']
): EnhanceResponse => {
  // Deep content analysis for intelligent mock enhancement
  const descLower = description.toLowerCase();
  const words = descLower.split(/\s+/);
  const sentences = description.split(/[.!?]+/).filter((s) => s.trim().length > 0);

  // Analyze content themes and structure
  const contentAnalysis = {
    // Core elements detection
    hasProblem: /\b(problem|issue|challenge|difficulty|struggle|pain\s*point)\b/i.test(description),
    hasSolution: /\b(solution|solve|fix|address|help|resolve)\b/i.test(description),
    hasTech:
      /\b(api|database|server|frontend|backend|framework|react|node|python|javascript)\b/i.test(
        description
      ),
    hasUsers: /\b(user|users|people|students|community|customers)\b/i.test(description),
    hasFeatures: /\b(feature|features|functionality|capabilities|tools)\b/i.test(description),
    hasImpact: /\b(impact|benefit|improve|better|efficient|optimize)\b/i.test(description),

    // Domain detection
    domains: {
      healthcare: /\b(health|medical|patient|doctor|hospital|treatment)\b/i.test(description),
      education: /\b(learn|education|student|teacher|school|study)\b/i.test(description),
      finance: /\b(money|payment|bank|finance|transaction|budget)\b/i.test(description),
      social: /\b(social|community|connect|share|network|friend)\b/i.test(description),
      environment: /\b(environment|green|sustainable|eco|waste|energy)\b/i.test(description),
      productivity: /\b(productivity|organize|manage|schedule|task|workflow)\b/i.test(description),
      entertainment: /\b(game|fun|entertainment|play|music|video)\b/i.test(description),
    },
  };

  // Identify dominant domain
  const dominantDomain =
    Object.entries(contentAnalysis.domains).find(([_, matches]) => matches)?.[0] || 'general';

  // Determine content complexity and gaps
  const contentLength = description.length;
  const isDetailed = contentLength > 200;
  const isModerate = contentLength > 100 && contentLength <= 200;
  const isBrief = contentLength <= 100;

  // Identify what needs enhancement
  const gaps = [];
  if (!contentAnalysis.hasProblem) gaps.push('problem_context');
  if (!contentAnalysis.hasSolution) gaps.push('solution_clarity');
  if (!contentAnalysis.hasTech) gaps.push('technical_details');
  if (!contentAnalysis.hasUsers) gaps.push('user_focus');
  if (!contentAnalysis.hasFeatures) gaps.push('feature_definition');
  if (!contentAnalysis.hasImpact) gaps.push('impact_articulation');

  // Build enhanced description based on analysis
  let enhanced = '';
  const category = context?.category || 'web';
  const skills = context?.skills || [];
  const title = context?.title || 'this project';
  const difficulty = context?.difficulty || 'intermediate';

  // Problem context (if missing or brief)
  let problemContext = '';
  if (!contentAnalysis.hasProblem || isBrief) {
    const domainProblems = {
      healthcare: 'addresses critical challenges in healthcare delivery and patient outcomes',
      education: 'tackles significant gaps in educational accessibility and learning effectiveness',
      finance: 'solves complex financial management and accessibility challenges',
      social: 'addresses community connection and social engagement issues',
      environment: 'confronts pressing environmental sustainability challenges',
      productivity: 'eliminates inefficiencies in workflow and task management',
      entertainment: 'enhances user engagement and entertainment experiences',
      general: `addresses key challenges in ${category} development and user experience`,
    };
    problemContext = `This innovative solution ${domainProblems[dominantDomain as keyof typeof domainProblems]}. `;
  }

  // Core solution (enhanced from original)
  const cleanedOriginal = description.replace(/[*_`#]/g, '').trim();
  let solutionCore = '';

  if (isDetailed) {
    // For detailed descriptions, improve structure and clarity
    solutionCore = `${cleanedOriginal} The platform integrates modern ${category} technologies to deliver a comprehensive and user-centric solution.`;
  } else if (isModerate) {
    // For moderate descriptions, add technical depth
    solutionCore = `${cleanedOriginal} This approach combines intuitive design with robust technical implementation, leveraging ${skills[0] || 'modern frameworks'} to ensure scalability and performance.`;
  } else {
    // For brief descriptions, expand significantly
    solutionCore = `${cleanedOriginal} The solution employs a ${difficulty}-level technical approach that balances innovation with practical implementation, making it ideal for hackathon development while ensuring real-world applicability.`;
  }

  // Technical implementation details
  let techDetails = '';
  if (!contentAnalysis.hasTech || gaps.includes('technical_details')) {
    const primarySkill =
      skills[0] ||
      (category === 'mobile' ? 'React Native' : category === 'ai' ? 'Python' : 'React');
    const secondarySkill =
      skills[1] ||
      (category === 'mobile' ? 'Firebase' : category === 'ai' ? 'TensorFlow' : 'Node.js');
    const tertiarySkill = skills[2] || 'REST APIs';

    const techApproaches = {
      mobile: `The mobile architecture utilizes ${primarySkill} for cross-platform compatibility, ${secondarySkill} for real-time data synchronization, and ${tertiarySkill} for seamless backend integration.`,
      web: `The web platform leverages ${primarySkill} for dynamic user interfaces, ${secondarySkill} for server-side processing, and ${tertiarySkill} for efficient data management.`,
      ai: `The AI system implements ${primarySkill} for core algorithms, ${secondarySkill} for machine learning models, and ${tertiarySkill} for data processing and integration.`,
      blockchain: `The decentralized architecture uses ${primarySkill} for smart contract development, ${secondarySkill} for frontend interaction, and distributed protocols for consensus mechanisms.`,
      iot: `The IoT solution integrates ${primarySkill} for device communication, ${secondarySkill} for data processing, and cloud services for scalable deployment.`,
      gaming: `The gaming platform employs ${primarySkill} for game logic, ${secondarySkill} for real-time multiplayer features, and optimized rendering for smooth performance.`,
      fintech: `The financial platform implements ${primarySkill} for secure transactions, ${secondarySkill} for regulatory compliance, and encrypted protocols for data protection.`,
      healthtech: `The healthcare system utilizes ${primarySkill} for patient data management, ${secondarySkill} for clinical workflows, and HIPAA-compliant infrastructure.`,
      edtech: `The educational platform leverages ${primarySkill} for interactive learning, ${secondarySkill} for progress tracking, and adaptive algorithms for personalized experiences.`,
      other: `The technical stack combines ${primarySkill} for core functionality, ${secondarySkill} for enhanced features, and ${tertiarySkill} for system integration.`,
    };

    techDetails = ` ${techApproaches[category as keyof typeof techApproaches]}`;
  }

  // Impact and benefits
  let impactStatement = '';
  if (!contentAnalysis.hasImpact || gaps.includes('impact_articulation')) {
    const difficultyScopes = {
      beginner:
        'This hackathon project is designed for rapid prototyping within 24-48 hours, focusing on core functionality and user validation.',
      intermediate:
        'The project balances technical complexity with hackathon constraints, delivering a functional prototype with potential for post-event development.',
      advanced:
        'This sophisticated solution showcases advanced technical capabilities while maintaining hackathon feasibility through strategic scope management.',
    };

    const domainImpacts = {
      healthcare: 'improving patient outcomes and healthcare accessibility',
      education: 'enhancing learning effectiveness and educational equity',
      finance: 'increasing financial inclusion and transaction efficiency',
      social: 'strengthening community connections and social engagement',
      environment: 'promoting sustainability and environmental awareness',
      productivity: 'boosting efficiency and workflow optimization',
      entertainment: 'delivering engaging and immersive user experiences',
      general: 'creating meaningful user value and technical innovation',
    };

    impactStatement = ` ${difficultyScopes[difficulty as keyof typeof difficultyScopes]} The solution targets ${domainImpacts[dominantDomain as keyof typeof domainImpacts]}, with measurable improvements in user experience and system performance.`;
  }

  // Combine all elements
  enhanced = `${problemContext}${solutionCore}${techDetails}${impactStatement}`.trim();

  // Generate specific suggestions based on what was enhanced
  const suggestions = [];

  if (gaps.includes('problem_context')) {
    suggestions.push(`Added ${dominantDomain} domain context and problem motivation`);
  }
  if (gaps.includes('technical_details')) {
    suggestions.push(
      `Integrated ${skills.slice(0, 2).join(' and ') || category + ' technologies'} implementation details`
    );
  }
  if (gaps.includes('impact_articulation')) {
    suggestions.push(
      `Enhanced impact statement with ${difficulty}-level scope and measurable outcomes`
    );
  }

  // Fill remaining suggestions based on other improvements
  const additionalImprovements = [
    'Improved technical architecture and scalability considerations',
    'Enhanced user experience and accessibility features',
    'Strengthened value proposition and competitive advantages',
    'Added hackathon-specific development timeline and milestones',
    'Incorporated modern development best practices and standards',
    'Enhanced cross-platform compatibility and deployment strategy',
  ];

  while (suggestions.length < 3) {
    const remaining = additionalImprovements.filter(
      (imp) => !suggestions.some((s) => s.includes(imp.split(' ')[1]))
    );
    if (remaining.length > 0) {
      suggestions.push(remaining[0]);
    } else {
      break;
    }
  }

  return {
    originalContent: description,
    enhancedContent: enhanced,
    suggestions: suggestions.slice(0, 3),
  };
};

const USE_MOCK_DATA = import.meta.env.VITE_API_URL === 'http://localhost:3000';

export const aiEnhancementApi = {
  /**
   * Enhance idea title or description using AI
   */
  async enhanceContent(request: EnhanceRequest): Promise<EnhanceApiResponse> {
    if (USE_MOCK_DATA) {
      console.log('Using mock AI enhancement');
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const mockResponse =
        request.type === 'title'
          ? mockEnhanceTitle(request.content, request.context)
          : mockEnhanceDescription(request.content, request.context);

      return {
        success: true,
        data: mockResponse,
      };
    }

    return apiClient.post<EnhanceApiResponse>('/api/ideas/enhance', request);
  },
};

export default aiEnhancementApi;

# Module M10: Participant Profiles

## Overview

**Estimated Time:** 1hr

**Complexity:** Medium

**Type:** Full-stack

**Risk Level:** Low

**Dependencies:** F03 (Team Formation & Matching), F04 (Event Management)

## Problem Context

Participants need comprehensive profiles that showcase their skills, experience, and interests to facilitate better team matching. This module creates rich participant profiles with portfolio integration, skill verification, and AI-powered profile optimization.

## Technical Requirements

**Module Type:** Full-stack

### Backend Tasks

- [ ] **Handler File:** Create `handlers/getProfile.ts` for profile retrieval
  - Pattern: `baseHandler` function + `export const handler = withRbac(baseHandler, 'users', 'read')`

- [ ] **Handler File:** Create `handlers/updateProfile.ts` for profile updates
  - Pattern: `baseHandler` function + `export const handler = withRbacOwn(baseHandler, 'users', 'update')`

- [ ] **Handler File:** Create `handlers/uploadPortfolio.ts` for portfolio uploads
  - Pattern: `baseHandler` function + `export const handler = withRbacOwn(baseHandler, 'users', 'update')`

- [ ] **Handler File:** Create `handlers/verifySkills.ts` for skill verification
  - Pattern: `baseHandler` function + `export const handler = withRbac(baseHandler, 'users', 'update')`

- [ ] **Handler File:** Create `handlers/getProfileRecommendations.ts` for AI recommendations
  - Pattern: `baseHandler` function + `export const handler = withRbac(baseHandler, 'users', 'read')`

- [ ] **Function Config:** Create corresponding `.yml` files in `functions/` directory

- [ ] **Service Layer:** Business logic in `services/ProfileService.ts`
  - **MANDATORY AI Integration:** AI-powered profile optimization and recommendations

- [ ] **AI Features Implementation:**
  - `optimizeProfile()` - AI suggestions for profile improvement
  - `generateSkillAssessment()` - AI-powered skill level assessment
  - `recommendTeammates()` - AI-powered teammate recommendations
  - `analyzeProfileStrength()` - AI analysis of profile completeness and appeal

### Frontend Tasks

- [ ] **Pages/Components:**
  - `ProfileDashboard.tsx` - Main profile management interface
  - `ProfileEditor.tsx` - Comprehensive profile editing form
  - `SkillsManager.tsx` - Skills management with verification
  - `PortfolioUpload.tsx` - Portfolio and project showcase
  - `ProfilePreview.tsx` - Public profile preview
  - `AIProfileOptimizer.tsx` - AI-powered profile suggestions

- [ ] **AI Features:**
  - Profile optimization suggestions with AI explanations
  - Skill level recommendations based on experience
  - Teammate compatibility scoring
  - Profile strength analysis with improvement tips

### Database Schema

```
pk: PROFILE#[userId] | sk: METADATA | gsi1pk: USER#[userId] | gsi1sk: PROFILE
- userId: string (Clerk user ID)
- displayName: string
- bio: string (professional bio)
- location: string
- timezone: string
- profileImage: string (S3 URL)
- socialLinks: SocialLink[] (GitHub, LinkedIn, Twitter, etc.)
- availability: string (full-time, part-time, weekends)
- experience: string (beginner, intermediate, advanced, expert)
- interests: string[] (hackathon interests and goals)
- profileStrength: number (AI-calculated profile completeness 1-10)
- lastOptimized: string (ISO timestamp of last AI optimization)
- isPublic: boolean (profile visibility)
- createdAt: string (ISO timestamp)
- updatedAt: string (ISO timestamp)

pk: PROFILE#[userId] | sk: SKILLS | gsi1pk: SKILL#[skillName] | gsi1sk: USER#[userId]
- userId: string
- skills: Skill[] (skill name, level, verified status)
- skillCategories: Record<string, string[]> (grouped skills)
- verificationBadges: VerificationBadge[] (skill certifications)
- aiSkillAssessment: AISkillAssessment (AI-generated skill analysis)
- lastAssessed: string (ISO timestamp)

pk: PROFILE#[userId] | sk: PORTFOLIO | gsi1pk: USER#[userId] | gsi1sk: PORTFOLIO
- userId: string
- projects: Project[] (portfolio projects)
- achievements: Achievement[] (hackathon wins, certifications)
- testimonials: Testimonial[] (peer recommendations)
- resume: string (S3 URL to resume file)
- portfolioUrl: string (external portfolio website)
- githubStats: GitHubStats (AI-analyzed GitHub activity)
- lastUpdated: string (ISO timestamp)

pk: PROFILE#[userId] | sk: PREFERENCES | gsi1pk: USER#[userId] | gsi1sk: PREFERENCES
- userId: string
- teamPreferences: TeamPreferences (preferred team size, roles, etc.)
- hackathonTypes: string[] (preferred hackathon categories)
- communicationStyle: string (collaborative, independent, etc.)
- workingHours: string (morning, evening, flexible)
- mentorshipInterest: boolean (willing to mentor others)
- learningGoals: string[] (skills they want to learn)
- aiRecommendations: AIRecommendation[] (AI-generated recommendations)
- lastRecommended: string (ISO timestamp)

pk: PROFILE#[userId] | sk: ACTIVITY | gsi1pk: USER#[userId] | gsi1sk: ACTIVITY
- userId: string
- hackathonsParticipated: number
- teamsJoined: number
- ideasSubmitted: number
- averageTeamRating: number (peer ratings)
- skillGrowthHistory: SkillGrowth[] (skill progression over time)
- collaborationHistory: Collaboration[] (past team experiences)
- reputationScore: number (AI-calculated reputation 1-10)
- lastActive: string (ISO timestamp)
```

## Implementation Guide

### Step 0: Study Phase (MANDATORY - Do This First)

**CRITICAL:** You MUST read `guidelines/project-architecture.md` COMPLETELY before writing any code.

### Step 1: Backend Implementation (Lambda-Compatible)

**File Structure:**

```
backend/src/modules/profiles/
├── handlers/
│   ├── getProfile.ts            # GET /api/profiles/:userId
│   ├── updateProfile.ts         # PUT /api/profiles/:userId
│   ├── uploadPortfolio.ts       # POST /api/profiles/:userId/portfolio
│   ├── verifySkills.ts          # POST /api/profiles/:userId/skills/verify
│   └── getProfileRecommendations.ts # GET /api/profiles/:userId/recommendations
├── functions/
│   ├── getProfile.yml
│   ├── updateProfile.yml
│   ├── uploadPortfolio.yml
│   ├── verifySkills.yml
│   └── getProfileRecommendations.yml
├── services/
│   └── ProfileService.ts        # Profile business logic
└── types.ts                     # Profile-specific types
```

**Service Layer Implementation:**

```typescript
// services/ProfileService.ts
import { geminiClient } from '../../../shared/clients/gemini';
import { dynamodb } from '../../../shared/clients/dynamodb';
import { s3 } from '../../../shared/clients/s3';

export class ProfileService {
  async getProfile(userId: string): Promise<Profile> {
    const [metadata, skills, portfolio, preferences, activity] = await Promise.all([
      this.getProfileMetadata(userId),
      this.getProfileSkills(userId),
      this.getProfilePortfolio(userId),
      this.getProfilePreferences(userId),
      this.getProfileActivity(userId),
    ]);

    return {
      ...metadata,
      skills,
      portfolio,
      preferences,
      activity,
    };
  }

  async updateProfile(userId: string, updates: ProfileUpdate): Promise<Profile> {
    // Update profile with AI optimization
    const optimizedProfile = await this.optimizeProfile(userId, updates);

    await dynamodb.update(
      { PK: `PROFILE#${userId}`, SK: 'METADATA' },
      {
        ...optimizedProfile,
        updatedAt: new Date().toISOString(),
      }
    );

    return this.getProfile(userId);
  }

  // MANDATORY: AI-powered profile optimization
  async optimizeProfile(userId: string, profileData: ProfileUpdate): Promise<OptimizedProfile> {
    const currentProfile = await this.getProfile(userId);

    const prompt = `Optimize this hackathon participant's profile for better team matching:
    
    Current Profile:
    - Bio: ${profileData.bio || currentProfile.bio}
    - Skills: ${JSON.stringify(profileData.skills || currentProfile.skills)}
    - Experience: ${profileData.experience || currentProfile.experience}
    - Interests: ${JSON.stringify(profileData.interests || currentProfile.interests)}
    
    Provide optimizations for:
    1. Bio enhancement (make it more compelling and specific)
    2. Skill organization and categorization
    3. Missing skills that would improve team matching
    4. Interest refinement for better hackathon alignment
    5. Profile completeness score and improvement suggestions
    
    Return the optimized profile data with explanations.`;

    const response = await geminiClient.generateJSON({
      prompt,
      schema: {
        type: 'object',
        properties: {
          optimizedBio: { type: 'string' },
          skillSuggestions: { type: 'array', items: { type: 'string' } },
          interestRefinements: { type: 'array', items: { type: 'string' } },
          completenessScore: { type: 'number' },
          improvements: { type: 'array', items: { type: 'string' } },
          explanation: { type: 'string' },
        },
      },
    });

    return {
      ...profileData,
      bio: response.optimizedBio || profileData.bio,
      aiSuggestions: {
        skills: response.skillSuggestions,
        interests: response.interestRefinements,
        improvements: response.improvements,
      },
      profileStrength: response.completenessScore,
      lastOptimized: new Date().toISOString(),
    };
  }

  // MANDATORY: AI-powered skill assessment
  async generateSkillAssessment(userId: string, skills: Skill[]): Promise<AISkillAssessment> {
    const profile = await this.getProfile(userId);
    const portfolioProjects = profile.portfolio?.projects || [];

    const prompt = `Assess the skill levels for this hackathon participant:
    
    Claimed Skills: ${JSON.stringify(skills)}
    Experience Level: ${profile.experience}
    Portfolio Projects: ${JSON.stringify(
      portfolioProjects.map((p) => ({
        name: p.name,
        description: p.description,
        technologies: p.technologies,
      }))
    )}
    
    For each skill, provide:
    1. Recommended skill level (1-5 scale: 1=Beginner, 2=Novice, 3=Intermediate, 4=Advanced, 5=Expert)
    2. Confidence score in the assessment (1-10)
    3. Evidence from portfolio that supports this level
    4. Suggestions for skill improvement
    5. Complementary skills they should consider learning
    
    Be realistic and helpful in the assessment.`;

    const response = await geminiClient.generateJSON({
      prompt,
      schema: {
        type: 'object',
        properties: {
          skillAssessments: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                skillName: { type: 'string' },
                recommendedLevel: { type: 'number' },
                confidence: { type: 'number' },
                evidence: { type: 'string' },
                improvementSuggestions: { type: 'array', items: { type: 'string' } },
              },
            },
          },
          complementarySkills: { type: 'array', items: { type: 'string' } },
          overallAssessment: { type: 'string' },
        },
      },
    });

    // Save assessment to database
    await dynamodb.update(
      { PK: `PROFILE#${userId}`, SK: 'SKILLS' },
      {
        aiSkillAssessment: response,
        lastAssessed: new Date().toISOString(),
      }
    );

    return response;
  }

  // MANDATORY: AI-powered teammate recommendations
  async recommendTeammates(userId: string, eventId?: string): Promise<TeammateRecommendation[]> {
    const userProfile = await this.getProfile(userId);
    const potentialTeammates = await this.getPotentialTeammates(userId, eventId);

    const prompt = `Recommend the best teammates for this hackathon participant:
    
    User Profile:
    - Skills: ${JSON.stringify(userProfile.skills)}
    - Experience: ${userProfile.experience}
    - Interests: ${JSON.stringify(userProfile.interests)}
    - Team Preferences: ${JSON.stringify(userProfile.preferences?.teamPreferences)}
    
    Potential Teammates: ${JSON.stringify(
      potentialTeammates.map((p) => ({
        id: p.userId,
        skills: p.skills,
        experience: p.experience,
        interests: p.interests,
      }))
    )}
    
    For each potential teammate, provide:
    1. Compatibility score (1-10)
    2. Skill complementarity analysis
    3. Experience level compatibility
    4. Interest alignment
    5. Specific reasons why they'd work well together
    6. Potential challenges and how to address them
    
    Rank by overall compatibility and team potential.`;

    const response = await geminiClient.generateJSON({
      prompt,
      schema: {
        type: 'object',
        properties: {
          recommendations: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                userId: { type: 'string' },
                compatibilityScore: { type: 'number' },
                skillComplementarity: { type: 'string' },
                experienceCompatibility: { type: 'string' },
                interestAlignment: { type: 'string' },
                strengths: { type: 'array', items: { type: 'string' } },
                challenges: { type: 'array', items: { type: 'string' } },
                recommendation: { type: 'string' },
              },
            },
          },
        },
      },
    });

    return response.recommendations;
  }

  // MANDATORY: AI-powered profile strength analysis
  async analyzeProfileStrength(userId: string): Promise<ProfileAnalysis> {
    const profile = await this.getProfile(userId);

    const prompt = `Analyze the strength and appeal of this hackathon participant's profile:
    
    Profile Data: ${JSON.stringify({
      bio: profile.bio,
      skills: profile.skills,
      experience: profile.experience,
      portfolio: profile.portfolio?.projects?.length || 0,
      socialLinks: profile.socialLinks?.length || 0,
      interests: profile.interests,
    })}
    
    Analyze:
    1. Profile completeness (0-100%)
    2. Appeal to potential teammates (1-10)
    3. Skill diversity and depth
    4. Professional presentation quality
    5. Specific areas for improvement
    6. Strengths that make them attractive teammate
    7. Missing elements that would significantly improve their profile
    
    Provide actionable feedback for improvement.`;

    const response = await geminiClient.generateJSON({
      prompt,
      schema: {
        type: 'object',
        properties: {
          completenessScore: { type: 'number' },
          appealScore: { type: 'number' },
          skillDiversityScore: { type: 'number' },
          presentationScore: { type: 'number' },
          strengths: { type: 'array', items: { type: 'string' } },
          improvements: { type: 'array', items: { type: 'string' } },
          missingElements: { type: 'array', items: { type: 'string' } },
          overallFeedback: { type: 'string' },
        },
      },
    });

    return response;
  }

  async uploadPortfolioFile(userId: string, file: Buffer, fileName: string): Promise<string> {
    const fileKey = `profiles/${userId}/portfolio/${Date.now()}_${fileName}`;
    await s3.putBuffer(fileKey, file);
    return s3.getDownloadUrl(fileKey, { expiresIn: 86400 * 365 }); // 1 year
  }

  async verifySkill(
    userId: string,
    skillName: string,
    evidence: SkillEvidence
  ): Promise<VerificationResult> {
    // Implement skill verification logic
  }
}
```

### Step 2: Frontend Implementation

**File Structure:**

```
client/src/
├── components/profiles/
│   ├── ProfileDashboard.tsx     # Main profile interface
│   ├── ProfileEditor.tsx        # Profile editing form
│   ├── SkillsManager.tsx        # Skills management
│   ├── PortfolioUpload.tsx      # Portfolio management
│   ├── ProfilePreview.tsx       # Public profile view
│   ├── AIProfileOptimizer.tsx   # AI optimization panel
│   └── TeammateRecommendations.tsx # AI teammate suggestions
├── pages/profiles/
│   ├── MyProfilePage.tsx        # User's own profile
│   ├── ProfileViewPage.tsx      # View other profiles
│   └── ProfileEditPage.tsx      # Edit profile page
├── hooks/
│   ├── useProfile.ts            # Profile data hooks
│   └── useProfileOptimization.ts # AI optimization hooks
└── types/
    └── profile.ts               # Profile types
```

**Main Profile Dashboard:**

```typescript
// components/profiles/ProfileDashboard.tsx
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProfileEditor } from './ProfileEditor';
import { SkillsManager } from './SkillsManager';
import { PortfolioUpload } from './PortfolioUpload';
import { AIProfileOptimizer } from './AIProfileOptimizer';
import { TeammateRecommendations } from './TeammateRecommendations';
import { useProfile } from '@/hooks/useProfile';
import { User, Settings, Sparkles, Users, Award } from 'lucide-react';

interface ProfileDashboardProps {
  userId: string;
  isOwnProfile: boolean;
}

export const ProfileDashboard = ({ userId, isOwnProfile }: ProfileDashboardProps) => {
  const [activeTab, setActiveTab] = useState('overview');
  const { profile, loading, updateProfile, optimizeProfile } = useProfile(userId);

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading profile...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Profile Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start gap-6">
            <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center">
              {profile.profileImage ? (
                <img
                  src={profile.profileImage}
                  alt={profile.displayName}
                  className="w-24 h-24 rounded-full object-cover"
                />
              ) : (
                <User className="w-12 h-12 text-gray-400" />
              )}
            </div>

            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <h1 className="text-3xl font-bold">{profile.displayName}</h1>
                {isOwnProfile && (
                  <Button variant="outline" onClick={() => setActiveTab('edit')}>
                    <Settings className="w-4 h-4 mr-2" />
                    Edit Profile
                  </Button>
                )}
              </div>

              <p className="text-gray-600 mb-4">{profile.bio}</p>

              <div className="flex items-center gap-4 mb-4">
                <Badge variant="secondary">{profile.experience}</Badge>
                <Badge variant="outline">{profile.location}</Badge>
                <Badge variant="outline">{profile.availability}</Badge>
              </div>

              {/* Profile Strength */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Profile Strength</span>
                  <span className="text-sm text-gray-600">{profile.profileStrength}/10</span>
                </div>
                <Progress value={profile.profileStrength * 10} className="h-2" />
              </div>

              {/* Skills Preview */}
              <div className="flex flex-wrap gap-2">
                {profile.skills?.slice(0, 8).map((skill) => (
                  <Badge key={skill.name} variant="outline" className="text-xs">
                    {skill.name} {skill.level && `(${skill.level})`}
                  </Badge>
                ))}
                {profile.skills?.length > 8 && (
                  <Badge variant="outline" className="text-xs">
                    +{profile.skills.length - 8} more
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Profile Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="skills">Skills</TabsTrigger>
          <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
          {isOwnProfile && <TabsTrigger value="optimize">AI Optimize</TabsTrigger>}
          {isOwnProfile && <TabsTrigger value="edit">Edit</TabsTrigger>}
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Activity Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="w-5 h-5" />
                  Activity Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Hackathons Participated</span>
                  <span className="font-medium">{profile.activity?.hackathonsParticipated || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Teams Joined</span>
                  <span className="font-medium">{profile.activity?.teamsJoined || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Ideas Submitted</span>
                  <span className="font-medium">{profile.activity?.ideasSubmitted || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Reputation Score</span>
                  <span className="font-medium">{profile.activity?.reputationScore || 0}/10</span>
                </div>
              </CardContent>
            </Card>

            {/* Teammate Recommendations */}
            <TeammateRecommendations userId={userId} />
          </div>
        </TabsContent>

        <TabsContent value="skills">
          <SkillsManager userId={userId} skills={profile.skills} isEditable={isOwnProfile} />
        </TabsContent>

        <TabsContent value="portfolio">
          <PortfolioUpload userId={userId} portfolio={profile.portfolio} isEditable={isOwnProfile} />
        </TabsContent>

        {isOwnProfile && (
          <TabsContent value="optimize">
            <AIProfileOptimizer userId={userId} profile={profile} onOptimize={optimizeProfile} />
          </TabsContent>
        )}

        {isOwnProfile && (
          <TabsContent value="edit">
            <ProfileEditor userId={userId} profile={profile} onUpdate={updateProfile} />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};
```

**AI Profile Optimizer Component:**

```typescript
// components/profiles/AIProfileOptimizer.tsx
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Sparkles, TrendingUp, CheckCircle, AlertCircle } from 'lucide-react';

interface AIProfileOptimizerProps {
  userId: string;
  profile: Profile;
  onOptimize: (optimizations: ProfileOptimization) => void;
}

export const AIProfileOptimizer = ({ userId, profile, onOptimize }: AIProfileOptimizerProps) => {
  const [analysis, setAnalysis] = useState<ProfileAnalysis | null>(null);
  const [loading, setLoading] = useState(false);

  const analyzeProfile = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/profiles/${userId}/analyze`, {
        method: 'POST'
      });
      const data = await response.json();
      setAnalysis(data);
    } catch (error) {
      console.error('Failed to analyze profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyOptimizations = async () => {
    if (!analysis) return;

    const optimizations = {
      bio: analysis.suggestedBio,
      skills: analysis.skillSuggestions,
      interests: analysis.interestRefinements
    };

    onOptimize(optimizations);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-600" />
            AI Profile Optimization
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center mb-6">
            <p className="text-gray-600 mb-4">
              Get AI-powered suggestions to improve your profile and attract better teammates
            </p>
            <Button onClick={analyzeProfile} disabled={loading} className="flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              {loading ? 'Analyzing...' : 'Analyze My Profile'}
            </Button>
          </div>

          {analysis && (
            <div className="space-y-6">
              {/* Profile Scores */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{analysis.completenessScore}%</div>
                  <div className="text-sm text-gray-600">Completeness</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{analysis.appealScore}/10</div>
                  <div className="text-sm text-gray-600">Appeal</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{analysis.skillDiversityScore}/10</div>
                  <div className="text-sm text-gray-600">Skill Diversity</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">{analysis.presentationScore}/10</div>
                  <div className="text-sm text-gray-600">Presentation</div>
                </div>
              </div>

              {/* Strengths */}
              <div>
                <h3 className="font-medium mb-3 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  Your Strengths
                </h3>
                <div className="space-y-2">
                  {analysis.strengths.map((strength, index) => (
                    <div key={index} className="p-3 bg-green-50 rounded border-l-4 border-green-400">
                      <p className="text-sm text-green-800">{strength}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Improvements */}
              <div>
                <h3 className="font-medium mb-3 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                  Improvement Opportunities
                </h3>
                <div className="space-y-2">
                  {analysis.improvements.map((improvement, index) => (
                    <div key={index} className="p-3 bg-blue-50 rounded border-l-4 border-blue-400">
                      <p className="text-sm text-blue-800">{improvement}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Missing Elements */}
              <div>
                <h3 className="font-medium mb-3 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-orange-600" />
                  Missing Elements
                </h3>
                <div className="space-y-2">
                  {analysis.missingElements.map((element, index) => (
                    <div key={index} className="p-3 bg-orange-50 rounded border-l-4 border-orange-400">
                      <p className="text-sm text-orange-800">{element}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Overall Feedback */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-medium mb-2">Overall Assessment</h3>
                <p className="text-gray-700">{analysis.overallFeedback}</p>
              </div>

              {/* Apply Optimizations */}
              <div className="text-center">
                <Button onClick={applyOptimizations} className="bg-purple-600 hover:bg-purple-700">
                  Apply AI Optimizations
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
```

## Acceptance Criteria

- [ ] Comprehensive participant profiles with skills, portfolio, and preferences
- [ ] File upload functionality for portfolio items and resume
- [ ] **AI Feature Working:** Profile optimization, skill assessment, and teammate recommendations
- [ ] **Demo Ready:** Can showcase profile creation and optimization in 30 seconds
- [ ] **Integration:** Works with F03 (Team Formation) and F04 (Event Management)
- [ ] **Mobile Responsive:** Profile editing works on all devices
- [ ] **Privacy Controls:** Public/private profile visibility settings

## Related Modules

- **Depends On:** F03 (Team Formation & Matching), F04 (Event Management)
- **Enables:** Better team matching, enhanced user experience
- **Conflicts With:** None

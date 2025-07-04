// AI Service for grading and feedback
export class AIService {
  // Configuration - now reads from settings and environment
  static async getAIConfig() {
    // Try to get from localStorage first (from AI Settings page)
    const savedConfig = localStorage.getItem('aiConfig');
    if (savedConfig) {
      const config = JSON.parse(savedConfig);
      return {
        provider: config.provider || 'openai',
        apiKey: config.apiKey || process.env.VITE_OPENAI_API_KEY || '',
        model: config.model || 'gpt-4',
        temperature: config.temperature || 0.7,
        maxTokens: config.maxTokens || 2000
      };
    }
    
    // Fallback to environment variables
    return {
      provider: 'openai',
      apiKey: process.env.VITE_OPENAI_API_KEY || '',
      model: 'gpt-4',
      temperature: 0.7,
      maxTokens: 2000
    };
  }

  // Real AI Implementation
  static async callAI(prompt, context = {}, useRealAI = true) {
    const config = await this.getAIConfig();
    
    // Check if we have a valid API key and should use real AI
    if (useRealAI && config.apiKey && config.apiKey !== '••••••••••••••••••••••••••••••••') {
      try {
        console.log('Using real AI with provider:', config.provider);
        
        if (config.provider === 'openai') {
          return await this.callOpenAI(prompt, context, config);
        } else if (config.provider === 'anthropic') {
          return await this.callAnthropic(prompt, context, config);
        } else if (config.provider === 'google') {
          return await this.callGoogle(prompt, context, config);
        }
      } catch (error) {
        console.error('Real AI API Error:', error);
        console.log('Falling back to mock AI...');
        // Fallback to mock on error
        return this.generateMockResponse(prompt, context);
      }
    }
    
    // Use mock AI if no key or explicitly requested
    console.log('Using mock AI responses');
    return this.generateMockResponse(prompt, context);
  }

  static async callOpenAI(prompt, context, config) {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`
      },
      body: JSON.stringify({
        model: config.model,
        messages: [
          {
            role: 'system',
            content: prompt
          },
          {
            role: 'user',
            content: JSON.stringify(context)
          }
        ],
        temperature: config.temperature,
        max_tokens: config.maxTokens
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  }

  static async callAnthropic(prompt, context, config) {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': config.apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: config.model,
        max_tokens: config.maxTokens,
        temperature: config.temperature,
        messages: [
          {
            role: 'user',
            content: `${prompt}\n\nContext: ${JSON.stringify(context)}`
          }
        ]
      })
    });

    if (!response.ok) {
      throw new Error(`Anthropic API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.content[0].text;
  }

  static async callGoogle(prompt, context, config) {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${config.model}:generateContent?key=${config.apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `${prompt}\n\nContext: ${JSON.stringify(context)}`
          }]
        }],
        generationConfig: {
          temperature: config.temperature,
          maxOutputTokens: config.maxTokens,
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Google API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
  }

  static generateMockResponse(prompt, context) {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve("Mock AI response based on " + JSON.stringify(context).slice(0, 100));
      }, 1000);
    });
  }

  static async gradeWork(workData, assessmentCriteria, useRealAI = true) {
    const config = await this.getAIConfig();
    
    if (useRealAI && config.apiKey && config.apiKey !== '••••••••••••••••••••••••••••••••') {
      try {
        const prompt = `You are an expert Design & Technology teacher. Assess this student work and provide grades (1-5) and constructive feedback.

Assessment Criteria:
- Creativity & Innovation (1-5)
- Technical Skills (1-5) 
- Problem Solving (1-5)
- Evaluation (1-5)

Return a JSON response with:
{
  "grades": {
    "creativity": number,
    "technical": number, 
    "problemSolving": number,
    "evaluation": number
  },
  "feedback": {
    "creativity": "detailed feedback",
    "technical": "detailed feedback",
    "problemSolving": "detailed feedback", 
    "evaluation": "detailed feedback"
  },
  "suggestions": ["suggestion1", "suggestion2", "suggestion3"],
  "overallGrade": number,
  "confidence": number
}`;

        const context = {
          title: workData.title,
          description: workData.description,
          fileCount: workData.files?.length || 0,
          project: workData.project
        };

        const response = await this.callAI(prompt, context, true);
        
        try {
          const aiResult = JSON.parse(response);
          return {
            ...aiResult,
            analysisType: 'work_assessment',
            timestamp: new Date().toISOString()
          };
        } catch (parseError) {
          console.error('Error parsing AI response, using mock data');
          return this.generateMockGradeResponse();
        }
      } catch (error) {
        console.error('Error with real AI grading:', error);
        return this.generateMockGradeResponse();
      }
    }
    
    // Fallback to mock
    return this.generateMockGradeResponse();
  }

  static async generateJournalFeedback(entry, useRealAI = true) {
    const config = await this.getAIConfig();
    
    if (useRealAI && config.apiKey && config.apiKey !== '••••••••••••••••••••••••••••••••') {
      try {
        const prompt = `You are a supportive Design & Technology teacher providing feedback on a student's learning journal entry. 

The student is feeling ${entry.mood} about their learning. Provide encouraging, age-appropriate feedback that:
1. Acknowledges their feelings
2. Celebrates their learning
3. Offers specific, actionable suggestions
4. Encourages continued growth

Return a JSON response with:
{
  "content": "main feedback message",
  "suggestions": ["suggestion1", "suggestion2", "suggestion3"],
  "encouragement": "encouraging message"
}`;

        const context = {
          title: entry.title,
          content: entry.content,
          subject: entry.subject,
          mood: entry.mood,
          tags: entry.tags
        };

        const response = await this.callAI(prompt, context, true);
        
        try {
          const aiResult = JSON.parse(response);
          return {
            id: Date.now(),
            ...aiResult,
            created_at: new Date().toISOString(),
            mood_response: this.generateMoodResponse(entry.mood),
            learning_insights: this.generateLearningInsights(entry)
          };
        } catch (parseError) {
          console.error('Error parsing AI response, using mock feedback');
          return this.generateMockJournalFeedback(entry);
        }
      } catch (error) {
        console.error('Error with real AI journal feedback:', error);
        return this.generateMockJournalFeedback(entry);
      }
    }
    
    // Fallback to mock
    return this.generateMockJournalFeedback(entry);
  }

  static async generatePupilReport({pupil, period, prompt, reportType}, useRealAI = true) {
    const config = await this.getAIConfig();
    
    if (useRealAI && config.apiKey && config.apiKey !== '••••••••••••••••••••••••••••••••') {
      try {
        const systemPrompt = prompt || this.getDefaultReportPrompt(reportType);
        
        const context = {
          pupilName: pupil.name,
          class: pupil.class,
          yearGroup: pupil.yearGroup,
          averageGrade: pupil.grades.reduce((sum, g) => sum + g.grade, 0) / pupil.grades.length,
          attendance: pupil.attendance,
          behaviour: pupil.behaviour,
          recentGrades: pupil.grades.slice(-3),
          period: period,
          reportType: reportType
        };

        const response = await this.callAI(systemPrompt, context, true);
        return response;
      } catch (error) {
        console.error('Error with real AI report generation:', error);
        return this.generateDetailedPupilReport(pupil, period, prompt, reportType);
      }
    }
    
    // Fallback to mock
    return this.generateDetailedPupilReport(pupil, period, prompt, reportType);
  }

  static async analyzeSchemeDocument(schemeData, useRealAI = true) {
    const config = await this.getAIConfig();
    
    if (useRealAI && config.apiKey && config.apiKey !== '••••••••••••••••••••••••••••••••') {
      try {
        const prompt = `You are an expert curriculum analyst. Analyze this scheme of work document and extract:

1. Individual lessons with titles, objectives, resources, and assessments
2. Assessment criteria with categories and weightings
3. Key topics and learning outcomes

Return a JSON response with:
{
  "lessons": [
    {
      "title": "lesson title",
      "duration": "45 minutes",
      "objectives": ["objective1", "objective2"],
      "resources": ["resource1", "resource2"],
      "assessment": "assessment method",
      "weekNumber": 1
    }
  ],
  "assessmentCriteria": [
    {
      "category": "category name",
      "criteria": ["criteria1", "criteria2"],
      "weightage": 25
    }
  ],
  "totalDuration": "6h 30m",
  "confidence": 85
}`;

        const context = {
          title: schemeData.title,
          description: schemeData.description,
          yearGroup: schemeData.yearGroup,
          subject: schemeData.subject,
          fileName: schemeData.file?.name
        };

        const response = await this.callAI(prompt, context, true);
        
        try {
          const aiResult = JSON.parse(response);
          return {
            ...aiResult,
            analysisType: 'scheme',
            extractedElements: {
              lessonCount: aiResult.lessons?.length || 0,
              assessmentAreas: aiResult.assessmentCriteria?.length || 0,
              keyTopics: this.extractKeyTopics(schemeData),
              learningOutcomes: this.extractLearningOutcomes(schemeData)
            },
            timestamp: new Date().toISOString()
          };
        } catch (parseError) {
          console.error('Error parsing AI response, using mock scheme analysis');
          return this.generateMockSchemeAnalysis(schemeData);
        }
      } catch (error) {
        console.error('Error with real AI scheme analysis:', error);
        return this.generateMockSchemeAnalysis(schemeData);
      }
    }
    
    // Fallback to mock
    return this.generateMockSchemeAnalysis(schemeData);
  }

  // Mock response generators (keeping existing functionality)
  static generateMockGradeResponse() {
    return new Promise((resolve) => {
      setTimeout(() => {
        const grades = {
          creativity: Math.floor(Math.random() * 5) + 1,
          technical: Math.floor(Math.random() * 5) + 1,
          problemSolving: Math.floor(Math.random() * 5) + 1,
          evaluation: Math.floor(Math.random() * 5) + 1
        };

        const feedback = this.generateFeedback(grades);
        const suggestions = this.generateSuggestions(grades);

        resolve({
          grades,
          feedback,
          suggestions,
          overallGrade: Object.values(grades).reduce((a, b) => a + b) / 4,
          confidence: Math.floor(Math.random() * 20) + 80,
          analysisType: 'work_assessment',
          timestamp: new Date().toISOString()
        });
      }, 2000);
    });
  }

  static generateMockJournalFeedback(entry) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const feedback = this.generateJournalFeedbackContent(entry);
        
        resolve({
          id: Date.now(),
          content: feedback.content,
          suggestions: feedback.suggestions,
          encouragement: feedback.encouragement,
          created_at: new Date().toISOString(),
          mood_response: this.generateMoodResponse(entry.mood),
          learning_insights: this.generateLearningInsights(entry)
        });
      }, 2000);
    });
  }

  static generateMockSchemeAnalysis(schemeData) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const lessons = this.generateLessonsFromScheme(schemeData);
        const assessmentCriteria = this.generateAssessmentCriteria(schemeData);
        
        const totalDuration = lessons.reduce((total, lesson) => {
          const minutes = parseInt(lesson.duration) || 45;
          return total + minutes;
        }, 0);

        resolve({
          lessons,
          assessmentCriteria,
          totalDuration: `${Math.floor(totalDuration / 60)}h ${totalDuration % 60}m`,
          confidence: Math.floor(Math.random() * 20) + 80,
          analysisType: 'scheme',
          extractedElements: {
            lessonCount: lessons.length,
            assessmentAreas: assessmentCriteria.length,
            keyTopics: this.extractKeyTopics(schemeData),
            learningOutcomes: this.extractLearningOutcomes(schemeData)
          },
          timestamp: new Date().toISOString()
        });
      }, 4000);
    });
  }

  static getDefaultReportPrompt(reportType) {
    const prompts = {
      individual: `Create a comprehensive individual report for this pupil based on their grades and feedback. Include:
- Overall performance summary
- Key strengths and achievements  
- Areas for development
- Specific next steps and recommendations
- Celebration of progress made
Keep the tone encouraging and constructive, suitable for both pupils and parents to read.`,
      
      progress: `Create a progress-focused report highlighting development over time. Include:
- Progress made since last assessment
- Skills that have improved
- Challenges overcome
- Growth in confidence and independence
- Future learning goals
Emphasize the journey of learning and celebrate growth.`,
      
      parents: `Write a parent-friendly report that is warm and accessible. Include:
- What their child has been learning
- How their child is progressing
- Specific examples of good work
- How parents can support at home
- Positive next steps
Use simple language and focus on celebrating achievements while being honest about areas for growth.`
    };
    
    return prompts[reportType] || prompts.individual;
  }

  // Keep all existing helper methods...
  static generateJournalFeedbackContent(entry) {
    const moodResponses = {
      excited: {
        content: `I can feel your excitement about ${this.extractMainTopic(entry)}! Your enthusiasm for learning really comes through in your writing.`,
        encouragement: 'Your positive energy and curiosity are wonderful qualities that will help you learn and grow!'
      },
      proud: {
        content: `You should be proud of your achievements! It's clear you've worked hard and can see your progress in ${this.extractMainTopic(entry)}.`,
        encouragement: 'Your sense of accomplishment shows you\'re building confidence - keep celebrating your successes!'
      },
      confused: {
        content: `I understand that ${this.extractMainTopic(entry)} feels confusing right now. It's completely normal to feel this way when learning something new.`,
        encouragement: 'Asking questions and admitting when you\'re confused shows great wisdom and courage!'
      },
      frustrated: {
        content: `I can hear your frustration with ${this.extractMainTopic(entry)}. These feelings are valid and show you care about doing well.`,
        encouragement: 'Your persistence in the face of challenges shows real character - every expert was once a beginner!'
      },
      curious: {
        content: `Your curiosity about ${this.extractMainTopic(entry)} is wonderful! Questions like yours are what lead to real understanding and discovery.`,
        encouragement: 'Never stop asking questions - your curiosity is one of your greatest learning tools!'
      },
      neutral: {
        content: `Thank you for sharing your thoughts about ${this.extractMainTopic(entry)}. I can see you're thinking carefully about your learning.`,
        encouragement: 'Your thoughtful reflection shows you\'re developing important self-awareness skills!'
      }
    };

    const moodResponse = moodResponses[entry.mood] || moodResponses.neutral;
    const suggestions = this.generateJournalSuggestions(entry);

    return {
      content: moodResponse.content + ' ' + this.generateSpecificFeedback(entry),
      suggestions: suggestions,
      encouragement: moodResponse.encouragement
    };
  }

  static extractMainTopic(entry) {
    const content = entry.content.toLowerCase();
    const title = entry.title.toLowerCase();

    const topics = {
      'cad': 'CAD design',
      'design': 'design work',
      'wood': 'woodworking',
      'circuit': 'electrical circuits',
      'electricity': 'electrical work',
      'tool': 'using tools',
      'making': 'making skills',
      'material': 'materials',
      'safety': 'safety procedures',
      'problem': 'problem solving',
      'project': 'your project'
    };

    for (const [keyword, topic] of Object.entries(topics)) {
      if (content.includes(keyword) || title.includes(keyword)) {
        return topic;
      }
    }

    return 'your learning';
  }

  static generateSpecificFeedback(entry) {
    const content = entry.content.toLowerCase();
    
    if (content.includes('struggle') || content.includes('difficult') || content.includes('hard')) {
      return 'I notice you mentioned finding this challenging. Remember that struggle is a normal part of learning - it means your brain is growing!';
    }
    
    if (content.includes('help') || content.includes('teacher') || content.includes('support')) {
      return 'It\'s great that you sought help when you needed it. Asking for support shows maturity and wisdom.';
    }
    
    if (content.includes('first time') || content.includes('new')) {
      return 'Trying something new takes courage! Your willingness to step outside your comfort zone is admirable.';
    }
    
    if (content.includes('success') || content.includes('worked') || content.includes('achieved')) {
      return 'Your success shows the value of persistence and effort. Well done!';
    }
    
    return 'Your reflection shows thoughtful consideration of your learning experience.';
  }

  static generateJournalSuggestions(entry) {
    const content = entry.content.toLowerCase();
    const subject = entry.subject.toLowerCase();
    const suggestions = [];

    // Subject-specific suggestions
    if (subject.includes('design')) {
      if (content.includes('cad')) {
        suggestions.push('Try sketching your ideas on paper before moving to CAD');
        suggestions.push('Explore different CAD tools and features');
        suggestions.push('Look at real-world objects for design inspiration');
      } else if (content.includes('wood')) {
        suggestions.push('Practice measuring and marking techniques');
        suggestions.push('Learn about different types of wood and their properties');
        suggestions.push('Always prioritize safety when using tools');
      } else if (content.includes('circuit')) {
        suggestions.push('Start with simple circuit diagrams');
        suggestions.push('Practice identifying electrical components');
        suggestions.push('Use simulation software to test circuits safely');
      }
    }

    // Mood-based suggestions
    if (entry.mood === 'confused') {
      suggestions.push('Break the problem down into smaller steps');
      suggestions.push('Ask specific questions about what you don\'t understand');
      suggestions.push('Try explaining the concept to someone else');
    } else if (entry.mood === 'frustrated') {
      suggestions.push('Take breaks when feeling overwhelmed');
      suggestions.push('Focus on what you have learned, not just what\'s difficult');
      suggestions.push('Remember that making mistakes is part of learning');
    } else if (entry.mood === 'excited') {
      suggestions.push('Channel your enthusiasm into exploring related topics');
      suggestions.push('Share your excitement with classmates to inspire others');
      suggestions.push('Set new challenges for yourself');
    }

    // General learning suggestions
    if (suggestions.length < 3) {
      const generalSuggestions = [
        'Keep a learning diary to track your progress',
        'Connect your learning to real-world applications',
        'Collaborate with classmates to share ideas',
        'Set small, achievable goals for each lesson',
        'Reflect on what strategies help you learn best'
      ];
      
      while (suggestions.length < 3 && generalSuggestions.length > 0) {
        const randomIndex = Math.floor(Math.random() * generalSuggestions.length);
        suggestions.push(generalSuggestions.splice(randomIndex, 1)[0]);
      }
    }

    return suggestions.slice(0, 3);
  }

  static generateMoodResponse(mood) {
    const responses = {
      excited: 'Your excitement is contagious! This positive energy will fuel your learning journey.',
      proud: 'Pride in your work shows you value quality and effort - excellent qualities!',
      confused: 'Confusion is the first step toward understanding. Keep asking questions!',
      frustrated: 'Frustration shows you care about succeeding. Channel this energy into persistence!',
      curious: 'Curiosity is the engine of learning. Your questions will lead to great discoveries!',
      neutral: 'Your balanced perspective on learning is valuable. Keep reflecting thoughtfully.'
    };

    return responses[mood] || responses.neutral;
  }

  static generateLearningInsights(entry) {
    const insights = [];
    const content = entry.content.toLowerCase();

    if (content.includes('understand') || content.includes('learned') || content.includes('realized')) {
      insights.push('Shows evidence of conceptual understanding');
    }

    if (content.includes('practice') || content.includes('tried') || content.includes('attempt')) {
      insights.push('Demonstrates active learning through practice');
    }

    if (content.includes('help') || content.includes('ask') || content.includes('question')) {
      insights.push('Shows good help-seeking behavior');
    }

    if (content.includes('mistake') || content.includes('wrong') || content.includes('error')) {
      insights.push('Learning from mistakes and showing resilience');
    }

    return insights;
  }

  // Keep all other existing methods...
  static generateDetailedPupilReport(pupil, period, prompt, reportType) {
    const avgGrade = pupil.grades.reduce((sum, g) => sum + g.grade, 0) / pupil.grades.length;
    const recentGrades = pupil.grades.slice(-3);

    const reportTemplates = {
      individual: this.generateIndividualReport(pupil, avgGrade, recentGrades, period),
      progress: this.generateProgressReport(pupil, avgGrade, recentGrades, period),
      parents: this.generateParentReport(pupil, avgGrade, recentGrades, period)
    };

    return reportTemplates[reportType] || reportTemplates.individual;
  }

  static generateIndividualReport(pupil, avgGrade, recentGrades, period) {
    const strengths = this.identifyStrengths(pupil, recentGrades);
    const improvements = this.identifyImprovements(pupil, recentGrades);
    const nextSteps = this.generateNextSteps(pupil, avgGrade);

    return `INDIVIDUAL REPORT: ${pupil.name}
Class: ${pupil.class}
Report Period: ${period.charAt(0).toUpperCase() + period.slice(1)}
Generated: ${new Date().toLocaleDateString()}

OVERALL PERFORMANCE
${pupil.name} has demonstrated ${avgGrade >= 4 ? 'excellent' : avgGrade >= 3 ? 'good' : 'developing'} performance across Design & Technology this ${period}. With an average grade of ${avgGrade.toFixed(1)}/5.0, ${pupil.name} shows ${avgGrade >= 3.5 ? 'strong understanding' : 'growing understanding'} of key concepts and skills.

ATTENDANCE & ENGAGEMENT
Attendance: ${pupil.attendance}% - ${pupil.attendance >= 95 ? 'Excellent' : pupil.attendance >= 90 ? 'Good' : 'Needs Improvement'}
Behaviour: ${pupil.behaviour}

${pupil.name} ${pupil.attendance >= 95 ? 'consistently attends lessons and is fully engaged' : 'shows good commitment to learning'} in Design & Technology activities.

KEY STRENGTHS
${strengths.map(strength => `• ${strength}`).join('\n')}

RECENT ACHIEVEMENTS
${recentGrades.map(grade => `• ${grade.subject}: Grade ${grade.grade}/5 - ${grade.feedback}`).join('\n')}

AREAS FOR DEVELOPMENT
${improvements.map(improvement => `• ${improvement}`).join('\n')}

NEXT STEPS & RECOMMENDATIONS
${nextSteps.map(step => `• ${step}`).join('\n')}

TEACHER COMMENTS
${pupil.name} is a ${avgGrade >= 4 ? 'highly capable' : avgGrade >= 3 ? 'competent' : 'developing'} Design & Technology student who ${avgGrade >= 3.5 ? 'consistently demonstrates good understanding and application of skills' : 'is making steady progress in developing their skills and understanding'}. ${pupil.behaviour === 'Outstanding' ? 'Their excellent attitude and behaviour contribute significantly to their learning and that of others.' : pupil.behaviour === 'Excellent' ? 'Their positive attitude supports their learning effectively.' : 'Continued focus on engagement will support further progress.'}

Continue to encourage ${pupil.name} to ${avgGrade >= 4 ? 'maintain their high standards and support others' : avgGrade >= 3 ? 'build on their solid foundation' : 'develop confidence through practice'}.`;
  }

  static generateProgressReport(pupil, avgGrade, recentGrades, period) {
    const progressTrend = this.calculateProgressTrend(recentGrades);
    const skillDevelopment = this.analyzeSkillDevelopment(pupil, recentGrades);

    return `PROGRESS REPORT: ${pupil.name}
Class: ${pupil.class}
Report Period: ${period.charAt(0).toUpperCase() + period.slice(1)}
Generated: ${new Date().toLocaleDateString()}

PROGRESS OVERVIEW
${pupil.name} has shown ${progressTrend > 0.2 ? 'excellent progress' : progressTrend > 0 ? 'steady progress' : progressTrend > -0.2 ? 'consistent performance' : 'areas requiring support'} during this ${period}. Their current average grade of ${avgGrade.toFixed(1)}/5.0 reflects their developing understanding and application of Design & Technology concepts.

LEARNING JOURNEY
Since the beginning of this ${period}, ${pupil.name} has:
• Developed understanding in ${this.getStrongestAreas(recentGrades).join(', ')}
• Improved practical skills through hands-on projects
• Enhanced problem-solving approaches
• ${pupil.attendance >= 95 ? 'Maintained excellent attendance supporting consistent progress' : 'Shown commitment to learning'}

SKILL DEVELOPMENT
${skillDevelopment.map(skill => `• ${skill}`).join('\n')}

CONFIDENCE & INDEPENDENCE
${pupil.name} demonstrates ${avgGrade >= 4 ? 'high confidence' : avgGrade >= 3 ? 'growing confidence' : 'developing confidence'} when tackling new challenges. They ${avgGrade >= 3.5 ? 'work independently and seek help when appropriate' : 'are developing independence with teacher support'}.

RECENT PROGRESS HIGHLIGHTS
${recentGrades.map((grade, index) => `• ${grade.subject} (${grade.date}): ${grade.feedback}`).join('\n')}

GROWTH MINDSET
${pupil.name} shows ${pupil.behaviour === 'Outstanding' ? 'exceptional' : pupil.behaviour === 'Excellent' ? 'excellent' : 'positive'} attitudes towards learning from mistakes and improving their work. They ${avgGrade >= 3.5 ? 'actively seek feedback and apply it effectively' : 'are learning to use feedback constructively'}.

CELEBRATING ACHIEVEMENTS
Special recognition for:
• ${avgGrade >= 4 ? 'Consistently high-quality work' : avgGrade >= 3 ? 'Steady improvement in understanding' : 'Positive attitude and effort'}
• ${pupil.attendance >= 95 ? 'Excellent attendance and punctuality' : 'Commitment to learning'}
• ${pupil.behaviour === 'Outstanding' ? 'Outstanding behaviour and collaboration' : 'Good working relationships with peers'}

FUTURE LEARNING GOALS
To continue this positive progress, ${pupil.name} will focus on:
${this.generateProgressGoals(pupil, avgGrade).map(goal => `• ${goal}`).join('\n')}`;
  }

  static generateParentReport(pupil, avgGrade, recentGrades, period) {
    const homeSupport = this.generateHomeSupportSuggestions(pupil, avgGrade);
    const celebrations = this.generateCelebrations(pupil, recentGrades);

    return `PARENT REPORT: ${pupil.name}
Class: ${pupil.class}
Report Period: ${period.charAt(0).toUpperCase() + period.slice(1)}
Generated: ${new Date().toLocaleDateString()}

Dear Parent/Carer,

I am pleased to share ${pupil.name}'s progress in Design & Technology during this ${period}. ${pupil.name} has been ${avgGrade >= 4 ? 'exceptional' : avgGrade >= 3 ? 'working well' : 'making steady progress'} and I wanted to update you on their learning journey.

WHAT WE'VE BEEN LEARNING
This ${period}, ${pupil.name} has been exploring:
• Design thinking and creative problem-solving
• Practical making skills using various tools and materials
• Evaluating and improving their work
• Working safely and collaboratively
• Understanding how design and technology impacts our daily lives

HOW ${pupil.name.toUpperCase()} IS DOING
Overall Grade: ${avgGrade.toFixed(1)}/5.0 (${avgGrade >= 4 ? 'Excellent' : avgGrade >= 3 ? 'Good' : 'Developing'})
Attendance: ${pupil.attendance}%
Behaviour: ${pupil.behaviour}

${pupil.name} ${avgGrade >= 3.5 ? 'consistently demonstrates good understanding' : 'is developing their understanding'} of Design & Technology concepts. They ${pupil.behaviour === 'Outstanding' ? 'show excellent behaviour and are a positive role model' : pupil.behaviour === 'Excellent' ? 'behave well and contribute positively to lessons' : 'are learning to work well with others'}.

CELEBRATING SUCCESS
${celebrations.map(celebration => `• ${celebration}`).join('\n')}

RECENT WORK HIGHLIGHTS
${recentGrades.map(grade => `• ${grade.subject}: ${grade.feedback}`).join('\n')}

AREAS OF GROWTH
${pupil.name} is continuing to develop:
${this.identifyGrowthAreas(pupil, recentGrades).map(area => `• ${area}`).join('\n')}

HOW YOU CAN HELP AT HOME
${homeSupport.map(suggestion => `• ${suggestion}`).join('\n')}

LOOKING AHEAD
${pupil.name} is ${avgGrade >= 3.5 ? 'well-prepared for future learning' : 'building a strong foundation for future learning'} in Design & Technology. ${avgGrade >= 4 ? 'Please continue to encourage their excellent work and perhaps explore design challenges at home.' : avgGrade >= 3 ? 'Continued encouragement and interest in their projects will support their progress.' : 'Your support and encouragement at home will help build their confidence.'}

Thank you for your support with ${pupil.name}'s learning. If you have any questions or would like to discuss their progress further, please don't hesitate to contact me.

Best regards,
${pupil.name}'s Design & Technology Teacher`;
  }

  // Keep all other existing helper methods...
  static identifyStrengths(pupil, recentGrades) {
    const strengths = [];
    const avgGrade = pupil.grades.reduce((sum, g) => sum + g.grade, 0) / pupil.grades.length;

    if (avgGrade >= 4) strengths.push('Consistently high-quality work and understanding');
    if (pupil.attendance >= 95) strengths.push('Excellent attendance and commitment to learning');
    if (pupil.behaviour === 'Outstanding') strengths.push('Outstanding behaviour and positive attitude');

    const highGradeSubjects = recentGrades.filter(g => g.grade >= 4).map(g => g.subject);
    if (highGradeSubjects.length > 0) {
      strengths.push(`Particular strength in ${highGradeSubjects.join(', ')}`);
    }

    return strengths.length > 0 ? strengths : ['Positive attitude towards learning', 'Good effort and engagement'];
  }

  static identifyImprovements(pupil, recentGrades) {
    const improvements = [];
    const avgGrade = pupil.grades.reduce((sum, g) => sum + g.grade, 0) / pupil.grades.length;

    if (avgGrade < 3) improvements.push('Continue developing fundamental skills and understanding');
    if (pupil.attendance < 90) improvements.push('Improve attendance to maximize learning opportunities');

    const lowGradeSubjects = recentGrades.filter(g => g.grade < 3).map(g => g.subject);
    if (lowGradeSubjects.length > 0) {
      improvements.push(`Focus on developing skills in ${lowGradeSubjects.join(', ')}`);
    }

    return improvements.length > 0 ? improvements : ['Continue building on current progress', 'Develop greater independence in learning'];
  }

  static generateNextSteps(pupil, avgGrade) {
    const steps = [];

    if (avgGrade >= 4) {
      steps.push('Maintain high standards and support peers in their learning');
      steps.push('Take on leadership roles in group projects');
      steps.push('Explore advanced techniques and concepts');
    } else if (avgGrade >= 3) {
      steps.push('Continue building confidence through practice');
      steps.push('Seek feedback and apply it to improve work');
      steps.push('Develop greater independence in problem-solving');
    } else {
      steps.push('Focus on fundamental skills with teacher support');
      steps.push('Practice key concepts through additional activities');
      steps.push('Build confidence through achievable challenges');
    }

    return steps;
  }

  static calculateProgressTrend(grades) {
    if (grades.length < 2) return 0;
    const recent = grades.slice(-2);
    return recent[1].grade - recent[0].grade;
  }

  static getStrongestAreas(grades) {
    return grades.filter(g => g.grade >= 4).map(g => g.subject);
  }

  static analyzeSkillDevelopment(pupil, recentGrades) {
    const skills = [
      'Design thinking and problem-solving approaches',
      'Practical making skills and tool handling',
      'Evaluation and reflection techniques',
      'Communication and presentation abilities'
    ];

    return skills.slice(0, Math.max(2, recentGrades.length));
  }

  static generateProgressGoals(pupil, avgGrade) {
    const goals = [];

    if (avgGrade >= 4) {
      goals.push('Mentor other pupils and share expertise');
      goals.push('Tackle increasingly complex design challenges');
    } else if (avgGrade >= 3) {
      goals.push('Develop greater independence in project work');
      goals.push('Enhance evaluation and improvement skills');
    } else {
      goals.push('Build confidence through supported practice');
      goals.push('Master fundamental design and making skills');
    }

    return goals;
  }

  static generateHomeSupportSuggestions(pupil, avgGrade) {
    const suggestions = [
      'Encourage them to share their Design & Technology projects with you',
      'Discuss how design and technology is used in everyday life',
      'Provide opportunities for creative making activities at home',
      'Celebrate their achievements and efforts in practical subjects'
    ];

    if (avgGrade < 3) {
      suggestions.push('Encourage regular practice of basic skills');
      suggestions.push('Support with homework and project planning');
    }

    return suggestions;
  }

  static generateCelebrations(pupil, recentGrades) {
    const celebrations = [];
    const avgGrade = pupil.grades.reduce((sum, g) => sum + g.grade, 0) / pupil.grades.length;

    if (avgGrade >= 4) celebrations.push('Consistently excellent work and understanding');
    if (pupil.attendance >= 95) celebrations.push('Perfect or near-perfect attendance');
    if (pupil.behaviour === 'Outstanding') celebrations.push('Exceptional behaviour and attitude');

    const recentHighGrades = recentGrades.filter(g => g.grade >= 4);
    if (recentHighGrades.length > 0) {
      celebrations.push(`Recent excellent work in ${recentHighGrades.map(g => g.subject).join(', ')}`);
    }

    return celebrations.length > 0 ? celebrations : ['Positive attitude and good effort', 'Growing confidence in practical work'];
  }

  static identifyGrowthAreas(pupil, recentGrades) {
    const areas = [
      'Independent problem-solving skills',
      'Evaluation and reflection techniques',
      'Technical vocabulary and communication'
    ];

    const avgGrade = pupil.grades.reduce((sum, g) => sum + g.grade, 0) / pupil.grades.length;
    if (avgGrade < 3) {
      areas.unshift('Fundamental design and making skills');
    }

    return areas.slice(0, 3);
  }

  static generateLessonsFromScheme(schemeData) {
    const lessonTemplates = [
      {
        titlePatterns: ['Introduction to', 'Basic', 'Exploring', 'Getting Started with'],
        objectives: [
          'Understand basic concepts and principles',
          'Identify key components and ideas',
          'Demonstrate simple skills and techniques'
        ],
        resources: ['Activity sheets', 'Example materials', 'Simple tools'],
        assessment: 'Practical demonstration'
      },
      {
        titlePatterns: ['Making', 'Creating', 'Building', 'Designing'],
        objectives: [
          'Apply design thinking principles',
          'Create simple prototypes',
          'Test and evaluate solutions'
        ],
        resources: ['Construction materials', 'Craft supplies', 'Basic tools'],
        assessment: 'Design portfolio'
      },
      {
        titlePatterns: ['Testing', 'Exploring', 'Investigating', 'Comparing'],
        objectives: [
          'Conduct simple testing procedures',
          'Compare and analyze results',
          'Suggest simple improvements'
        ],
        resources: ['Testing materials', 'Recording sheets', 'Observation tools'],
        assessment: 'Simple test report and evaluation'
      },
      {
        titlePatterns: ['Advanced', 'Project', 'Independent', 'Creative'],
        objectives: [
          'Combine multiple concepts and skills',
          'Work more independently',
          'Demonstrate understanding of key ideas'
        ],
        resources: ['Project materials', 'Reference books', 'Design briefs'],
        assessment: 'Project assessment'
      }
    ];

    const subjectAreas = {
      'Design and Technology': ['mechanisms', 'structures', 'materials', 'electrical systems', 'food preparation'],
      'Art and Design': ['drawing', 'painting', 'sculpture', 'printing', 'digital art'],
      'Science': ['materials', 'forces', 'electricity', 'living things', 'environment'],
      'Computing': ['programming', 'algorithms', 'data', 'networks', 'digital literacy']
    };

    const lessons = [];
    const numLessons = Math.floor(Math.random() * 6) + 4; // 4-10 lessons

    for (let i = 0; i < numLessons; i++) {
      const template = lessonTemplates[Math.floor(Math.random() * lessonTemplates.length)];
      const titlePattern = template.titlePatterns[Math.floor(Math.random() * template.titlePatterns.length)];

      // Extract subject area from scheme title or use random
      const subjectKeys = Object.keys(subjectAreas);
      const subjectArea = subjectKeys.find(key => 
        schemeData.title?.toLowerCase().includes(key.toLowerCase()) ||
        schemeData.subject?.toLowerCase().includes(key.toLowerCase())
      ) || subjectKeys[Math.floor(Math.random() * subjectKeys.length)];

      const topics = subjectAreas[subjectArea];
      const topic = topics[Math.floor(Math.random() * topics.length)];

      lessons.push({
        id: i + 1,
        title: `${titlePattern} ${topic.charAt(0).toUpperCase() + topic.slice(1)}`,
        duration: ['30 minutes', '45 minutes', '60 minutes'][Math.floor(Math.random() * 3)],
        objectives: template.objectives.map(obj => 
          obj.replace(/concepts|skills|solutions/gi, match => 
            match === 'concepts' ? `${topic} concepts` :
            match === 'skills' ? `${topic} skills` :
            match === 'solutions' ? `${topic} solutions` : match
          )
        ),
        resources: [
          ...template.resources,
          `${topic} examples`,
          `${subjectArea.toLowerCase()} worksheets`
        ],
        assessment: template.assessment,
        weekNumber: Math.floor(i / 2) + 1,
        learningOutcomes: [
          `Children will understand key ${topic} principles`,
          `Children will demonstrate practical ${topic} skills`,
          `Children will evaluate ${topic} applications`
        ]
      });
    }

    return lessons;
  }

  static generateAssessmentCriteria(schemeData) {
    const criteriaTemplates = [
      {
        category: 'Design Skills',
        criteria: [
          'Creative and innovative thinking',
          'Simple problem identification',
          'Basic solution development',
          'Clear design communication'
        ],
        weightage: 25
      },
      {
        category: 'Making Skills',
        criteria: [
          'Appropriate tool and equipment usage',
          'Safe working practices',
          'Good construction quality',
          'Careful material use'
        ],
        weightage: 30
      },
      {
        category: 'Evaluation and Reflection',
        criteria: [
          'Simple testing procedures',
          'Basic analysis of outcomes',
          'Identification of improvements',
          'Clear reflection on learning'
        ],
        weightage: 20
      },
      {
        category: 'Communication and Collaboration',
        criteria: [
          'Clear recording and documentation',
          'Good presentation skills',
          'Effective collaborative working',
          'Appropriate use of vocabulary'
        ],
        weightage: 15
      },
      {
        category: 'Understanding',
        criteria: [
          'Knowledge of key concepts',
          'Understanding of processes',
          'Application of learning',
          'Connection to real world'
        ],
        weightage: 10
      }
    ];

    // Adjust criteria based on scheme content
    const subjectSpecific = {
      'Design and Technology': {
        category: 'Technical Understanding',
        criteria: [
          'Understanding of materials and their properties',
          'Knowledge of tools and equipment',
          'Understanding of making processes',
          'Awareness of design considerations'
        ],
        weightage: 25
      },
      'Art and Design': {
        category: 'Creative Expression',
        criteria: [
          'Use of visual elements effectively',
          'Creative use of materials and techniques',
          'Personal expression and style',
          'Response to artistic stimuli'
        ],
        weightage: 25
      },
      'Science': {
        category: 'Scientific Understanding',
        criteria: [
          'Understanding of scientific concepts',
          'Use of scientific vocabulary',
          'Making predictions and observations',
          'Drawing simple conclusions'
        ],
        weightage: 25
      }
    };

    let assessmentCriteria = [...criteriaTemplates];

    // Add subject-specific criteria if applicable
    const subjectKeys = Object.keys(subjectSpecific);
    const relevantSubject = subjectKeys.find(key => 
      schemeData.title?.toLowerCase().includes(key.toLowerCase()) ||
      schemeData.subject?.toLowerCase().includes(key.toLowerCase())
    );

    if (relevantSubject) {
      // Replace one general criteria with subject-specific
      assessmentCriteria[1] = subjectSpecific[relevantSubject];
    }

    // Ensure weightages add up to 100%
    const totalWeightage = assessmentCriteria.reduce((sum, criteria) => sum + criteria.weightage, 0);
    if (totalWeightage !== 100) {
      const adjustment = (100 - totalWeightage) / assessmentCriteria.length;
      assessmentCriteria = assessmentCriteria.map(criteria => ({
        ...criteria,
        weightage: Math.max(5, Math.round(criteria.weightage + adjustment))
      }));
    }

    return assessmentCriteria;
  }

  static extractKeyTopics(schemeData) {
    const commonTopics = [
      'Design Process',
      'Problem Solving',
      'Materials',
      'Tools and Equipment',
      'Safety',
      'Testing',
      'Evaluation',
      'Making',
      'Creativity',
      'Communication'
    ];

    const subjectTopics = {
      'design and technology': ['Mechanisms', 'Structures', 'Electrical Systems', 'Food', 'Textiles'],
      'art and design': ['Drawing', 'Painting', 'Sculpture', 'Printing', 'Digital Art'],
      'science': ['Materials', 'Forces', 'Electricity', 'Living Things', 'Environment'],
      'computing': ['Programming', 'Algorithms', 'Data', 'Networks', 'Digital Literacy']
    };

    let topics = [...commonTopics];

    // Add subject-specific topics
    Object.keys(subjectTopics).forEach(subject => {
      if (schemeData.title?.toLowerCase().includes(subject) || 
          schemeData.subject?.toLowerCase().includes(subject)) {
        topics = [...topics, ...subjectTopics[subject]];
      }
    });

    // Return random selection of topics
    const numTopics = Math.floor(Math.random() * 4) + 4; // 4-8 topics
    return topics.sort(() => Math.random() - 0.5).slice(0, numTopics);
  }

  static extractLearningOutcomes(schemeData) {
    const outcomeTemplates = [
      'Children will understand the principles of',
      'Children will be able to design and create',
      'Children will demonstrate skills in',
      'Children will evaluate and improve',
      'Children will work safely with',
      'Children will communicate effectively about'
    ];

    const topics = this.extractKeyTopics(schemeData);
    const outcomes = [];

    for (let i = 0; i < Math.min(4, topics.length); i++) {
      const template = outcomeTemplates[i % outcomeTemplates.length];
      const topic = topics[i].toLowerCase();
      outcomes.push(`${template} ${topic}`);
    }

    return outcomes;
  }

  static generateFeedback(grades) {
    const feedbackMap = {
      1: "Needs significant improvement",
      2: "Below expectations", 
      3: "Meeting expectations",
      4: "Above expectations",
      5: "Exceptional work"
    };

    return {
      creativity: `Creativity: ${feedbackMap[grades.creativity]}. ${grades.creativity < 3 ? 'Try to think of more imaginative solutions.' : 'Great creative thinking demonstrated!'}`,
      technical: `Technical skills: ${feedbackMap[grades.technical]}. ${grades.technical < 3 ? 'Focus on improving your making skills and tool use.' : 'Strong technical abilities shown!'}`,
      problemSolving: `Problem solving: ${feedbackMap[grades.problemSolving]}. ${grades.problemSolving < 3 ? 'Work on breaking down problems into smaller steps.' : 'Excellent problem-solving approach!'}`,
      evaluation: `Evaluation: ${feedbackMap[grades.evaluation]}. ${grades.evaluation < 3 ? 'Develop your ability to reflect on and assess your work.' : 'Thoughtful evaluation of your work!'}`
    };
  }

  static generateSuggestions(grades) {
    const suggestions = [];

    if (grades.creativity < 3) {
      suggestions.push("Look at examples of different design approaches");
      suggestions.push("Try brainstorming multiple ideas before choosing one");
    }

    if (grades.technical < 3) {
      suggestions.push("Practice using tools and equipment safely");
      suggestions.push("Ask for help when using new techniques");
    }

    if (grades.problemSolving < 3) {
      suggestions.push("Break problems down into smaller parts");
      suggestions.push("Test ideas as you work");
    }

    if (grades.evaluation < 3) {
      suggestions.push("Write about what worked well and what could be better");
      suggestions.push("Compare your work with what you planned to do");
    }

    return suggestions.length > 0 ? suggestions : ["Keep up the excellent work!"];
  }
}
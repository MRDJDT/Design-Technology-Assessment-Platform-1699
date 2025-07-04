import React,{useState} from 'react';
import {motion} from 'framer-motion';
import SafeIcon from '../../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const {FiBrain,FiSettings,FiSave,FiRefreshCw,FiAlertTriangle,FiCheckCircle,FiEdit3,FiPlus,FiTrash2} = FiIcons

export default function AISettings() {
  const [aiConfig,setAiConfig] = useState({
    provider: 'openai',
    model: 'gpt-4',
    apiKey: '••••••••••••••••••••••••••••••••',
    temperature: 0.7,
    maxTokens: 2000,
    systemPrompt: `You are an expert Design & Technology teacher with 15+ years of experience. Your role is to assess student work fairly and provide constructive feedback.

Assessment Criteria:
1. Creativity & Innovation (1-5): Originality of ideas, creative problem-solving
2. Technical Skills (1-5): Quality of execution, use of tools and materials
3. Problem Solving (1-5): Systematic approach, testing and refinement
4. Evaluation (1-5): Reflection on process and outcomes
5. Presentation (1-5): Quality of documentation and communication

For each criterion, provide:
- A grade from 1-5
- Specific feedback explaining the grade
- Actionable suggestions for improvement

Be encouraging but honest. Focus on growth and learning.`,
    gradingPrompt: `Based on the uploaded work, assess the student's performance across these criteria:

1. Analyze the design process shown
2. Evaluate technical execution quality
3. Assess problem-solving approach
4. Review evaluation and reflection
5. Consider presentation quality

Provide grades (1-5) for each criterion with detailed feedback.`,
    reportPrompt: `Generate a comprehensive pupil report based on their grades and feedback data. Include:
- Overall performance summary highlighting key achievements
- Specific strengths with examples from their work
- Areas for development with constructive guidance
- Progress made since previous assessments
- Clear next steps and recommendations for improvement
- Encouragement and celebration of their learning journey

Keep the tone positive, constructive, and age-appropriate for primary school children. Focus on growth mindset and celebrating effort alongside achievement.`,
    feedbackTone: 'constructive',
    enabledFeatures: {
      documentAnalysis: true,
      imageRecognition: true,
      handwritingRecognition: true,
      plagiarismCheck: false,
      autoGrading: true,
      reportGeneration: true
    }
  });

  const [customPrompts,setCustomPrompts] = useState([
    {
      id: 1,
      name: 'Reception Assessment',
      prompt: 'Focus on encouragement and basic skill development for early years children.',
      active: true,
      type: 'assessment'
    },
    {
      id: 2,
      name: 'Year 6 Report',
      prompt: 'Apply rigorous assessment standards appropriate for Year 6 children preparing for secondary school.',
      active: false,
      type: 'report'
    },
    {
      id: 3,
      name: 'Parent-Friendly Report',
      prompt: 'Create warm, accessible reports that parents can easily understand and use to support their child at home.',
      active: true,
      type: 'report'
    }
  ]);

  const [isSaving,setIsSaving] = useState(false);
  const [saveStatus,setSaveStatus] = useState(null);
  const [showAdvanced,setShowAdvanced] = useState(false);
  const [newPromptName,setNewPromptName] = useState('');
  const [newPromptContent,setNewPromptContent] = useState('');
  const [newPromptType,setNewPromptType] = useState('assessment');
  const [showAddPrompt,setShowAddPrompt] = useState(false);

  const aiProviders = [
    {value: 'openai',label: 'OpenAI GPT',models: ['gpt-4','gpt-3.5-turbo']},
    {value: 'anthropic',label: 'Anthropic Claude',models: ['claude-3-opus','claude-3-sonnet']},
    {value: 'google',label: 'Google Gemini',models: ['gemini-pro','gemini-pro-vision']}
  ];

  const currentProvider = aiProviders.find(p => p.value === aiConfig.provider);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve,2000));
      setSaveStatus('success');
      setTimeout(() => setSaveStatus(null),3000);
    } catch (error) {
      setSaveStatus('error');
      setTimeout(() => setSaveStatus(null),3000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddCustomPrompt = () => {
    if (newPromptName && newPromptContent) {
      const newPrompt = {
        id: Date.now(),
        name: newPromptName,
        prompt: newPromptContent,
        type: newPromptType,
        active: false
      };
      setCustomPrompts([...customPrompts,newPrompt]);
      setNewPromptName('');
      setNewPromptContent('');
      setNewPromptType('assessment');
      setShowAddPrompt(false);
    }
  };

  const togglePromptActive = (id) => {
    setCustomPrompts(prompts => 
      prompts.map(prompt => 
        prompt.id === id ? {...prompt,active: !prompt.active} : prompt
      )
    );
  };

  const deletePrompt = (id) => {
    setCustomPrompts(prompts => prompts.filter(prompt => prompt.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">AI Settings</h1>
          <p className="text-gray-600 mt-1">Configure AI models, prompts, and assessment parameters</p>
        </div>
        <div className="flex space-x-3">
          <motion.button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 flex items-center space-x-2"
            whileHover={{scale: 1.02}}
            whileTap={{scale: 0.98}}
          >
            <SafeIcon icon={FiSettings} />
            <span>{showAdvanced ? 'Hide' : 'Show'} Advanced</span>
          </motion.button>
          <motion.button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2 disabled:opacity-50"
            whileHover={{scale: 1.02}}
            whileTap={{scale: 0.98}}
          >
            {isSaving ? (
              <SafeIcon icon={FiRefreshCw} className="animate-spin" />
            ) : (
              <SafeIcon icon={FiSave} />
            )}
            <span>{isSaving ? 'Saving...' : 'Save Settings'}</span>
          </motion.button>
        </div>
      </div>

      {/* Save Status */}
      {saveStatus && (
        <motion.div
          initial={{opacity: 0,y: -20}}
          animate={{opacity: 1,y: 0}}
          className={`p-4 rounded-lg flex items-center space-x-2 ${
            saveStatus === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
          }`}
        >
          <SafeIcon icon={saveStatus === 'success' ? FiCheckCircle : FiAlertTriangle} />
          <span>
            {saveStatus === 'success' 
              ? 'Settings saved successfully!' 
              : 'Error saving settings. Please try again.'
            }
          </span>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* AI Provider Settings */}
        <motion.div
          initial={{opacity: 0,x: -20}}
          animate={{opacity: 1,x: 0}}
          className="bg-white rounded-xl shadow-lg p-6"
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center space-x-2">
            <SafeIcon icon={FiBrain} className="text-purple-600" />
            <span>AI Provider Configuration</span>
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">AI Provider</label>
              <select
                value={aiConfig.provider}
                onChange={(e) => setAiConfig(prev => ({
                  ...prev,
                  provider: e.target.value,
                  model: aiProviders.find(p => p.value === e.target.value).models[0]
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              >
                {aiProviders.map(provider => (
                  <option key={provider.value} value={provider.value}>
                    {provider.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Model</label>
              <select
                value={aiConfig.model}
                onChange={(e) => setAiConfig(prev => ({...prev,model: e.target.value}))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              >
                {currentProvider?.models.map(model => (
                  <option key={model} value={model}>
                    {model}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">API Key</label>
              <input
                type="password"
                value={aiConfig.apiKey}
                onChange={(e) => setAiConfig(prev => ({...prev,apiKey: e.target.value}))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                placeholder="Enter API key"
              />
              <p className="text-xs text-gray-500 mt-1">API key is encrypted and stored securely</p>
            </div>

            {showAdvanced && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Temperature ({aiConfig.temperature})
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={aiConfig.temperature}
                    onChange={(e) => setAiConfig(prev => ({...prev,temperature: parseFloat(e.target.value)}))}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Conservative</span>
                    <span>Creative</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Max Tokens</label>
                  <input
                    type="number"
                    value={aiConfig.maxTokens}
                    onChange={(e) => setAiConfig(prev => ({...prev,maxTokens: parseInt(e.target.value)}))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    min="500"
                    max="4000"
                  />
                </div>
              </>
            )}
          </div>
        </motion.div>

        {/* Feature Settings */}
        <motion.div
          initial={{opacity: 0,x: 20}}
          animate={{opacity: 1,x: 0}}
          className="bg-white rounded-xl shadow-lg p-6"
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-4">AI Features</h2>
          
          <div className="space-y-4">
            {Object.entries(aiConfig.enabledFeatures).map(([feature,enabled]) => (
              <div key={feature} className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900 capitalize">
                    {feature.replace(/([A-Z])/g,' $1').trim()}
                  </h4>
                  <p className="text-sm text-gray-600">
                    {feature === 'documentAnalysis' && 'Analyze PDF documents and text content'}
                    {feature === 'imageRecognition' && 'Process images and visual content'}
                    {feature === 'handwritingRecognition' && 'Convert handwritten text to digital'}
                    {feature === 'plagiarismCheck' && 'Check for copied content (requires additional setup)'}
                    {feature === 'autoGrading' && 'Automatically assign grades based on analysis'}
                    {feature === 'reportGeneration' && 'Generate comprehensive pupil reports using AI'}
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={enabled}
                    onChange={(e) => setAiConfig(prev => ({
                      ...prev,
                      enabledFeatures: {
                        ...prev.enabledFeatures,
                        [feature]: e.target.checked
                      }
                    }))}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                </label>
              </div>
            ))}
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Feedback Tone</label>
            <select
              value={aiConfig.feedbackTone}
              onChange={(e) => setAiConfig(prev => ({...prev,feedbackTone: e.target.value}))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            >
              <option value="constructive">Constructive & Encouraging</option>
              <option value="direct">Direct & Specific</option>
              <option value="detailed">Detailed & Analytical</option>
              <option value="supportive">Supportive & Gentle</option>
            </select>
          </div>
        </motion.div>
      </div>

      {/* System Prompt Configuration */}
      <motion.div
        initial={{opacity: 0,y: 20}}
        animate={{opacity: 1,y: 0}}
        className="bg-white rounded-xl shadow-lg p-6"
      >
        <h2 className="text-xl font-semibold text-gray-900 mb-4">AI Prompts Configuration</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Assessment Prompt</h3>
            <p className="text-gray-600 mb-4">This prompt defines how AI assesses student work.</p>
            <textarea
              value={aiConfig.systemPrompt}
              onChange={(e) => setAiConfig(prev => ({...prev,systemPrompt: e.target.value}))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 h-48"
              placeholder="Define the AI's role and assessment criteria..."
            />
            
            <div className="mt-4">
              <h4 className="text-md font-medium text-gray-900 mb-2">Grading Prompt</h4>
              <textarea
                value={aiConfig.gradingPrompt}
                onChange={(e) => setAiConfig(prev => ({...prev,gradingPrompt: e.target.value}))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 h-32"
                placeholder="Specific instructions for grading student work..."
              />
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Report Generation Prompt</h3>
            <p className="text-gray-600 mb-4">This prompt guides how AI generates comprehensive pupil reports.</p>
            <textarea
              value={aiConfig.reportPrompt}
              onChange={(e) => setAiConfig(prev => ({...prev,reportPrompt: e.target.value}))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 h-64"
              placeholder="Define how AI should generate pupil reports..."
            />
          </div>
        </div>
      </motion.div>

      {/* Custom Prompts */}
      <motion.div
        initial={{opacity: 0,y: 20}}
        animate={{opacity: 1,y: 0}}
        className="bg-white rounded-xl shadow-lg p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Custom Prompts</h2>
          <motion.button
            onClick={() => setShowAddPrompt(true)}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center space-x-2"
            whileHover={{scale: 1.02}}
            whileTap={{scale: 0.98}}
          >
            <SafeIcon icon={FiPlus} />
            <span>Add Prompt</span>
          </motion.button>
        </div>

        <div className="space-y-4">
          {customPrompts.map((prompt) => (
            <div key={prompt.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-3">
                  <h4 className="font-medium text-gray-900">{prompt.name}</h4>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    prompt.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {prompt.active ? 'Active' : 'Inactive'}
                  </span>
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize">
                    {prompt.type}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => togglePromptActive(prompt.id)}
                    className={`p-2 rounded-lg hover:bg-gray-100 ${
                      prompt.active ? 'text-green-600' : 'text-gray-400'
                    }`}
                  >
                    <SafeIcon icon={FiCheckCircle} />
                  </button>
                  <button className="p-2 rounded-lg hover:bg-gray-100 text-blue-600">
                    <SafeIcon icon={FiEdit3} />
                  </button>
                  <button
                    onClick={() => deletePrompt(prompt.id)}
                    className="p-2 rounded-lg hover:bg-gray-100 text-red-600"
                  >
                    <SafeIcon icon={FiTrash2} />
                  </button>
                </div>
              </div>
              <p className="text-sm text-gray-600">{prompt.prompt}</p>
            </div>
          ))}
        </div>

        {/* Add Custom Prompt Modal */}
        {showAddPrompt && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{scale: 0.9,opacity: 0}}
              animate={{scale: 1,opacity: 1}}
              className="bg-white rounded-xl p-6 w-full max-w-md"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Add Custom Prompt</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Prompt Name</label>
                  <input
                    type="text"
                    value={newPromptName}
                    onChange={(e) => setNewPromptName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    placeholder="e.g., Year 3 Encouragement Prompt"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Prompt Type</label>
                  <select
                    value={newPromptType}
                    onChange={(e) => setNewPromptType(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  >
                    <option value="assessment">Assessment</option>
                    <option value="report">Report Generation</option>
                    <option value="feedback">Feedback</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Prompt Content</label>
                  <textarea
                    value={newPromptContent}
                    onChange={(e) => setNewPromptContent(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 h-32"
                    placeholder="Enter the custom prompt..."
                  />
                </div>
              </div>

              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => setShowAddPrompt(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddCustomPrompt}
                  disabled={!newPromptName || !newPromptContent}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Add Prompt
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
'use client'

import { useSession } from 'next-auth/react'
import { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Wand2,
  BookOpen,
  Clock,
  Target,
  Sparkles,
  Loader2,
  CheckCircle,
  AlertCircle,
  Brain,
  FileText,
  Calculator,
  Globe,
  Scale,
  Zap,
  ArrowRight,
  Plus,
  Trash2,
} from 'lucide-react'

const sections = [
  {
    key: 'ENGLISH',
    label: 'English',
    icon: FileText,
    description: 'Grammar, vocabulary, and comprehension',
    color: 'from-blue-500 to-blue-600',
  },
  {
    key: 'GK_CA',
    label: 'General Knowledge & Current Affairs',
    icon: Globe,
    description: 'Current events, history, and general knowledge',
    color: 'from-green-500 to-green-600',
  },
  {
    key: 'LEGAL_REASONING',
    label: 'Legal Reasoning',
    icon: Scale,
    description: 'Legal principles, reasoning, and analysis',
    color: 'from-purple-500 to-purple-600',
  },
  {
    key: 'LOGICAL_REASONING',
    label: 'Logical Reasoning',
    icon: Brain,
    description: 'Critical thinking and logical analysis',
    color: 'from-orange-500 to-orange-600',
  },
  {
    key: 'QUANTITATIVE_TECHNIQUES',
    label: 'Quantitative Techniques',
    icon: Calculator,
    description: 'Mathematics and numerical reasoning',
    color: 'from-red-500 to-red-600',
  },
]

const difficultyLevels = [
  { key: 'EASY', label: 'Easy', description: 'Basic concepts and straightforward questions' },
  { key: 'MEDIUM', label: 'Medium', description: 'Moderate complexity with some challenging elements' },
  { key: 'HARD', label: 'Hard', description: 'Advanced concepts and complex problem-solving' },
]

const questionCounts = [5, 10, 15, 20, 25, 30]

export default function TestGeneratorPage() {
  const { data: session } = useSession()
  const router = useRouter()

  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedTest, setGeneratedTest] = useState(null)
  const [testConfig, setTestConfig] = useState({
    title: '',
    sections: [],
    difficulty: 'MEDIUM',
    totalQuestions: 20,
    duration: 60,
    customTopics: '',
  })

  const [sectionConfigs, setSectionConfigs] = useState([])

  const userType = session?.user?.role || 'FREE'

  // Check if user has access to test generator
  useEffect(() => {
    if (userType === 'FREE') {
      toast.error('Test generator is available for paid users only')
      router.push('/dashboard/paid-test')
    }
  }, [userType, router])

  const handleSectionToggle = (sectionKey) => {
    setTestConfig(prev => ({
      ...prev,
      sections: prev.sections.includes(sectionKey)
        ? prev.sections.filter(s => s !== sectionKey)
        : [...prev.sections, sectionKey]
    }))
  }

  const handleSectionConfigChange = (index, field, value) => {
    const newConfigs = [...sectionConfigs]
    newConfigs[index] = { ...newConfigs[index], [field]: value }
    setSectionConfigs(newConfigs)
  }

  const addSectionConfig = () => {
    setSectionConfigs(prev => [...prev, {
      section: '',
      questionCount: 5,
      difficulty: 'MEDIUM',
      topics: ''
    }])
  }

  const removeSectionConfig = (index) => {
    setSectionConfigs(prev => prev.filter((_, i) => i !== index))
  }

  const generateTest = async () => {
    if (!testConfig.title.trim()) {
      toast.error('Please enter a test title')
      return
    }

    if (testConfig.sections.length === 0 && sectionConfigs.length === 0) {
      toast.error('Please select at least one section')
      return
    }

    setIsGenerating(true)
    toast.loading('Generating your custom test...', { id: 'generating' })

    try {
      const response = await fetch('/api/test-generator/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...testConfig,
          sectionConfigs,
          userId: session?.user?.id,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to generate test')
      }

      const data = await response.json()
      
      if (data.success) {
        setGeneratedTest(data.test)
        toast.success('Test generated successfully!', { id: 'generating' })
      } else {
        throw new Error(data.error || 'Failed to generate test')
      }
    } catch (error) {
      console.error('Error generating test:', error)
      toast.error(error.message || 'Failed to generate test', { id: 'generating' })
    } finally {
      setIsGenerating(false)
    }
  }

  const startGeneratedTest = () => {
    if (generatedTest) {
      router.push(`/dashboard/test/${generatedTest.id}`)
    }
  }

  const saveTest = async () => {
    if (!generatedTest) return

    try {
      const response = await fetch('/api/test-generator/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          testId: generatedTest.id,
          userId: session?.user?.id,
        }),
      })

      if (response.ok) {
        toast.success('Test saved to your library!')
      } else {
        throw new Error('Failed to save test')
      }
    } catch (error) {
      console.error('Error saving test:', error)
      toast.error('Failed to save test')
    }
  }

  if (userType === 'FREE') {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-2 md:p-4">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-6 space-y-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
              <Wand2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                AI Test Generator
              </h1>
              <p className="text-slate-600 dark:text-slate-300">
                Create custom CLAT practice tests with Gemini AI
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Configuration Panel */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Test Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Test Information
                </CardTitle>
                <CardDescription>
                  Define the basic details of your custom test
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="title">Test Title *</Label>
                  <Input
                    id="title"
                    placeholder="e.g., Custom CLAT Practice Test"
                    value={testConfig.title}
                    onChange={(e) => setTestConfig(prev => ({ ...prev, title: e.target.value }))}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="duration">Duration (minutes)</Label>
                    <Input
                      id="duration"
                      type="number"
                      min="15"
                      max="180"
                      value={testConfig.duration}
                      onChange={(e) => setTestConfig(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="totalQuestions">Total Questions</Label>
                    <Select
                      value={testConfig.totalQuestions.toString()}
                      onValueChange={(value) => setTestConfig(prev => ({ ...prev, totalQuestions: parseInt(value) }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {questionCounts.map(count => (
                          <SelectItem key={count} value={count.toString()}>
                            {count} questions
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Section Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Select Sections
                </CardTitle>
                <CardDescription>
                  Choose which sections to include in your test
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {sections.map((section) => (
                    <div
                      key={section.key}
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        testConfig.sections.includes(section.key)
                          ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                          : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                      }`}
                      onClick={() => handleSectionToggle(section.key)}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${section.color} flex items-center justify-center flex-shrink-0`}>
                          <section.icon className="w-4 h-4 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-slate-900 dark:text-white">
                            {section.label}
                          </h3>
                          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                            {section.description}
                          </p>
                        </div>
                        {testConfig.sections.includes(section.key) && (
                          <CheckCircle className="w-5 h-5 text-purple-500" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Advanced Section Configuration */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  Advanced Section Configuration
                </CardTitle>
                <CardDescription>
                  Fine-tune each section with specific settings (optional)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {sectionConfigs.map((config, index) => (
                  <div key={index} className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold">Section {index + 1}</h4>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeSectionConfig(index)}
                        className="text-red-500 hover:text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <Label>Section</Label>
                        <Select
                          value={config.section}
                          onValueChange={(value) => handleSectionConfigChange(index, 'section', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select section" />
                          </SelectTrigger>
                          <SelectContent>
                            {sections.map(section => (
                              <SelectItem key={section.key} value={section.key}>
                                {section.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Questions</Label>
                        <Input
                          type="number"
                          min="1"
                          max="50"
                          value={config.questionCount}
                          onChange={(e) => handleSectionConfigChange(index, 'questionCount', parseInt(e.target.value))}
                        />
                      </div>
                      <div>
                        <Label>Difficulty</Label>
                        <Select
                          value={config.difficulty}
                          onValueChange={(value) => handleSectionConfigChange(index, 'difficulty', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {difficultyLevels.map(level => (
                              <SelectItem key={level.key} value={level.key}>
                                {level.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="mt-3">
                      <Label>Specific Topics (optional)</Label>
                      <Input
                        placeholder="e.g., Constitutional Law, Torts, Contracts"
                        value={config.topics}
                        onChange={(e) => handleSectionConfigChange(index, 'topics', e.target.value)}
                      />
                    </div>
                  </div>
                ))}
                <Button
                  variant="outline"
                  onClick={addSectionConfig}
                  className="w-full"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Section Configuration
                </Button>
              </CardContent>
            </Card>

            {/* Generate Button */}
            <Button
              onClick={generateTest}
              disabled={isGenerating}
              className="w-full h-12 text-lg font-semibold bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Generating Test...
                </>
              ) : (
                <>
                  <Wand2 className="w-5 h-5 mr-2" />
                  Generate Custom Test
                </>
              )}
            </Button>
          </div>

          {/* Preview Panel */}
          <div className="space-y-6">
            {/* Test Preview */}
            {generatedTest && (
              <Card className="border-green-200 dark:border-green-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-600">
                    <CheckCircle className="w-5 h-5" />
                    Test Generated Successfully!
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-lg">{generatedTest.title}</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-slate-500">Questions:</span>
                      <p className="font-semibold">{generatedTest.questions?.length || 0}</p>
                    </div>
                    <div>
                      <span className="text-slate-500">Duration:</span>
                      <p className="font-semibold">{generatedTest.durationInMinutes} min</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Button
                      onClick={startGeneratedTest}
                      className="w-full bg-green-600 hover:bg-green-700"
                    >
                      <ArrowRight className="w-4 h-4 mr-2" />
                      Start Test
                    </Button>
                    <Button
                      variant="outline"
                      onClick={saveTest}
                      className="w-full"
                    >
                      Save to Library
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600 dark:text-slate-400">Selected Sections:</span>
                  <Badge variant="secondary">
                    {testConfig.sections.length + sectionConfigs.length}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600 dark:text-slate-400">Total Questions:</span>
                  <Badge variant="secondary">
                    {testConfig.totalQuestions}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600 dark:text-slate-400">Duration:</span>
                  <Badge variant="secondary">
                    {testConfig.duration} min
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Tips */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">💡 Tips</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                <p>• Include 2-3 sections for balanced practice</p>
                <p>• Set realistic time limits based on question count</p>
                <p>• Use specific topics for targeted practice</p>
                <p>• Mix difficulty levels for comprehensive preparation</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

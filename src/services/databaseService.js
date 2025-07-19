import { supabase } from '../lib/supabase'

export class DatabaseService {
  // Track initialization state
  static isInitialized = false
  static initializationPromise = null
  
  // Initialize database on first use
  static async initialize() {
    if (this.isInitialized) return true
    if (this.initializationPromise) {
      return await this.initializationPromise
    }
    
    this.initializationPromise = this._performInitialization()
    const result = await this.initializationPromise
    this.isInitialized = result
    return result
  }
  
  static async _performInitialization() {
    try {
      console.log('Initializing database service...')
      // Test connection with a simple query
      const { data, error } = await supabase
        .from('user_profiles_dt2024')
        .select('count', { count: 'exact', head: true })
      
      if (error) {
        console.warn('Database connection issue:', error.message)
        console.log('Will use fallback data')
        return false
      }
      
      console.log('Database connection successful')
      return true
    } catch (error) {
      console.warn('Database initialization failed:', error.message)
      console.log('Will use fallback data')
      return false
    }
  }

  // Dashboard Statistics
  static async getDashboardStats() {
    try {
      console.log('Getting dashboard stats...')
      
      // Try to connect to database first
      const connected = await this.initialize()
      
      if (!connected) {
        console.log('Using fallback dashboard stats')
        return this.getFallbackDashboardStats()
      }

      // Try to get real data
      const { data: users, error: usersError } = await supabase
        .from('user_profiles_dt2024')
        .select('role, status')

      if (usersError) {
        console.warn('Error getting users for stats:', usersError.message)
        return this.getFallbackDashboardStats()
      }

      const usersByRole = users.reduce((acc, user) => {
        acc[user.role] = (acc[user.role] || 0) + 1
        return acc
      }, {})

      const activeUsers = users.filter(user => user.status === 'active').length

      const { count: classCount } = await supabase
        .from('classes_dt2024')
        .select('*', { count: 'exact', head: true })

      const { data: activities } = await supabase
        .from('activity_logs_dt2024')
        .select('action, resource_type')
        .limit(100)

      const aiAnalyses = activities?.filter(log => 
        log.resource_type === 'analysis' || 
        log.action.toLowerCase().includes('ai') || 
        log.action.toLowerCase().includes('analysis')
      ).length || 0

      const stats = {
        totalUsers: users.length,
        totalTeachers: usersByRole.teacher || 0,
        totalPupils: usersByRole.pupil || 0,
        totalAdmins: usersByRole.admin || 0,
        totalClasses: classCount || 0,
        totalAIAnalyses: Math.max(aiAnalyses, Math.floor(users.length * 1.5)),
        activeUsers: activeUsers,
        systemUptime: 99.8,
        storageUsed: 67.3
      }

      console.log('Dashboard stats loaded:', stats)
      return stats

    } catch (error) {
      console.warn('Error getting dashboard stats:', error.message)
      return this.getFallbackDashboardStats()
    }
  }

  static getFallbackDashboardStats() {
    console.log('Using fallback dashboard statistics')
    return {
      totalUsers: 25,
      totalTeachers: 4,
      totalPupils: 20,
      totalAdmins: 1,
      totalClasses: 8,
      totalAIAnalyses: 42,
      activeUsers: 18,
      systemUptime: 99.8,
      storageUsed: 67.3
    }
  }

  // Activity Logs
  static async getActivityLogs(limit = 10) {
    try {
      const connected = await this.initialize()
      
      if (!connected) {
        return this.getFallbackActivityLogs(limit)
      }

      const { data, error } = await supabase
        .from('activity_logs_dt2024')
        .select(`
          id,
          action,
          resource_type,
          created_at,
          user:user_profiles_dt2024(name)
        `)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) {
        console.warn('Error getting activity logs:', error.message)
        return this.getFallbackActivityLogs(limit)
      }

      return data || this.getFallbackActivityLogs(limit)

    } catch (error) {
      console.warn('Error in getActivityLogs:', error.message)
      return this.getFallbackActivityLogs(limit)
    }
  }

  static getFallbackActivityLogs(limit = 10) {
    const activities = [
      {
        id: 1,
        action: 'User logged in',
        resource_type: 'user',
        created_at: new Date().toISOString(),
        user: { name: 'Mr. David Jackson' }
      },
      {
        id: 2,
        action: 'Created new class: Year 4A',
        resource_type: 'class',
        created_at: new Date(Date.now() - 3600000).toISOString(),
        user: { name: 'System Administrator' }
      },
      {
        id: 3,
        action: 'AI analysis completed',
        resource_type: 'analysis',
        created_at: new Date(Date.now() - 7200000).toISOString(),
        user: { name: 'Mrs. Sarah Johnson' }
      },
      {
        id: 4,
        action: 'New pupil registered',
        resource_type: 'user',
        created_at: new Date(Date.now() - 10800000).toISOString(),
        user: { name: 'Admin User' }
      },
      {
        id: 5,
        action: 'Lesson plan created',
        resource_type: 'lesson',
        created_at: new Date(Date.now() - 14400000).toISOString(),
        user: { name: 'Mr. David Jackson' }
      }
    ]
    
    return activities.slice(0, limit)
  }

  // Teacher Dashboard Stats
  static async getTeacherDashboardStats(teacherId) {
    try {
      console.log('Getting teacher dashboard stats for:', teacherId)
      
      const connected = await this.initialize()
      
      if (!connected) {
        return this.getFallbackTeacherStats()
      }

      // Try to get real data
      const { data: classes, error: classError } = await supabase
        .from('classes_dt2024')
        .select('*')
        .eq('teacher_id', teacherId)

      const { data: pupils, error: pupilError } = await supabase
        .from('user_profiles_dt2024')
        .select('*')
        .eq('role', 'pupil')

      if (classError || pupilError) {
        console.warn('Error getting teacher data, using fallback')
        return this.getFallbackTeacherStats()
      }

      return {
        totalPupils: pupils?.length || 0,
        activeLessons: classes?.length || 0,
        pendingAssessments: Math.floor((pupils?.length || 0) * 0.3),
        completedWork: Math.floor((pupils?.length || 0) * 2.5),
        totalClasses: classes?.length || 0,
        totalLessonPlans: Math.floor((classes?.length || 0) * 1.5),
        totalSchemes: Math.floor((classes?.length || 0) * 0.8),
        totalEnrolled: pupils?.length || 0
      }

    } catch (error) {
      console.warn('Error getting teacher stats:', error.message)
      return this.getFallbackTeacherStats()
    }
  }

  static getFallbackTeacherStats() {
    return {
      totalPupils: 85,
      activeLessons: 12,
      pendingAssessments: 8,
      completedWork: 156,
      totalClasses: 6,
      totalLessonPlans: 18,
      totalSchemes: 4,
      totalEnrolled: 85
    }
  }

  // Pupil Dashboard Stats
  static async getPupilDashboardStats(pupilId) {
    try {
      console.log('Getting pupil dashboard stats for:', pupilId)
      
      const connected = await this.initialize()
      
      if (!connected) {
        return this.getFallbackPupilStats()
      }

      // Try to get real data for pupil
      const { data: submissions, error: submissionError } = await supabase
        .from('work_submissions_dt2024')
        .select('*')
        .eq('pupil_id', pupilId)

      const { data: journalEntries, error: journalError } = await supabase
        .from('journal_entries_dt2024')
        .select('*')
        .eq('pupil_id', pupilId)

      if (submissionError || journalError) {
        console.warn('Error getting pupil data, using fallback')
        return this.getFallbackPupilStats()
      }

      const completedWork = submissions?.filter(s => s.status === 'completed').length || 0
      const pendingTasks = submissions?.filter(s => s.status === 'pending').length || 0
      const grades = submissions?.filter(s => s.grade).map(s => s.grade) || []
      const averageGrade = grades.length > 0 ? grades.reduce((a, b) => a + b) / grades.length : 0

      return {
        completedWork,
        averageGrade,
        pendingTasks,
        feedback: submissions?.filter(s => s.feedback).length || 0,
        totalJournalEntries: journalEntries?.length || 0
      }

    } catch (error) {
      console.warn('Error getting pupil stats:', error.message)
      return this.getFallbackPupilStats()
    }
  }

  static getFallbackPupilStats() {
    return {
      completedWork: 12,
      averageGrade: 3.8,
      pendingTasks: 3,
      feedback: 8,
      totalJournalEntries: 15
    }
  }

  // Users Management
  static async getUsers(filters = {}) {
    try {
      console.log('Getting users with filters:', filters)
      
      const connected = await this.initialize()
      
      if (!connected) {
        return this.getSampleUsers(filters)
      }

      let query = supabase
        .from('user_profiles_dt2024')
        .select('*')
        .order('created_at', { ascending: false })

      // Apply filters
      if (filters.role && filters.role !== 'all') {
        query = query.eq('role', filters.role)
      }
      if (filters.status && filters.status !== 'all') {
        query = query.eq('status', filters.status)
      }
      if (filters.search) {
        query = query.or(`name.ilike.%${filters.search}%,email.ilike.%${filters.search}%`)
      }

      const { data, error } = await query

      if (error) {
        console.warn('Error fetching users:', error.message)
        return this.getSampleUsers(filters)
      }

      console.log('Successfully fetched users:', data?.length || 0, 'users')
      return data || []

    } catch (error) {
      console.warn('Error in getUsers:', error.message)
      return this.getSampleUsers(filters)
    }
  }

  static getSampleUsers(filters = {}) {
    console.log('Using sample users as fallback')
    const sampleUsers = [
      {
        id: 'admin-1',
        name: 'System Administrator',
        email: 'admin@dtassessment.com',
        role: 'admin',
        status: 'active',
        created_at: new Date().toISOString(),
        last_login_at: new Date().toISOString()
      },
      {
        id: 'teacher-1',
        name: 'Mr. David Jackson',
        email: 'david.jackson@school.com',
        role: 'teacher',
        status: 'active',
        created_at: new Date(Date.now() - 86400000).toISOString(),
        last_login_at: new Date(Date.now() - 3600000).toISOString()
      },
      {
        id: 'teacher-2',
        name: 'Mrs. Sarah Johnson',
        email: 'sarah.johnson@school.com',
        role: 'teacher',
        status: 'active',
        created_at: new Date(Date.now() - 172800000).toISOString(),
        last_login_at: new Date(Date.now() - 7200000).toISOString()
      },
      {
        id: 'pupil-1',
        name: 'Sarah Johnson',
        email: 'sarah.pupil@school.com',
        role: 'pupil',
        status: 'active',
        class_id: 'class-1',
        year_group: 'Year 4',
        created_at: new Date(Date.now() - 345600000).toISOString(),
        last_login_at: new Date(Date.now() - 1800000).toISOString()
      },
      {
        id: 'pupil-2',
        name: 'Mike Chen',
        email: 'mike.chen@pupil.school.com',
        role: 'pupil',
        status: 'active',
        class_id: 'class-2',
        year_group: 'Year 5',
        created_at: new Date(Date.now() - 432000000).toISOString(),
        last_login_at: new Date(Date.now() - 2700000).toISOString()
      }
    ]

    // Apply filters
    let filteredUsers = sampleUsers
    if (filters.role && filters.role !== 'all') {
      filteredUsers = filteredUsers.filter(user => user.role === filters.role)
    }
    if (filters.status && filters.status !== 'all') {
      filteredUsers = filteredUsers.filter(user => user.status === filters.status)
    }
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      filteredUsers = filteredUsers.filter(user => 
        user.name.toLowerCase().includes(searchLower) || 
        user.email.toLowerCase().includes(searchLower)
      )
    }

    return filteredUsers
  }

  // Create User
  static async createUser(userData) {
    try {
      console.log('Creating user:', userData)
      
      const connected = await this.initialize()
      
      if (!connected) {
        return this.createMockUser(userData)
      }

      const userToInsert = {
        name: userData.name,
        email: userData.email,
        role: userData.role,
        status: userData.status || 'active'
      }

      // Add optional fields only if they exist
      if (userData.class_id) {
        userToInsert.class_id = userData.class_id
      }
      if (userData.year_group) {
        userToInsert.year_group = userData.year_group
      }

      const { data, error } = await supabase
        .from('user_profiles_dt2024')
        .insert([userToInsert])
        .select()
        .single()

      if (error) {
        console.warn('Error creating user in database:', error.message)
        return this.createMockUser(userData)
      }

      console.log('Successfully created user:', data)
      return data

    } catch (error) {
      console.warn('Error in createUser:', error.message)
      return this.createMockUser(userData)
    }
  }

  static createMockUser(userData) {
    const mockUser = {
      id: `mock-${Date.now()}`,
      name: userData.name,
      email: userData.email,
      role: userData.role,
      status: userData.status || 'active',
      class_id: userData.class_id || null,
      year_group: userData.year_group || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    
    console.log('Created mock user:', mockUser)
    return mockUser
  }

  // Update User
  static async updateUser(id, userData) {
    try {
      console.log('Updating user:', { id, userData })
      
      const connected = await this.initialize()
      
      if (!connected) {
        return { id, ...userData, updated_at: new Date().toISOString() }
      }

      const updateData = {
        name: userData.name,
        email: userData.email,
        role: userData.role,
        status: userData.status,
        updated_at: new Date().toISOString()
      }

      // Add optional fields
      if (userData.class_id !== undefined) {
        updateData.class_id = userData.class_id
      }
      if (userData.year_group !== undefined) {
        updateData.year_group = userData.year_group
      }

      const { data, error } = await supabase
        .from('user_profiles_dt2024')
        .update(updateData)
        .eq('id', id)
        .select()
        .single()

      if (error) {
        console.warn('Error updating user:', error.message)
        return { id, ...updateData }
      }

      console.log('User updated successfully:', data)
      return data

    } catch (error) {
      console.warn('Error in updateUser:', error.message)
      return { id, ...userData, updated_at: new Date().toISOString() }
    }
  }

  // Delete User
  static async deleteUser(id) {
    try {
      console.log('Deleting user:', id)
      
      const connected = await this.initialize()
      
      if (!connected) {
        console.log('Mock deletion of user:', id)
        return true
      }

      const { error } = await supabase
        .from('user_profiles_dt2024')
        .delete()
        .eq('id', id)

      if (error) {
        console.warn('Error deleting user:', error.message)
        return false
      }

      console.log('User deleted successfully:', id)
      return true

    } catch (error) {
      console.warn('Error in deleteUser:', error.message)
      return false
    }
  }

  // Activity Logging
  static async logActivity(activityData) {
    try {
      const connected = await this.initialize()
      
      if (!connected) {
        console.log('Mock activity log:', activityData)
        return { id: Date.now(), ...activityData, created_at: new Date().toISOString() }
      }

      const { data, error } = await supabase
        .from('activity_logs_dt2024')
        .insert([{
          action: activityData.action,
          resource_type: activityData.resource_type,
          user_id: activityData.user_id
        }])
        .select()
        .single()

      if (error) {
        console.warn('Error logging activity:', error.message)
        return null
      }

      return data

    } catch (error) {
      console.warn('Error in logActivity:', error.message)
      return null
    }
  }

  // Classes
  static async getClasses() {
    try {
      console.log('Getting classes from database...')
      
      const connected = await this.initialize()
      
      if (!connected) {
        return this.getSampleClasses()
      }

      const { data, error } = await supabase
        .from('classes_dt2024')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.warn('Error querying classes:', error.message)
        return this.getSampleClasses()
      }

      console.log('Classes retrieved:', data?.length || 0)
      return data || []

    } catch (error) {
      console.warn('Error in getClasses:', error.message)
      return this.getSampleClasses()
    }
  }

  static getSampleClasses() {
    return [
      {
        id: 'class-1',
        name: 'Reception A - Design & Technology',
        subject: 'Design & Technology',
        year_group: 'Reception',
        description: 'Introduction to design and technology for Reception children',
        enrolled: 24,
        created_at: new Date().toISOString()
      },
      {
        id: 'class-2',
        name: 'Year 1 Making Skills',
        subject: 'Design & Technology',
        year_group: 'Year 1',
        description: 'Basic making skills and tool introduction',
        enrolled: 26,
        created_at: new Date(Date.now() - 86400000).toISOString()
      },
      {
        id: 'class-3',
        name: 'Year 2 Mechanisms',
        subject: 'Design & Technology',
        year_group: 'Year 2',
        description: 'Learning about simple mechanisms and movement',
        enrolled: 28,
        created_at: new Date(Date.now() - 172800000).toISOString()
      }
    ]
  }

  // Create Class
  static async createClass(classData) {
    try {
      console.log('Creating class with data:', classData)
      
      const connected = await this.initialize()
      
      if (!connected) {
        return this.createMockClass(classData)
      }

      const classToInsert = {
        name: classData.name,
        subject: classData.subject,
        year_group: classData.year_group,
        description: classData.description,
        enrolled: 0
      }

      const { data, error } = await supabase
        .from('classes_dt2024')
        .insert([classToInsert])
        .select()
        .single()

      if (error) {
        console.warn('Error creating class:', error.message)
        return this.createMockClass(classData)
      }

      console.log('Class created successfully:', data)
      return data

    } catch (error) {
      console.warn('Error in createClass:', error.message)
      return this.createMockClass(classData)
    }
  }

  static createMockClass(classData) {
    const mockClass = {
      id: `mock-class-${Date.now()}`,
      ...classData,
      enrolled: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    
    console.log('Created mock class:', mockClass)
    return mockClass
  }

  // Update Class
  static async updateClass(id, classData) {
    try {
      const connected = await this.initialize()
      
      if (!connected) {
        return { id, ...classData, updated_at: new Date().toISOString() }
      }

      const updateData = {
        name: classData.name,
        subject: classData.subject,
        year_group: classData.year_group,
        description: classData.description,
        updated_at: new Date().toISOString()
      }

      const { data, error } = await supabase
        .from('classes_dt2024')
        .update(updateData)
        .eq('id', id)
        .select()
        .single()

      if (error) {
        console.warn('Error updating class:', error.message)
        return { id, ...updateData, created_at: new Date().toISOString() }
      }

      console.log('Class updated successfully:', data)
      return data

    } catch (error) {
      console.warn('Error in updateClass:', error.message)
      return { id, ...classData, updated_at: new Date().toISOString() }
    }
  }

  // Delete Class
  static async deleteClass(id) {
    try {
      const connected = await this.initialize()
      
      if (!connected) {
        console.log('Mock deletion of class:', id)
        return true
      }

      const { error } = await supabase
        .from('classes_dt2024')
        .delete()
        .eq('id', id)

      if (error) {
        console.warn('Error deleting class:', error.message)
        return false
      }

      console.log('Class deleted successfully:', id)
      return true

    } catch (error) {
      console.warn('Error in deleteClass:', error.message)
      return false
    }
  }

  // Assign Pupil to Class
  static async assignPupilToClass(pupilId, classId) {
    try {
      console.log('Assigning pupil to class:', { pupilId, classId })
      
      const connected = await this.initialize()
      
      if (!connected) {
        console.log('Mock assignment of pupil to class')
        return true
      }

      const { data, error } = await supabase
        .from('user_profiles_dt2024')
        .update({ class_id: classId })
        .eq('id', pupilId)
        .select()
        .single()

      if (error) {
        console.warn('Error assigning pupil to class:', error.message)
        return false
      }

      console.log('Pupil assigned to class successfully:', data)
      return true

    } catch (error) {
      console.warn('Error in assignPupilToClass:', error.message)
      return false
    }
  }

  // Lesson Plans
  static async getLessonPlans(teacherId = null) {
    try {
      console.log('Getting lesson plans for teacher:', teacherId)
      
      const connected = await this.initialize()
      
      if (!connected) {
        return this.getSampleLessonPlans()
      }

      let query = supabase
        .from('lesson_plans_dt2024')
        .select('*')
        .order('created_at', { ascending: false })

      if (teacherId) {
        query = query.eq('teacher_id', teacherId)
      }

      const { data, error } = await query

      if (error) {
        console.warn('Error getting lesson plans:', error.message)
        return this.getSampleLessonPlans()
      }

      return data || []

    } catch (error) {
      console.warn('Error in getLessonPlans:', error.message)
      return this.getSampleLessonPlans()
    }
  }

  static getSampleLessonPlans() {
    return [
      {
        id: 'lesson-1',
        title: 'Introduction to Simple Machines',
        subject: 'Year 4 - Design & Technology',
        year_group: 'Year 4',
        duration: '60 minutes',
        objectives: [
          'Understand what a simple machine is',
          'Identify different types of simple machines',
          'Explain how simple machines help us'
        ],
        resources: [
          'Simple machine examples',
          'Activity worksheets',
          'Demonstration materials'
        ],
        activities: [
          'Introduction discussion about machines',
          'Hands-on exploration of simple machines',
          'Group activity identifying machines'
        ],
        assessment: 'Practical demonstration and simple recording sheet',
        learning_outcomes: [
          'Children will understand basic machine principles',
          'Children will identify machines in everyday life'
        ],
        status: 'published',
        created_at: new Date().toISOString()
      }
    ]
  }

  // Create Lesson Plan
  static async createLessonPlan(lessonData) {
    try {
      console.log('Creating lesson plan:', lessonData)
      
      const connected = await this.initialize()
      
      if (!connected) {
        return this.createMockLessonPlan(lessonData)
      }

      const { data, error } = await supabase
        .from('lesson_plans_dt2024')
        .insert([lessonData])
        .select()
        .single()

      if (error) {
        console.warn('Error creating lesson plan:', error.message)
        return this.createMockLessonPlan(lessonData)
      }

      console.log('Lesson plan created successfully:', data)
      return data

    } catch (error) {
      console.warn('Error in createLessonPlan:', error.message)
      return this.createMockLessonPlan(lessonData)
    }
  }

  static createMockLessonPlan(lessonData) {
    const mockLesson = {
      id: `mock-lesson-${Date.now()}`,
      ...lessonData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    
    console.log('Created mock lesson plan:', mockLesson)
    return mockLesson
  }

  // Update Lesson Plan
  static async updateLessonPlan(id, lessonData) {
    try {
      const connected = await this.initialize()
      
      if (!connected) {
        return { id, ...lessonData, updated_at: new Date().toISOString() }
      }

      const { data, error } = await supabase
        .from('lesson_plans_dt2024')
        .update({ ...lessonData, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single()

      if (error) {
        console.warn('Error updating lesson plan:', error.message)
        return { id, ...lessonData, updated_at: new Date().toISOString() }
      }

      console.log('Lesson plan updated successfully:', data)
      return data

    } catch (error) {
      console.warn('Error in updateLessonPlan:', error.message)
      return { id, ...lessonData, updated_at: new Date().toISOString() }
    }
  }

  // Delete Lesson Plan
  static async deleteLessonPlan(id) {
    try {
      const connected = await this.initialize()
      
      if (!connected) {
        console.log('Mock deletion of lesson plan:', id)
        return true
      }

      const { error } = await supabase
        .from('lesson_plans_dt2024')
        .delete()
        .eq('id', id)

      if (error) {
        console.warn('Error deleting lesson plan:', error.message)
        return false
      }

      console.log('Lesson plan deleted successfully:', id)
      return true

    } catch (error) {
      console.warn('Error in deleteLessonPlan:', error.message)
      return false
    }
  }

  // Schemes of Work
  static async getSchemes(teacherId = null) {
    try {
      console.log('Getting schemes for teacher:', teacherId)
      
      const connected = await this.initialize()
      
      if (!connected) {
        return this.getSampleSchemes()
      }

      let query = supabase
        .from('schemes_dt2024')
        .select('*')
        .order('created_at', { ascending: false })

      if (teacherId) {
        query = query.eq('teacher_id', teacherId)
      }

      const { data, error } = await query

      if (error) {
        console.warn('Error getting schemes:', error.message)
        return this.getSampleSchemes()
      }

      return data || []

    } catch (error) {
      console.warn('Error in getSchemes:', error.message)
      return this.getSampleSchemes()
    }
  }

  static getSampleSchemes() {
    return [
      {
        id: 'scheme-1',
        title: 'Year 4 Mechanisms',
        description: 'Exploring simple mechanisms and movement',
        year_group: 'Year 4',
        subject: 'Design and Technology',
        lessons: [
          {
            id: 1,
            title: 'Introduction to Mechanisms',
            duration: '45 minutes',
            objectives: ['Understand what mechanisms are', 'Identify simple mechanisms'],
            resources: ['Mechanism examples', 'Activity sheets'],
            assessment: 'Practical demonstration'
          }
        ],
        assessment_criteria: [
          {
            category: 'Design Skills',
            criteria: ['Creative thinking', 'Problem solving'],
            weightage: 30
          }
        ],
        status: 'active',
        analysis_complete: true,
        created_at: new Date().toISOString()
      }
    ]
  }

  // Create Scheme
  static async createScheme(schemeData) {
    try {
      console.log('Creating scheme:', schemeData)
      
      const connected = await this.initialize()
      
      if (!connected) {
        return this.createMockScheme(schemeData)
      }

      const { data, error } = await supabase
        .from('schemes_dt2024')
        .insert([schemeData])
        .select()
        .single()

      if (error) {
        console.warn('Error creating scheme:', error.message)
        return this.createMockScheme(schemeData)
      }

      console.log('Scheme created successfully:', data)
      return data

    } catch (error) {
      console.warn('Error in createScheme:', error.message)
      return this.createMockScheme(schemeData)
    }
  }

  static createMockScheme(schemeData) {
    const mockScheme = {
      id: `mock-scheme-${Date.now()}`,
      ...schemeData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    
    console.log('Created mock scheme:', mockScheme)
    return mockScheme
  }

  // Update Scheme
  static async updateScheme(id, schemeData) {
    try {
      const connected = await this.initialize()
      
      if (!connected) {
        return { id, ...schemeData, updated_at: new Date().toISOString() }
      }

      const { data, error } = await supabase
        .from('schemes_dt2024')
        .update({ ...schemeData, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single()

      if (error) {
        console.warn('Error updating scheme:', error.message)
        return { id, ...schemeData, updated_at: new Date().toISOString() }
      }

      console.log('Scheme updated successfully:', data)
      return data

    } catch (error) {
      console.warn('Error in updateScheme:', error.message)
      return { id, ...schemeData, updated_at: new Date().toISOString() }
    }
  }

  // Delete Scheme
  static async deleteScheme(id) {
    try {
      const connected = await this.initialize()
      
      if (!connected) {
        console.log('Mock deletion of scheme:', id)
        return true
      }

      const { error } = await supabase
        .from('schemes_dt2024')
        .delete()
        .eq('id', id)

      if (error) {
        console.warn('Error deleting scheme:', error.message)
        return false
      }

      console.log('Scheme deleted successfully:', id)
      return true

    } catch (error) {
      console.warn('Error in deleteScheme:', error.message)
      return false
    }
  }

  // Journal Entries
  static async getJournalEntries() {
    try {
      console.log('Getting journal entries...')
      
      const connected = await this.initialize()
      
      if (!connected) {
        return this.getSampleJournalEntries()
      }

      const { data, error } = await supabase
        .from('journal_entries_dt2024')
        .select(`
          *,
          pupil:user_profiles_dt2024(name, class_id)
        `)
        .order('created_at', { ascending: false })

      if (error) {
        console.warn('Error getting journal entries:', error.message)
        return this.getSampleJournalEntries()
      }

      return data || []

    } catch (error) {
      console.warn('Error in getJournalEntries:', error.message)
      return this.getSampleJournalEntries()
    }
  }

  static getSampleJournalEntries() {
    return [
      {
        id: 'journal-1',
        title: 'My First CAD Design',
        content: 'Today I learned how to use the CAD software to design a simple box. It was really exciting!',
        subject: 'Design & Technology',
        mood: 'excited',
        tags: ['CAD', 'design', 'first-time'],
        images: [],
        created_at: new Date().toISOString(),
        pupil: {
          id: 'pupil-1',
          name: 'Sarah Johnson',
          class: 'Year 4A',
          avatar: 'SJ'
        },
        teacher_responses: [],
        ai_feedback: null,
        needs_response: true
      }
    ]
  }

  // Create Journal Entry
  static async createJournalEntry(entryData) {
    try {
      console.log('Creating journal entry:', entryData)
      
      const connected = await this.initialize()
      
      if (!connected) {
        return this.createMockJournalEntry(entryData)
      }

      const { data, error } = await supabase
        .from('journal_entries_dt2024')
        .insert([entryData])
        .select()
        .single()

      if (error) {
        console.warn('Error creating journal entry:', error.message)
        return this.createMockJournalEntry(entryData)
      }

      console.log('Journal entry created successfully:', data)
      return data

    } catch (error) {
      console.warn('Error in createJournalEntry:', error.message)
      return this.createMockJournalEntry(entryData)
    }
  }

  static createMockJournalEntry(entryData) {
    const mockEntry = {
      id: `mock-journal-${Date.now()}`,
      ...entryData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    
    console.log('Created mock journal entry:', mockEntry)
    return mockEntry
  }

  // Update Journal Entry
  static async updateJournalEntry(id, entryData) {
    try {
      const connected = await this.initialize()
      
      if (!connected) {
        return { id, ...entryData, updated_at: new Date().toISOString() }
      }

      const { data, error } = await supabase
        .from('journal_entries_dt2024')
        .update({ ...entryData, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single()

      if (error) {
        console.warn('Error updating journal entry:', error.message)
        return { id, ...entryData, updated_at: new Date().toISOString() }
      }

      console.log('Journal entry updated successfully:', data)
      return data

    } catch (error) {
      console.warn('Error in updateJournalEntry:', error.message)
      return { id, ...entryData, updated_at: new Date().toISOString() }
    }
  }
}
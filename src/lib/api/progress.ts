import { supabase } from '../supabase';
import type { TrainingEnrollment, ModuleProgress, Tables, Inserts, Updates } from '../supabase';

// Training Progress API operations
export const progressApi = {
  // Get user enrollments
  async getUserEnrollments(userId: string): Promise<TrainingEnrollment[]> {
    const { data, error } = await supabase
      .from('training_enrollments')
      .select(`
        *,
        training_courses (
          id,
          title,
          description,
          category,
          estimated_duration,
          passing_score
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching user enrollments:', error);
      return [];
    }

    return data || [];
  },

  // Get enrollment by ID
  async getEnrollmentById(id: string): Promise<TrainingEnrollment | null> {
    const { data, error } = await supabase
      .from('training_enrollments')
      .select(`
        *,
        training_courses (
          id,
          title,
          description,
          category,
          estimated_duration,
          passing_score,
          max_attempts
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching enrollment by ID:', error);
      return null;
    }

    return data;
  },

  // Create enrollment
  async createEnrollment(enrollmentData: Inserts<'training_enrollments'>): Promise<TrainingEnrollment | null> {
    const { data, error } = await supabase
      .from('training_enrollments')
      .insert(enrollmentData)
      .select()
      .single();

    if (error) {
      console.error('Error creating enrollment:', error);
      throw new Error(error.message);
    }

    return data;
  },

  // Update enrollment
  async updateEnrollment(id: string, updates: Updates<'training_enrollments'>): Promise<TrainingEnrollment | null> {
    const { data, error } = await supabase
      .from('training_enrollments')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating enrollment:', error);
      throw new Error(error.message);
    }

    return data;
  },

  // Start course
  async startCourse(userId: string, courseId: string): Promise<TrainingEnrollment | null> {
    // Check if enrollment already exists
    const { data: existingEnrollment } = await supabase
      .from('training_enrollments')
      .select('*')
      .eq('user_id', userId)
      .eq('course_id', courseId)
      .single();

    if (existingEnrollment) {
      // Update existing enrollment to started
      return this.updateEnrollment(existingEnrollment.id, {
        status: 'in_progress',
        started_at: new Date().toISOString(),
        last_accessed: new Date().toISOString()
      });
    } else {
      // Create new enrollment
      return this.createEnrollment({
        user_id: userId,
        course_id: courseId,
        status: 'in_progress',
        started_at: new Date().toISOString(),
        last_accessed: new Date().toISOString(),
        attempts: 0,
        time_spent: 0
      });
    }
  },

  // Complete course
  async completeCourse(enrollmentId: string, score?: number): Promise<boolean> {
    const { error } = await supabase
      .from('training_enrollments')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        score: score,
        updated_at: new Date().toISOString()
      })
      .eq('id', enrollmentId);

    if (error) {
      console.error('Error completing course:', error);
      return false;
    }

    return true;
  },

  // Get module progress for enrollment
  async getModuleProgress(enrollmentId: string): Promise<ModuleProgress[]> {
    const { data, error } = await supabase
      .from('module_progress')
      .select(`
        *,
        training_modules (
          id,
          title,
          description,
          content_type,
          sequence_order,
          estimated_duration
        )
      `)
      .eq('enrollment_id', enrollmentId)
      .order('training_modules(sequence_order)', { ascending: true });

    if (error) {
      console.error('Error fetching module progress:', error);
      return [];
    }

    return data || [];
  },

  // Create or update module progress
  async updateModuleProgress(
    enrollmentId: string,
    moduleId: string,
    userId: string,
    progressData: Partial<ModuleProgress>
  ): Promise<ModuleProgress | null> {
    // Check if progress record exists
    const { data: existingProgress } = await supabase
      .from('module_progress')
      .select('*')
      .eq('enrollment_id', enrollmentId)
      .eq('module_id', moduleId)
      .single();

    if (existingProgress) {
      // Update existing progress
      const { data, error } = await supabase
        .from('module_progress')
        .update({ 
          ...progressData, 
          updated_at: new Date().toISOString() 
        })
        .eq('id', existingProgress.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating module progress:', error);
        throw new Error(error.message);
      }

      return data;
    } else {
      // Create new progress record
      const { data, error } = await supabase
        .from('module_progress')
        .insert({
          enrollment_id: enrollmentId,
          module_id: moduleId,
          user_id: userId,
          status: 'not_started',
          progress_percentage: 0,
          time_spent: 0,
          attempts: 0,
          ...progressData
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating module progress:', error);
        throw new Error(error.message);
      }

      return data;
    }
  },

  // Complete module
  async completeModule(
    enrollmentId: string,
    moduleId: string,
    userId: string,
    score?: number
  ): Promise<boolean> {
    try {
      await this.updateModuleProgress(enrollmentId, moduleId, userId, {
        status: 'completed',
        progress_percentage: 100,
        completed_at: new Date().toISOString(),
        score: score
      });
      return true;
    } catch (error) {
      console.error('Error completing module:', error);
      return false;
    }
  },

  // Get user's completed courses
  async getCompletedCourses(userId: string): Promise<TrainingEnrollment[]> {
    const { data, error } = await supabase
      .from('training_enrollments')
      .select(`
        *,
        training_courses (
          id,
          title,
          category,
          estimated_duration
        )
      `)
      .eq('user_id', userId)
      .eq('status', 'completed')
      .order('completed_at', { ascending: false });

    if (error) {
      console.error('Error fetching completed courses:', error);
      return [];
    }

    return data || [];
  },

  // Get user's in-progress courses
  async getInProgressCourses(userId: string): Promise<TrainingEnrollment[]> {
    const { data, error } = await supabase
      .from('training_enrollments')
      .select(`
        *,
        training_courses (
          id,
          title,
          category,
          estimated_duration
        )
      `)
      .eq('user_id', userId)
      .eq('status', 'in_progress')
      .order('last_accessed', { ascending: false });

    if (error) {
      console.error('Error fetching in-progress courses:', error);
      return [];
    }

    return data || [];
  },

  // Update last accessed time
  async updateLastAccessed(enrollmentId: string): Promise<boolean> {
    const { error } = await supabase
      .from('training_enrollments')
      .update({ 
        last_accessed: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', enrollmentId);

    if (error) {
      console.error('Error updating last accessed:', error);
      return false;
    }

    return true;
  },

  // Add time spent to enrollment
  async addTimeSpent(enrollmentId: string, minutes: number): Promise<boolean> {
    const { error } = await supabase.rpc('add_time_spent', {
      enrollment_id: enrollmentId,
      additional_minutes: minutes
    });

    if (error) {
      console.error('Error adding time spent:', error);
      return false;
    }

    return true;
  }
};

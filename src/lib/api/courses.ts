import { supabase } from '../supabase';
import type { TrainingCourse, TrainingModule, Tables, Inserts, Updates } from '../supabase';

// Training Courses API operations
export const coursesApi = {
  // Get all active courses
  async getAll(): Promise<TrainingCourse[]> {
    const { data, error } = await supabase
      .from('training_courses')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching courses:', error);
      return [];
    }

    return data || [];
  },

  // Get course by ID
  async getById(id: string): Promise<TrainingCourse | null> {
    const { data, error } = await supabase
      .from('training_courses')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching course by ID:', error);
      return null;
    }

    return data;
  },

  // Get courses by category
  async getByCategory(category: string): Promise<TrainingCourse[]> {
    const { data, error } = await supabase
      .from('training_courses')
      .select('*')
      .eq('category', category)
      .eq('is_active', true)
      .order('title', { ascending: true });

    if (error) {
      console.error('Error fetching courses by category:', error);
      return [];
    }

    return data || [];
  },

  // Get mandatory courses
  async getMandatory(): Promise<TrainingCourse[]> {
    const { data, error } = await supabase
      .from('training_courses')
      .select('*')
      .eq('is_mandatory', true)
      .eq('is_active', true)
      .order('title', { ascending: true });

    if (error) {
      console.error('Error fetching mandatory courses:', error);
      return [];
    }

    return data || [];
  },

  // Create new course
  async create(courseData: Inserts<'training_courses'>): Promise<TrainingCourse | null> {
    const { data, error } = await supabase
      .from('training_courses')
      .insert(courseData)
      .select()
      .single();

    if (error) {
      console.error('Error creating course:', error);
      throw new Error(error.message);
    }

    return data;
  },

  // Update course
  async update(id: string, updates: Updates<'training_courses'>): Promise<TrainingCourse | null> {
    const { data, error } = await supabase
      .from('training_courses')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating course:', error);
      throw new Error(error.message);
    }

    return data;
  },

  // Deactivate course
  async deactivate(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('training_courses')
      .update({ 
        is_active: false, 
        updated_at: new Date().toISOString() 
      })
      .eq('id', id);

    if (error) {
      console.error('Error deactivating course:', error);
      return false;
    }

    return true;
  },

  // Get course modules
  async getModules(courseId: string): Promise<TrainingModule[]> {
    const { data, error } = await supabase
      .from('training_modules')
      .select('*')
      .eq('course_id', courseId)
      .eq('is_active', true)
      .order('sequence_order', { ascending: true });

    if (error) {
      console.error('Error fetching course modules:', error);
      return [];
    }

    return data || [];
  },

  // Create course module
  async createModule(moduleData: Inserts<'training_modules'>): Promise<TrainingModule | null> {
    const { data, error } = await supabase
      .from('training_modules')
      .insert(moduleData)
      .select()
      .single();

    if (error) {
      console.error('Error creating module:', error);
      throw new Error(error.message);
    }

    return data;
  },

  // Update course module
  async updateModule(id: string, updates: Updates<'training_modules'>): Promise<TrainingModule | null> {
    const { data, error } = await supabase
      .from('training_modules')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating module:', error);
      throw new Error(error.message);
    }

    return data;
  },

  // Delete course module
  async deleteModule(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('training_modules')
      .update({ 
        is_active: false, 
        updated_at: new Date().toISOString() 
      })
      .eq('id', id);

    if (error) {
      console.error('Error deleting module:', error);
      return false;
    }

    return true;
  },

  // Get course statistics
  async getStatistics(courseId: string): Promise<{
    totalEnrollments: number;
    completedEnrollments: number;
    averageScore: number;
    completionRate: number;
  }> {
    const { data: enrollments, error } = await supabase
      .from('training_enrollments')
      .select('status, score')
      .eq('course_id', courseId);

    if (error) {
      console.error('Error fetching course statistics:', error);
      return {
        totalEnrollments: 0,
        completedEnrollments: 0,
        averageScore: 0,
        completionRate: 0
      };
    }

    const totalEnrollments = enrollments?.length || 0;
    const completedEnrollments = enrollments?.filter(e => e.status === 'completed').length || 0;
    const scores = enrollments?.filter(e => e.score !== null).map(e => e.score) || [];
    const averageScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
    const completionRate = totalEnrollments > 0 ? (completedEnrollments / totalEnrollments) * 100 : 0;

    return {
      totalEnrollments,
      completedEnrollments,
      averageScore: Math.round(averageScore),
      completionRate: Math.round(completionRate)
    };
  },

  // Search courses
  async search(query: string): Promise<TrainingCourse[]> {
    const { data, error } = await supabase
      .from('training_courses')
      .select('*')
      .or(`title.ilike.%${query}%,description.ilike.%${query}%,category.ilike.%${query}%`)
      .eq('is_active', true)
      .order('title', { ascending: true });

    if (error) {
      console.error('Error searching courses:', error);
      return [];
    }

    return data || [];
  }
};

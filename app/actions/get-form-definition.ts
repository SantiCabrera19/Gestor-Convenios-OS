'use server';

import { createClient } from '@/utils/supabase/server';
import { FormDefinition } from '@/lib/types/dynamic-form';

export async function getFormDefinition(convenioTypeId: number): Promise<FormDefinition | null> {
  const supabase = await createClient();

  try {
    const { data, error } = await supabase
      .from('form_definitions')
      .select('*')
      .eq('convenio_type_id', convenioTypeId)
      .eq('active', true)
      .order('version', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      console.error('Error fetching form definition:', error);
      return null;
    }

    return data as FormDefinition;
  } catch (error) {
    console.error('Unexpected error fetching form definition:', error);
    return null;
  }
}

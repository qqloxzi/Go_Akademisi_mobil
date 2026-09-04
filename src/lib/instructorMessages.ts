import { supabase } from './supabase';

export async function sendInstructorMessage(params: {
  senderId: string | null;
  name: string;
  email: string;
  phone?: string;
  instructorId: string;
  instructorName: string;
  body: string;
}) {
  return supabase.from('instructor_messages').insert({
    sender_id: params.senderId,
    sender_name: params.name.trim(),
    sender_email: params.email.trim(),
    sender_phone: params.phone?.trim() || null,
    instructor_id: params.instructorId,
    instructor_name: params.instructorName,
    body: params.body.trim(),
  });
}

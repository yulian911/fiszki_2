'use client';

import { notFound } from 'next/navigation';
import { SessionPage } from '@/features/sessions/components';
import { validate as uuidValidate } from 'uuid';

interface SessionPageProps {
  params: {
    sessionId: string;
  };
}

export default function SessionRoute({ params }: SessionPageProps) {
  const { sessionId } = params;

  // Validate that sessionId is a valid UUID
  if (!uuidValidate(sessionId)) {
    return notFound();
  }

  return <SessionPage />;
} 
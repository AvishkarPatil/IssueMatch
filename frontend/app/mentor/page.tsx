import React, { Suspense } from 'react';
import { MentorConnectForm } from '@/components/MentorContactForm';

export default function MentorPage() {
  return (
    <Suspense fallback={<div className="text-white text-center mt-10">Loading mentor form...</div>}>
      <MentorConnectForm />
    </Suspense>
  );
}

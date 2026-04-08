'use client';

import { SharedActivityManager } from '@/src/components/activities/SharedActivityManager';

export default function ActivitiesControlPage() {
    return <SharedActivityManager isSuperAdmin={true} />;
}

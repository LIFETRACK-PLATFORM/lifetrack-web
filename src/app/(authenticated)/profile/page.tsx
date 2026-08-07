"use client";

import { Suspense } from "react";
import { ProfileView } from "@/modules/profile/ui/views/ProfileView";

export default function ProfilePage() {
  return (
    <Suspense fallback={null}>
      <ProfileView />
    </Suspense>
  );
}

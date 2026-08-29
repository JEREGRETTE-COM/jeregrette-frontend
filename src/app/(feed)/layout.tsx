import { AppHeader } from "@/components/feed/app-header";
import { PublishFab } from "@/components/feed/publish-fab";

export default function FeedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-surface font-poppins flex min-h-full flex-1 flex-col">
      <AppHeader />
      {children}
      <PublishFab />
    </div>
  );
}

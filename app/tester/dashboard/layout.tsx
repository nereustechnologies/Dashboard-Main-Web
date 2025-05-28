
import { TestStepProvider } from "@/components/test-step-context"

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <TestStepProvider>
      {children}
    </TestStepProvider>
  )
}
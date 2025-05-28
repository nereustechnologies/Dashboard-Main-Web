import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import LoginForm from "@/components/login-form"
import Image from "next/image"

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-black p-4">
      <Card className="w-full max-w-md border-[#00D4EF]/20 bg-black">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-2">
            <Image src="/logo.svg" alt="Nereus Technologies Logo" width={80} height={90} />
          </div>
          <CardTitle className="text-3xl font-bold text-[#00D4EF]">Nereus Technologies</CardTitle>
          <p className="text-gray-400 mt-2">From Data to Dominance - Lead with Nereus</p>
        </CardHeader>
        <CardContent>
          <LoginForm />
        </CardContent>
      </Card>
    </div>
  )
}


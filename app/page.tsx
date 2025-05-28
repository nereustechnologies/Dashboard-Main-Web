import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-black">
      <div className="w-full max-w-md space-y-8 text-center">
        <div className="flex flex-col items-center">
          <Image src="/logo.svg" alt="Nereus Technologies Logo" width={120} height={130} className="mb-4" />
          <h1 className="text-4xl font-bold italic text-[#00D4EF]">NEREUS</h1>
          <p className="text-xl font-semibold text-white mb-2">TECHNOLOGIES</p>
          <div className="h-1 w-40 bg-gradient-to-r from-transparent via-[#00D4EF] to-transparent my-4"></div>
          <p className="text-gray-400 mt-2">From Data to Dominance - Lead with Nereus</p>
          <p className="text-gray-400">Advanced fitness tracking with IMU sensors</p>
        </div>
        <div className="flex flex-col space-y-4 pt-6">
          <Link href="/login" className="w-full">
            <Button className="w-full bg-[#00D4EF] hover:bg-[#00D4EF]/80 text-black">Login</Button>
          </Link>
        </div>
      </div>
    </main>
  )
}


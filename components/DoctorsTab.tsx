import { TabsContent } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Eye, Plus } from "lucide-react"
import Link from "next/link"

// Props: You must pass `doctors` as an array of users with role "doctor"
export function DoctorsTab({ doctors }: { doctors: { id: string, name: string, email: string }[] }) {
  return (
    <TabsContent value="Doctors" className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-lg font-semibold">Doctors</p>
        <Link href="/register">
          <Button variant="default" className="flex gap-2 items-center">
            <Plus size={16} /> Add Doctor
          </Button>
        </Link>
      </div>

      {doctors.length === 0 ? (
        <p className="text-sm text-gray-500">No doctors found.</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {doctors.map((doctor) => (
            <div key={doctor.id} className="border p-4 rounded-xl shadow-sm flex items-center justify-between">
              <div>
                <p className="font-semibold">{doctor.name}</p>
                <p className="text-sm text-muted-foreground">{doctor.email}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </TabsContent>
  )
}

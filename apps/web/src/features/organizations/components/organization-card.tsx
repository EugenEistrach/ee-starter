import { Avatar, AvatarFallback, AvatarImage } from '@workspace/ui/components/avatar'

interface OrganizationCardProps {
  name: string
  logo: string | null
  isActive?: boolean
}

export function OrganizationCard({ name, logo, isActive }: OrganizationCardProps) {
  return (
    <div className="flex items-center gap-2 px-1 py-1.5">
      <Avatar className="h-8 w-8 rounded-lg">
        {logo && <AvatarImage src={logo} alt={name} />}
        <AvatarFallback className="rounded-lg">
          {name.slice(0, 2).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <div className="grid flex-1 text-left text-sm leading-tight">
        <span className={`truncate ${isActive ? 'font-semibold' : 'font-normal'}`}>
          {name}
        </span>
      </div>
    </div>
  )
}

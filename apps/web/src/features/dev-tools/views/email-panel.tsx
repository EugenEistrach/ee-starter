import { api } from '@workspace/backend/convex/_generated/api'
import { ScrollArea } from '@workspace/ui/components/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@workspace/ui/components/tabs'
import { useQuery } from 'convex/react'
import { useState } from 'react'

export function EmailPanel() {
  const emails = useQuery(api.emails.getRecentEmails, { limit: 50 })
  const [selectedEmailId, setSelectedEmailId] = useState<string | null>(null)

  if (!emails) {
    return (
      <div className="flex h-full items-center justify-center bg-[#191c24] p-4">
        <div className="text-sm text-[#98a2b3]">Loading emails...</div>
      </div>
    )
  }

  if (emails.length === 0) {
    return (
      <div className="flex h-full items-center justify-center bg-[#191c24] p-4">
        <div className="text-center">
          <div className="text-sm text-[#98a2b3]">No emails sent yet</div>
          <div className="mt-1 text-xs text-[#98a2b3]/60">Sign up a user to see emails here</div>
        </div>
      </div>
    )
  }

  const selectedEmail = selectedEmailId
    ? emails.find(e => e._id === selectedEmailId)
    : emails[0]

  return (
    <div className="flex h-full bg-[#191c24]">
      {/* Email List Sidebar */}
      <div className="w-80 border-r border-[#1d2939] flex flex-col">
        <div className="border-b border-[#1d2939] px-4 py-3">
          <h2 className="text-sm font-semibold text-[#f2f4f7]">
            Emails
            {' '}
            <span className="text-[#98a2b3]">
              (
              {emails.length}
              )
            </span>
          </h2>
        </div>
        <ScrollArea className="flex-1">
          <div>
            {emails.map(email => (
              <EmailListItem
                key={email._id}
                email={email}
                isSelected={email._id === selectedEmail?._id}
                onClick={() => setSelectedEmailId(email._id)}
              />
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Email Preview */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {selectedEmail && <EmailPreview email={selectedEmail} />}
      </div>
    </div>
  )
}

function EmailListItem({
  email,
  isSelected,
  onClick,
}: {
  email: any
  isSelected: boolean
  onClick: () => void
}) {
  const sentDate = email.sentAt ? new Date(email.sentAt) : new Date(email._creationTime)
  const statusIcon = email.status === 'sent' ? '✓' : '✗'
  const statusColor = email.status === 'sent' ? 'text-[#12B76A]' : 'text-[#ef4444]'

  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        w-full text-left p-3 border-b border-[#1d2939] transition-colors
        ${isSelected ? 'bg-[#0b0d10]' : 'hover:bg-[#0b0d10]/50'}
      `}
    >
      <div className="flex items-start justify-between gap-2 mb-1">
        <div className="flex items-center gap-2 min-w-0">
          <span className={`text-xs font-medium ${statusColor}`}>{statusIcon}</span>
          <span className="text-xs text-[#98a2b3] truncate">{email.templateType}</span>
        </div>
        <span className="text-xs text-[#98a2b3] shrink-0">
          {sentDate.toLocaleTimeString()}
        </span>
      </div>
      <div className="text-sm font-medium text-[#f2f4f7] truncate mb-1">
        {email.subject}
      </div>
      <div className="text-xs text-[#98a2b3] truncate">
        To:
        {' '}
        {email.to}
      </div>
      {email.error && (
        <div className="mt-2 text-xs text-[#ef4444] truncate">
          Error:
          {' '}
          {email.error}
        </div>
      )}
    </button>
  )
}

function EmailPreview({ email }: { email: any }) {
  const sentDate = email.sentAt ? new Date(email.sentAt) : new Date(email._creationTime)
  const statusColor = email.status === 'sent' ? 'text-[#12B76A]' : 'text-[#ef4444]'
  const providerBadge
    = email.provider === 'local'
      ? (
          <span className="rounded bg-[#2E90FA]/10 px-2 py-0.5 text-xs text-[#2E90FA]">Local</span>
        )
      : (
          <span className="rounded bg-[#12B76A]/10 px-2 py-0.5 text-xs text-[#12B76A]">Resend</span>
        )

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b border-[#1d2939] p-4">
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-lg font-semibold text-[#f2f4f7]">{email.subject}</h3>
          <div className="flex items-center gap-2">
            <span className={`text-sm font-medium ${statusColor}`}>
              {email.status === 'sent' ? '✓' : '✗'}
              {' '}
              {email.status.toUpperCase()}
            </span>
            {providerBadge}
          </div>
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-[#98a2b3] w-16">To:</span>
            <span className="text-[#f2f4f7]">{email.to}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[#98a2b3] w-16">Template:</span>
            <span className="text-[#f2f4f7]">{email.templateType}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[#98a2b3] w-16">Sent:</span>
            <span className="text-[#f2f4f7]">{sentDate.toLocaleString()}</span>
          </div>
          {email.metadata?.triggeredBy && (
            <div className="flex items-center gap-2">
              <span className="text-[#98a2b3] w-16">Trigger:</span>
              <span className="text-[#f2f4f7]">{email.metadata.triggeredBy}</span>
            </div>
          )}
        </div>

        {email.error && (
          <div className="mt-3 rounded bg-[#ef4444]/10 border border-[#ef4444]/20 p-3">
            <div className="text-sm font-medium text-[#ef4444] mb-1">Error</div>
            <div className="text-xs text-[#ef4444]">{email.error}</div>
          </div>
        )}
      </div>

      {/* Content Tabs */}
      <div className="flex-1 overflow-hidden">
        <Tabs defaultValue="html" className="h-full flex flex-col">
          <div className="border-b border-[#1d2939] px-4">
            <TabsList className="bg-transparent border-0 h-auto p-0">
              <TabsTrigger
                value="html"
                className="data-[state=active]:bg-transparent data-[state=active]:text-[#f2f4f7] data-[state=active]:border-b-2 data-[state=active]:border-[#2E90FA] text-[#98a2b3] rounded-none px-4 py-2"
              >
                HTML Preview
              </TabsTrigger>
              <TabsTrigger
                value="text"
                className="data-[state=active]:bg-transparent data-[state=active]:text-[#f2f4f7] data-[state=active]:border-b-2 data-[state=active]:border-[#2E90FA] text-[#98a2b3] rounded-none px-4 py-2"
              >
                Plain Text
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="html" className="flex-1 m-0 overflow-hidden">
            <ScrollArea className="h-full">
              <div className="p-4">
                <iframe
                  srcDoc={email.html}
                  title="Email preview"
                  className="w-full h-[600px] rounded border border-[#1d2939] bg-white"
                  sandbox="allow-same-origin"
                />
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="text" className="flex-1 m-0 overflow-hidden">
            <ScrollArea className="h-full">
              <pre className="p-4 text-xs text-[#f2f4f7] font-mono whitespace-pre-wrap">
                {email.text}
              </pre>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

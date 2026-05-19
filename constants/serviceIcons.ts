const favicon = (domain: string) =>
  `https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=http://${domain}&size=256`

const SERVICE_ICON_MAP: Record<string, string> = {
  // Streaming
  netflix: favicon('netflix.com'),
  spotify: favicon('spotify.com'),
  youtube: favicon('youtube.com'),
  'apple tv': favicon('tv.apple.com'),
  'disney': favicon('disneyplus.com'),
  'hbo': favicon('max.com'),
  'hulu': favicon('hulu.com'),
  'tidal': favicon('tidal.com'),
  'deezer': favicon('deezer.com'),
  'twitch': favicon('twitch.tv'),

  // Design
  adobe: favicon('adobe.com'),
  canva: favicon('canva.com'),
  figma: favicon('figma.com'),
  sketch: favicon('sketch.com'),
  framer: favicon('framer.com'),
  'affinity': favicon('affinity.serif.com'),

  // Dev tools
  github: favicon('github.com'),
  gitlab: favicon('gitlab.com'),
  linear: favicon('linear.app'),
  vercel: favicon('vercel.com'),
  heroku: favicon('heroku.com'),
  'jetbrains': favicon('jetbrains.com'),
  'tower': favicon('git-tower.com'),
  'bitbucket': favicon('bitbucket.org'),
  'jira': favicon('atlassian.com'),
  'sentry': favicon('sentry.io'),

  // AI
  claude: favicon('anthropic.com'),
  anthropic: favicon('anthropic.com'),
  openai: favicon('openai.com'),
  chatgpt: favicon('openai.com'),
  midjourney: favicon('midjourney.com'),
  cursor: favicon('cursor.com'),
  copilot: favicon('github.com'),

  // Productivity
  notion: favicon('notion.so'),
  evernote: favicon('evernote.com'),
  obsidian: favicon('obsidian.md'),
  'monday': favicon('monday.com'),
  todoist: favicon('todoist.com'),
  'bear': favicon('bear.app'),
  '1password': favicon('1password.com'),
  'bitwarden': favicon('bitwarden.com'),

  // Cloud & storage
  dropbox: favicon('dropbox.com'),
  icloud: favicon('icloud.com'),
  gdrive: favicon('drive.google.com'),
  'google one': favicon('one.google.com'),

  // Communication
  slack: favicon('slack.com'),
  discord: favicon('discord.com'),
  zoom: favicon('zoom.us'),
  teams: favicon('microsoft.com'),
  loom: favicon('loom.com'),

  // Business / SaaS
  'google workspace': favicon('workspace.google.com'),
  'microsoft 365': favicon('microsoft.com'),
  'office': favicon('microsoft.com'),
  shopify: favicon('shopify.com'),
  hubspot: favicon('hubspot.com'),
  mailchimp: favicon('mailchimp.com'),
  airtable: favicon('airtable.com'),
  zapier: favicon('zapier.com'),
}

export function getServiceIconUrl(name: string): string | undefined {
  const lower = name.toLowerCase().trim()
  for (const [keyword, url] of Object.entries(SERVICE_ICON_MAP)) {
    if (lower.includes(keyword)) return url
  }
  return undefined
}

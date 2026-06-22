import { useEffect } from 'react'

export function usePageMeta(title: string, description: string) {
  useEffect(() => {
    const prevTitle = document.title
    document.title = title

    let meta = document.querySelector('meta[name="description"]') as HTMLMetaElement | null
    const prevDescription = meta?.content ?? ''
    if (!meta) {
      meta = document.createElement('meta')
      meta.name = 'description'
      document.head.appendChild(meta)
    }
    meta.content = description

    return () => {
      document.title = prevTitle
      if (meta) meta.content = prevDescription
    }
  }, [title, description])
}

const headers = {
  'User-Agent': 'TikTok 26.2.0 rv:262018 (iPhone; iOS 14.4.2; en_US) Cronet'
}

export type Video = {
  url: string
  username: string
  description: string
  duration: number
  created: number
}

export const getTiktokVideoInfo = async (url: string) => {
  const videoId = extractVideoId(url)
  const apiUrl = `https://api16-normal-c-useast1a.tiktokv.com/aweme/v1/feed/?aweme_id=${videoId}`
  const request = await fetch(apiUrl, { headers })
  const responseData = (await request.json()) as {
    aweme_list: {
      create_time: number
      author: { unique_id: string }
      desc: string
      video: {
        duration: number
        play_addr: { url_list: string[] }
      }
    }[]
  }
  const tiktok = responseData.aweme_list[0]

  const videoUrl = tiktok?.video?.play_addr?.url_list[0]
  const username = tiktok.author.unique_id
  const description = tiktok.desc
  const duration = tiktok.video.duration
  const created = tiktok.create_time

  return {
    url: videoUrl,
    description,
    username,
    duration,
    created
  } as Video
}

export function extractVideoId(url: string) {
  const regex = /\/video\/(\d+)/
  const match = url.match(regex)
  return match?.[1] || null
}

import { Client } from '../../core/client'
import {
  Content,
  ContentRelationType,
  ContentRelationGroup,
  ContentStatistics,
  ContentNews,
  ContentUserUpdate,
  ContentReviewScores,
  ContentReview
} from './base'
import { BaseClass, BaseResource } from '../base'
import { YoutubeVideo, Image } from '../misc'
import {
  ProducerMeta,
  AnimeGenreMeta,
  PersonMeta,
  CharacterMeta,
  AnimeMeta,
  MangaMeta
} from '../meta'
import { URL } from 'url'
import ParseDuration from 'parse-duration'
import { animeExplicitGenres } from '../../manager/genre'

export type AnimeType = 'TV' | 'OVA' | 'Movie' | 'Special' | 'ONA' | 'Music' | 'Unknown'
export type AnimeAirStatus = 'FinishedAiring' | 'Airing' | 'NotYetAired' | 'Unknown'
export type AnimeRating = 'None' | 'G' | 'PG' | 'PG-13+' | 'R-17+' | 'R+' | 'Rx' | 'Unknown'
export type AnimeSeason = 'Summer' | 'Winter' | 'Spring' | 'Fall' | 'Unknown'

export class AnimeAirInformation extends BaseClass {
  // eslint-disable-next-line tsdoc/syntax
  /** @hidden */
  public static parseStatus (input: any): AnimeAirStatus {
    const status = input?.toLowerCase().trim()

    switch (status) {
      case 'finished airing': return 'FinishedAiring'
      case 'currently airing': return 'Airing'
      case 'not yet aired': return 'NotYetAired'

      default: return 'Unknown'
    }
  }

  public readonly status: AnimeAirStatus
  public readonly airing: boolean
  public readonly airedFrom: Date | null
  public readonly airedTo: Date | null

  public constructor (client: Client, data: any) {
    super(client)

    this.status = AnimeAirInformation.parseStatus(data.status)
    this.airing = !!data.airing
    this.airedFrom = AnimeAirInformation.parseDate(data.aired.from, true)
    this.airedTo = AnimeAirInformation.parseDate(data.aired.to, true)
  }
}

export class Anime extends Content {
  // eslint-disable-next-line tsdoc/syntax
  /** @hidden */
  public static parseTrailer (client: Client, input: any) {
    const youtubeID = input?.youtube_id

    return youtubeID ? new YoutubeVideo(client, youtubeID) : null
  }

  // eslint-disable-next-line tsdoc/syntax
  /** @hidden */
  public static parseType (input: any): AnimeType {
    switch (input?.toLowerCase().trim()) {
      case 'tv': return 'TV'
      case 'ova': return 'OVA'
      case 'movie': return 'Movie'
      case 'special': return 'Special'
      case 'ona': return 'ONA'
      case 'music': return 'Music'

      case 'unknow':
      case 'unknown':
      case '-':
      default: return 'Unknown'
    }
  }

  // eslint-disable-next-line tsdoc/syntax
  /** @hidden */
  public static parseRating (input: any): AnimeRating {
    switch (input?.toLowerCase().trim()) {
      case 'none': return 'None'
      case 'g - all ages': return 'G'
      case 'pg - childre': return 'PG'
      case 'pg - children': return 'PG'
      case 'pg-13 - teens 13 or older': return 'PG-13+'
      case 'r - 17+ (violence & profanity)': return 'R-17+'
      case 'r+ - mild nudity': return 'R+'
      case 'rx - hentai': return 'Rx'

      default: return 'Unknown'
    }
  }

  // eslint-disable-next-line tsdoc/syntax
  /** @hidden */
  public static parseSeason (input: any): AnimeSeason | null {
    switch (input) {
      case 'summer': return 'Summer'
      case 'winter': return 'Winter'
      case 'spring': return 'Spring'
      case 'fall': return 'Fall'

      default: return 'Unknown'
    }
  }

  public readonly trailer: YoutubeVideo | null
  public readonly type: AnimeType
  public readonly source: string | null
  public readonly episodes: this['type'] extends 'TV' ? number : null
  public readonly airInfo: AnimeAirInformation
  public readonly duration: number | null
  public readonly rating: AnimeRating
  public readonly season: AnimeSeason | null
  public readonly year: number | null
  public readonly producers: Array<ProducerMeta>
  public readonly licensors: Array<ProducerMeta>
  public readonly studios: Array<ProducerMeta>
  public readonly genres: Array<AnimeGenreMeta<'Genre'>>
  public readonly explicitGenres: Array<AnimeGenreMeta<'Explicit'>>
  public readonly themes: Array<AnimeGenreMeta<'Theme'>>
  public readonly demographics: Array<AnimeGenreMeta<'Demographic'>>

  public get isExplicit (): boolean {
    return !!(
      ['Rx', 'R-17+'].includes(this.rating) ||
      this.genres.find((genre) => !!animeExplicitGenres.find((genreEntry) => genreEntry[0] === genre.id))
    )
  }

  public getCharacters () {
    return <Promise<Array<AnimeCharacterReference>>> this.client.anime.getCharacters(this.id)
  }

  public getStaff () {
    return <Promise<Array<AnimeStaffReference>>> this.client.anime.getStaff(this.id)
  }

  public getEpisodes (offset?: number, maxCount?: number) {
    return <Promise<Array<AnimePartialEpisode>>> this.client.anime.getEpisodes(this.id, offset, maxCount)
  }

  public getEpisode (episodeID: number) {
    return <Promise<AnimeEpisode>> this.client.anime.getEpisode(this.id, episodeID)
  }

  public getNews (offset?: number, maxCount?: number) {
    return <Promise<Array<AnimeNews>>> this.client.anime.getNews(this.id, offset, maxCount)
  }

  public getTopics (topic?: 'all' | 'episode' | 'other') {
    return <Promise<Array<AnimeTopic>>> this.client.anime.getTopics(this.id, topic)
  }

  public getVideos () {
    return <Promise<AnimeVideo>> this.client.anime.getVideos(this.id)
  }

  public getPictures () {
    return <Promise<Array<Image>>> this.client.anime.getPictures(this.id)
  }

  public getStatistics () {
    return <Promise<AnimeStatistics>> this.client.anime.getStatistics(this.id)
  }

  public getMoreInfo () {
    return <Promise<string | null>> this.client.anime.getMoreInfo(this.id)
  }

  public getRecommendations () {
    return <Promise<Array<AnimeRecommendation>>> this.client.anime.getRecommendations(this.id)
  }

  public getUserUpdates (offset?: number, maxCount?: number) {
    return <Promise<Array<AnimeUserUpdate>>> this.client.anime.getUserUpdates(this.id, offset, maxCount)
  }

  public getReviews (offset?: number, maxCount?: number) {
    return <Promise<Array<AnimeReview>>> this.client.anime.getReviews(this.id, offset, maxCount)
  }

  public getRelations () {
    return <Promise<Array<AnimeRelationGroup<ContentRelationType>>>> this.client.anime.getRelations(this.id)
  }

  public getThemes () {
    return <Promise<{ openings: Array<string>, endings: Array<string> }>> this.client.anime.getThemes(this.id)
  }

  public constructor (client: Client, data: any) {
    super(client, data)

    this.trailer = Anime.parseTrailer(client, data.trailer)
    this.type = Anime.parseType(data.type)
    this.source = Anime.parseString(data.source, true)
    this.episodes = <any> Anime.parseNumber(data.episodes, true)
    this.airInfo = new AnimeAirInformation(client, data)
    this.duration = Anime.parseNumber(ParseDuration(data.duration, 'millisecond'), true)
    this.rating = Anime.parseRating(data.rating)
    this.season = Anime.parseSeason(data.season)
    this.year = Anime.parseNumber(data.year, true)
    this.producers = data.producers.map((producer: any) => new ProducerMeta(this.client, producer))
    this.licensors = data.licensors.map((licensor: any) => new ProducerMeta(this.client, licensor))
    this.studios = data.studios.map((studio: any) => new ProducerMeta(this.client, studio))
    this.genres = data.genres.map((genre: any) => new AnimeGenreMeta(this.client, genre, 'Genre'))
    this.explicitGenres = data.explicit_genres.map((genre: any) => new AnimeGenreMeta(this.client, genre, 'Explicit'))
    this.demographics = data.demographics.map((genre: any) => new AnimeGenreMeta(this.client, genre, 'Demographic'))
    this.themes = data.themes.map((genre: any) => new AnimeGenreMeta(this.client, genre, 'Theme'))
  }
}

export class AnimeVoiceActorReference extends BaseClass {
  public readonly animeId: number
  public readonly language: string
  public readonly person: PersonMeta

  public getAnime () {
    return <Promise<Anime>> this.client.anime.get(this.animeId)
  }

  public constructor (client: Client, animeId: number, data: any) {
    super(client)

    this.animeId = animeId
    this.language = AnimeVoiceActorReference.parseString(data)
    this.person = new PersonMeta(client, data.person)
  }
}

export class AnimeCharacterReference extends BaseClass {
  public readonly animeId: number
  public readonly role: string
  public readonly character: CharacterMeta
  public readonly voiceActors: Array<AnimeVoiceActorReference>

  public getAnime () {
    return <Promise<Anime>> this.client.anime.get(this.animeId)
  }

  public constructor (client: Client, animeId: number, data: any) {
    super(client)

    this.animeId = animeId
    this.role = AnimeCharacterReference.parseString(data.role)
    this.character = new CharacterMeta(client, data.character)
    this.voiceActors = data.voice_actors.map((voiceActor: any) => new AnimeVoiceActorReference(this.client, this.animeId, voiceActor))
  }
}

export class AnimeStaffReference extends BaseClass {
  public readonly animeId: number
  public readonly positions: Array<string>
  public readonly person: PersonMeta

  public getAnime () {
    return <Promise<Anime>> this.client.anime.get(this.animeId)
  }

  public constructor (client: Client, animeId: number, data: any) {
    super(client)

    this.animeId = animeId
    this.positions = data.positions.map((position: any) => AnimeStaffReference.parseString(position)).filter((position: any) => !!position)
    this.person = new PersonMeta(client, data.person)
  }
}

export class AnimeEpisodeTitle extends BaseClass {
  public readonly default: string
  public readonly japanese: string | null
  public readonly romanji: string | null

  public toString () {
    return this.default
  }

  public constructor (client: Client, data: any) {
    super(client)

    this.default = AnimeEpisode.parseString(data.title)
    this.japanese = AnimeEpisode.parseString(data.japanese, true)
    this.romanji = AnimeEpisode.parseString(data.romanji, true)
  }
}

export class AnimeEpisode extends BaseClass {
  public readonly animeId: number
  public readonly episodeId: number
  public readonly URL: URL | null
  public readonly title: AnimeEpisodeTitle
  public readonly duration: number
  public readonly aired: Date | null
  public readonly filler: boolean
  public readonly recap: boolean
  public readonly synopsis: string | null

  public getAnime () {
    return <Promise<Anime>> this.client.anime.get(this.animeId)
  }

  public constructor (client: Client, animeId: number, data: any) {
    super(client)

    this.animeId = animeId
    this.episodeId = AnimeEpisode.parseNumber(data.mal_id)
    this.URL = AnimeEpisode.parseURL(data.url, true)
    this.title = new AnimeEpisodeTitle(client, data)
    this.duration = AnimeEpisode.parseNumber(data.duration)
    this.aired = data.aired ? new Date(data.aired) : null
    this.filler = !!data.filler
    this.recap = !!data.recap
    this.synopsis = AnimeEpisode.parseString(data.synopsis, true)
  }
}

export class AnimePartialEpisode extends AnimeEpisode {
  public readonly synopsis: null
  public readonly forumUrl: URL

  public getFullEpisode () {
    return <Promise<AnimeEpisode>> this.client.anime.getEpisode(this.animeId, this.episodeId)
  }

  public constructor (client: Client, animeID: number, data: any) {
    super(client, animeID, data)

    this.synopsis = null
    this.forumUrl = AnimePartialEpisode.parseURL(data.forum_url)
  }
}

export class AnimeTopic extends BaseResource {
  public readonly animeId: number
  public readonly title: string
  public readonly date: Date
  public readonly authorUsername: string
  public readonly authorURL: URL
  public readonly comments: number

  public getAnime () {
    return <Promise<Anime>> this.client.anime.get(this.id)
  }

  public constructor (client: Client, animeId: number, data: any) {
    super(client, data)

    this.animeId = animeId
    this.title = AnimeTopic.parseString(data.title)
    this.date = new Date(data.date)
    this.authorUsername = AnimeTopic.parseString(data.author_username)
    this.authorURL = AnimeTopic.parseURL(data.author_url)
    this.comments = AnimeTopic.parseNumber(data.comments)
  }
}

export class AnimePromo extends BaseClass {
  public readonly animeId: number
  public readonly title: string
  public readonly trailer: YoutubeVideo & { image: Image }

  public getAnime () {
    return <Promise<Anime>> this.client.anime.get(this.animeId)
  }

  public constructor (client: Client, animeId: number, data: any) {
    super(client)

    this.animeId = animeId
    this.title = AnimePromo.parseString(data.title)
    this.trailer = Object.assign(new YoutubeVideo(client, data.trailer.youtube_id), { image: new Image(client, data.trailer.images) })
  }
}

export class AnimeEpisodeVideo extends BaseResource {
  public readonly animeId: number
  public readonly title: string
  public readonly episode: number
  public readonly imageURL: URL

  public getAnime () {
    return <Promise<Anime>> this.client.anime.get(this.animeId)
  }

  public constructor (client: Client, animeId: number, data: any) {
    super(client, data)

    this.animeId = animeId
    this.title = AnimeEpisodeVideo.parseString(data.title)
    this.episode = typeof (data.episode) === 'string' ? Number(data.episode.toLowerCase().split('episode')[1]?.trim()) || 0 : 0
    this.imageURL = AnimeEpisodeVideo.parseURL(data.images.image_url)
  }
}

export class AnimeVideo extends BaseClass {
  public readonly animeId: number
  public readonly promos: Array<AnimePromo>
  public readonly episodes: Array<AnimeEpisodeVideo>

  public constructor (client: Client, animeId: number, data: any) {
    super(client)

    this.animeId = animeId
    this.promos = data.promo.map((promo: any) => new AnimePromo(this.client, this.animeId, promo))
    this.episodes = data.episodes.map((episodeVideo: any) => new AnimeEpisodeVideo(this.client, this.animeId, episodeVideo))
  }
}

export class AnimeStatistics extends ContentStatistics {
  public readonly animeId: number
  public readonly watching: number
  public readonly planToWatch: number

  public getAnime () {
    return <Promise<Anime>> this.client.anime.get(this.animeId)
  }

  public constructor (client: Client, animeId: number, data: any) {
    super(client, data)

    this.animeId = animeId
    this.watching = AnimeStatistics.parseNumber(data.watching)
    this.planToWatch = AnimeStatistics.parseNumber(data.plan_to_watch)
  }
}

export class AnimeRecommendation extends BaseClass {
  public readonly animeId: number
  public readonly entry: AnimeMeta
  public readonly URL: URL | null
  public readonly votes: number

  public getAnime () {
    return <Promise<Anime>> this.client.anime.get(this.animeId)
  }

  public constructor (client: Client, animeId: number, data: any) {
    super(client)

    this.animeId = animeId
    this.entry = new AnimeMeta(client, data.entry)
    this.URL = AnimeRecommendation.parseURL(data.url)
    this.votes = AnimeRecommendation.parseNumber(data.votes)
  }
}

export class AnimeNews extends ContentNews {
  public readonly animeID: number

  public getAnime () {
    return <Promise<Anime>> this.client.anime.get(this.animeID)
  }

  public constructor (client: Client, animeId: number, data: any) {
    super(client, data)

    this.animeID = animeId
  }
}

export class AnimeUserUpdate extends ContentUserUpdate {
  public readonly animeId: number
  public readonly episodesSeen: number
  public readonly episodesTotal: number

  public getAnime () {
    return <Promise<Anime>> this.client.anime.get(this.animeId)
  }

  public constructor (client: Client, animeId: number, data: any) {
    super(client, data)

    this.animeId = animeId
    this.episodesSeen = AnimeUserUpdate.parseNumber(data.episodes_seen)
    this.episodesTotal = AnimeUserUpdate.parseNumber(data.episodes_total)
  }
}

export class AnimeReviewScores extends ContentReviewScores {
  public readonly animation: number
  public readonly sound: number

  public constructor (client: Client, data: any) {
    super(client, data)

    this.animation = AnimeReviewScores.parseNumber(data.animation)
    this.sound = AnimeReviewScores.parseNumber(data.sound)
  }
}

export class AnimeReview extends ContentReview {
  public readonly animeId: number
  public readonly episodesWatched: number
  public readonly scores: AnimeReviewScores

  public getAnime () {
    return <Promise<Anime>> this.client.anime.get(this.animeId)
  }

  public constructor (client: Client, animeId: number, data: any) {
    super(client, data)

    this.animeId = animeId
    this.episodesWatched = AnimeReview.parseNumber(data.episodes_watched)
    this.scores = new AnimeReviewScores(client, data.scores)
  }
}

export class AnimeRelationGroup<T extends ContentRelationType> extends ContentRelationGroup<T> {
  public readonly animeId: number
  public readonly items: T extends 'Adaptation' ? Array<MangaMeta> : Array<AnimeMeta>

  public getAnime () {
    return <Promise<Anime>> this.client.anime.get(this.animeId)
  }

  public constructor (client: Client, animeId: number, relation: T, data: any) {
    super(client, relation, data)

    this.animeId = animeId
    this.items = data.map((item: any) => new (this.relation === 'Adaptation' ? MangaMeta : AnimeMeta)(this.client, item))
  }
}
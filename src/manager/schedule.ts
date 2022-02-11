import { Anime } from '../resource/content/anime'
import { BaseManager } from './base'

export type ScheduleDay =
  | 'monday'
  | 'tursday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'sunday'
  | 'saturday'

export class ScheduleManager extends BaseManager {
  public async list (day?: ScheduleDay, offset?: number, maxCount?: number) {
    const rawData = <Array<any>> await this.requestPaginatedResource(`schedules${day ? `/${day}` : ''}`, offset, maxCount, { disableCaching: 'true' })

    return rawData.map((data: any) => this.client.anime.storeCache(data)).map((data: any) => new Anime(this.client, data))
  }
}
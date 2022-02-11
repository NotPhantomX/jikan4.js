import { Image } from '../resource/misc'
import { Person, PersonAnimeReference, PersonVoiceActorReference, PersonMangaReference } from '../resource/person'
import { BaseManager } from '../manager/base'
import { translateObject } from '../utils'

export interface PersonSearchFilter {
  orderBy: 'mal_id' | 'name' | 'birthday' | 'favorites'
  sort: 'desc' | 'asc'
}

export class PersonManager extends BaseManager {
  // eslint-disable-next-line tsdoc/syntax
  /** @hidden */
  public storeCache (data: any) {
    return super.storeCache(`people/${data.mal_id}`, data)
  }

  public async search (searchString: string, filter?: Partial<PersonSearchFilter>, offset?: number, maxCount?: number) {
    const rawData = <Array<any>> await this.requestPaginatedResource('people', offset, maxCount, {
      [searchString.length === 1 ? 'letter' : 'q']: searchString,
      ...filter && translateObject(filter, (key, value) => {
        switch (key) {
          case 'orderBy': return ['order_by', value]

          default: return [key, `${value}`]
        }
      })
    })

    return rawData.map((data) => this.storeCache(data)).map((person) => new Person(this.client, person))
  }

  public async list (offset?: number, maxCount?: number): Promise<Array<Person>> {
    const rawData = <Array<any>> await this.requestPaginatedResource('people', offset, maxCount)

    return rawData.map((data: any) => this.storeCache(data)).map((person: any) => new Person(this.client, person))
  }

  public async listTop (offset?: number, maxCount?: number) {
    const rawData = <Array<any>> await this.requestPaginatedResource('top/people', offset, maxCount)

    return rawData.map((data: any) => this.storeCache(data)).map((person: any) => new Person(this.client, person))
  }

  public async random (): Promise<Person> {
    const rawData = await this.requestResource('random/people', { disableCaching: 'true' })

    this.storeCache(rawData)
    return new Person(this.client, rawData)
  }

  public async get (personId: number): Promise<Person | undefined> {
    const rawData = await this.requestResource(`people/${personId}`)

    return rawData ? new Person(this.client, rawData) : undefined
  }

  public async getAnime (personId: number): Promise<Array<PersonAnimeReference> | undefined> {
    const rawData = await this.requestResource(`people/${personId}/anime`)

    return rawData ? rawData.map((animeReference: any) => new PersonAnimeReference(this.client, personId, animeReference)) : undefined
  }

  public async getVoiceActors (personId: number): Promise<Array<PersonVoiceActorReference> | undefined> {
    const rawData = await this.requestResource(`people/${personId}/voices`)

    return rawData ? rawData.map((voiceActorReference: any) => new PersonVoiceActorReference(this.client, personId, voiceActorReference)) : undefined
  }

  public async getManga (personId: number): Promise<Array<PersonMangaReference> | undefined> {
    const rawData = await this.requestResource(`people/${personId}/manga`)

    return rawData ? rawData.map((mangaReference: any) => new PersonMangaReference(this.client, personId, mangaReference)) : undefined
  }

  public async getPictures (personID: number): Promise<Array<Image> | undefined> {
    const rawData = await this.requestResource(`people/${personID}/pictures`)

    return rawData ? rawData.map((picture: any) => new Image(this.client, picture)) : undefined
  }
}
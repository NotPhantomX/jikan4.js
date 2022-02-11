import { Client } from '../core/client'
import { BaseClass, BaseResource } from './base'
import { URL } from 'url'
import { AnimeMeta, CharacterMeta, MangaMeta } from './meta'
import { Image } from './misc'

export class PersonName extends BaseClass {
  public readonly name: string
  public readonly given: string | null
  public readonly family: string | null
  public readonly alternate: Array<string>

  public constructor (client: Client, data: any) {
    super(client)

    this.name = PersonName.parseString(data.name)
    this.given = PersonName.parseString(data.given_name, true)
    this.family = PersonName.parseString(data.faimly_name, true)
    this.alternate = data.alternate_names.map((alternate: any) => PersonName.parseString(alternate, true)).filter((alternate: any) => !!alternate)
  }
}

export class Person extends BaseResource {
  public readonly websiteUrl: URL | null
  public readonly image: Image
  public readonly name: PersonName
  public readonly birth: Date
  public readonly favorites: number
  public readonly about: string | null

  public getAnime () {
    return <Promise<PersonAnimeReference[]>> this.client.people.getAnime(this.id)
  }

  public getVoiceActors () {
    return <Promise<PersonVoiceActorReference[]>> this.client.people.getVoiceActors(this.id)
  }

  public getManga () {
    return <Promise<PersonMangaReference[]>> this.client.people.getManga(this.id)
  }

  public getPictures () {
    return <Promise<Image[]>> this.client.people.getPictures(this.id)
  }

  public constructor (client: Client, data: any) {
    super(client, data)

    this.websiteUrl = Person.parseURL(data.website_url, true)
    this.image = new Image(client, data.images?.jpg)
    this.name = new PersonName(client, data)
    this.birth = Person.parseDate(data.birthday)
    this.favorites = Person.parseNumber(data.favorites)
    this.about = Person.parseString(data.about, true)
  }
}

export class PersonAnimeReference extends BaseClass {
  public readonly personId: number
  public readonly position: string
  public readonly anime: AnimeMeta

  public getPerson () {
    return <Promise<Person>> this.client.people.get(this.personId)
  }

  public constructor (client: Client, personId: number, data: any) {
    super(client)

    this.personId = personId
    this.position = PersonAnimeReference.parseString(data.position)
    this.anime = new AnimeMeta(client, data.anime)
  }
}

export class PersonVoiceActorReference extends BaseClass {
  public readonly personId: number
  public readonly role: string
  public readonly anime: AnimeMeta
  public readonly character: CharacterMeta

  public getPerson () {
    return <Promise<Person>> this.client.people.get(this.personId)
  }

  public constructor (client: Client, personId: number, data: any) {
    super(client)

    this.personId = personId
    this.role = PersonVoiceActorReference.parseString(data.role)
    this.anime = new AnimeMeta(client, data.anime)
    this.character = new CharacterMeta(client, data.character)
  }
}

export class PersonMangaReference extends BaseClass {
  public readonly personId: number
  public readonly position: string
  public readonly manga: MangaMeta

  public getPerson () {
    return <Promise<Person>> this.client.people.get(this.personId)
  }

  public constructor (client: Client, personId: number, data: any) {
    super(client)

    this.personId = personId
    this.position = PersonMangaReference.parseString(data.position)
    this.manga = new MangaMeta(client, data.manga)
  }
}
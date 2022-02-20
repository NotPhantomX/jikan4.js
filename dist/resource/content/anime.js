"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnimeRelationGroup = exports.AnimeReview = exports.AnimeReviewScores = exports.AnimeUserUpdate = exports.AnimeNews = exports.AnimeRecommendation = exports.AnimeStatistics = exports.AnimeVideo = exports.AnimeEpisodeVideo = exports.AnimePromo = exports.AnimeTopic = exports.AnimePartialEpisode = exports.AnimeEpisode = exports.AnimeEpisodeTitle = exports.AnimeStaffReference = exports.AnimeCharacterReference = exports.AnimeVoiceActorReference = exports.Anime = exports.AnimeAirInformation = void 0;
const tslib_1 = require("tslib");
const base_1 = require("./base");
const base_2 = require("../base");
const misc_1 = require("../misc");
const meta_1 = require("../meta");
const parse_duration_1 = (0, tslib_1.__importDefault)(require("parse-duration"));
const genre_1 = require("../../manager/genre");
class AnimeAirInformation extends base_2.BaseClass {
    constructor(client, data) {
        super(client);
        this.status = AnimeAirInformation.parseStatus(data.status);
        this.airing = !!data.airing;
        this.airedFrom = AnimeAirInformation.parseDate(data.aired.from, true);
        this.airedTo = AnimeAirInformation.parseDate(data.aired.to, true);
    }
    // eslint-disable-next-line tsdoc/syntax
    /** @hidden */
    static parseStatus(input) {
        const status = input === null || input === void 0 ? void 0 : input.toLowerCase().trim();
        switch (status) {
            case 'finished airing': return 'FinishedAiring';
            case 'currently airing': return 'Airing';
            case 'not yet aired': return 'NotYetAired';
            default: return 'Unknown';
        }
    }
}
exports.AnimeAirInformation = AnimeAirInformation;
class Anime extends base_1.Content {
    constructor(client, data) {
        var _a, _b, _c, _d, _e, _f, _g;
        super(client, data);
        this.trailer = Anime.parseTrailer(client, data.trailer);
        this.type = Anime.parseType(data.type);
        this.source = data.source || null;
        this.episodes = data.episodes || null;
        this.airInfo = new AnimeAirInformation(client, data);
        this.duration = (0, parse_duration_1.default)(data.duration, 'millisecond') || null;
        this.rating = Anime.parseRating(data.rating);
        this.season = Anime.parseSeason(data.season);
        this.year = data.year || null;
        this.producers = ((_a = data.producers) === null || _a === void 0 ? void 0 : _a.map((producer) => new meta_1.ProducerMeta(this.client, producer))) || [];
        this.licensors = ((_b = data.licensors) === null || _b === void 0 ? void 0 : _b.map((licensor) => new meta_1.ProducerMeta(this.client, licensor))) || [];
        this.studios = ((_c = data.studios) === null || _c === void 0 ? void 0 : _c.map((studio) => new meta_1.ProducerMeta(this.client, studio))) || [];
        this.genres = ((_d = data.genres) === null || _d === void 0 ? void 0 : _d.map((genre) => new meta_1.AnimeGenreMeta(this.client, genre, 'Genre'))) || [];
        this.explicitGenres = ((_e = data.explicit_genres) === null || _e === void 0 ? void 0 : _e.map((genre) => new meta_1.AnimeGenreMeta(this.client, genre, 'Explicit'))) || [];
        this.demographics = ((_f = data.demographics) === null || _f === void 0 ? void 0 : _f.map((genre) => new meta_1.AnimeGenreMeta(this.client, genre, 'Demographic'))) || [];
        this.themes = ((_g = data.themes) === null || _g === void 0 ? void 0 : _g.map((genre) => new meta_1.AnimeGenreMeta(this.client, genre, 'Theme'))) || [];
    }
    // eslint-disable-next-line tsdoc/syntax
    /** @hidden */
    static parseTrailer(client, input) {
        const youtubeId = input === null || input === void 0 ? void 0 : input.youtube_id;
        return youtubeId ? new misc_1.YoutubeVideo(client, youtubeId) : null;
    }
    // eslint-disable-next-line tsdoc/syntax
    /** @hidden */
    static parseType(input) {
        switch (input === null || input === void 0 ? void 0 : input.toLowerCase().trim()) {
            case 'tv': return 'TV';
            case 'ova': return 'OVA';
            case 'movie': return 'Movie';
            case 'special': return 'Special';
            case 'ona': return 'ONA';
            case 'music': return 'Music';
            case 'unknow':
            case 'unknown':
            case '-':
            default: return 'Unknown';
        }
    }
    // eslint-disable-next-line tsdoc/syntax
    /** @hidden */
    static parseRating(input) {
        switch (input === null || input === void 0 ? void 0 : input.toLowerCase().trim()) {
            case 'none': return 'None';
            case 'g - all ages': return 'G';
            case 'pg - childre': return 'PG';
            case 'pg - children': return 'PG';
            case 'pg-13 - teens 13 or older': return 'PG-13+';
            case 'r - 17+ (violence & profanity)': return 'R-17+';
            case 'r+ - mild nudity': return 'R+';
            case 'rx - hentai': return 'Rx';
            default: return 'Unknown';
        }
    }
    // eslint-disable-next-line tsdoc/syntax
    /** @hidden */
    static parseSeason(input) {
        switch (input) {
            case 'summer': return 'Summer';
            case 'winter': return 'Winter';
            case 'spring': return 'Spring';
            case 'fall': return 'Fall';
            default: return 'Unknown';
        }
    }
    get isExplicit() {
        return !!(['Rx', 'R-17+'].includes(this.rating) ||
            this.genres.find((genre) => !!genre_1.animeExplicitGenres.find((genreEntry) => genreEntry[0] === genre.id)));
    }
    getCharacters() {
        return this.client.anime.getCharacters(this.id);
    }
    getStaff() {
        return this.client.anime.getStaff(this.id);
    }
    getEpisodes(offset, maxCount) {
        return this.client.anime.getEpisodes(this.id, offset, maxCount);
    }
    getEpisode(episodeId) {
        return this.client.anime.getEpisode(this.id, episodeId);
    }
    getNews(offset, maxCount) {
        return this.client.anime.getNews(this.id, offset, maxCount);
    }
    getTopics(topic) {
        return this.client.anime.getTopics(this.id, topic);
    }
    getVideos() {
        return this.client.anime.getVideos(this.id);
    }
    getPictures() {
        return this.client.anime.getPictures(this.id);
    }
    getStatistics() {
        return this.client.anime.getStatistics(this.id);
    }
    getMoreInfo() {
        return this.client.anime.getMoreInfo(this.id);
    }
    getRecommendations() {
        return this.client.anime.getRecommendations(this.id);
    }
    getUserUpdates(offset, maxCount) {
        return this.client.anime.getUserUpdates(this.id, offset, maxCount);
    }
    getReviews(offset, maxCount) {
        return this.client.anime.getReviews(this.id, offset, maxCount);
    }
    getRelations() {
        return this.client.anime.getRelations(this.id);
    }
    getThemes() {
        return this.client.anime.getThemes(this.id);
    }
}
exports.Anime = Anime;
class AnimeVoiceActorReference extends base_2.BaseClass {
    constructor(client, animeId, data) {
        super(client);
        this.animeId = animeId;
        this.language = data.language;
        this.person = new meta_1.PersonMeta(client, data.person);
    }
    getAnime() {
        return this.client.anime.get(this.animeId);
    }
}
exports.AnimeVoiceActorReference = AnimeVoiceActorReference;
class AnimeCharacterReference extends base_2.BaseClass {
    constructor(client, animeId, data) {
        var _a;
        super(client);
        this.animeId = animeId;
        this.role = data.role;
        this.character = new meta_1.CharacterMeta(client, data.character);
        this.voiceActors = ((_a = data.voice_actors) === null || _a === void 0 ? void 0 : _a.map((voiceActor) => new AnimeVoiceActorReference(this.client, this.animeId, voiceActor))) || [];
    }
    getAnime() {
        return this.client.anime.get(this.animeId);
    }
}
exports.AnimeCharacterReference = AnimeCharacterReference;
class AnimeStaffReference extends base_2.BaseClass {
    constructor(client, animeId, data) {
        super(client);
        this.animeId = animeId;
        this.positions = data.positions.filter((position) => !!position);
        this.person = new meta_1.PersonMeta(client, data.person);
    }
    getAnime() {
        return this.client.anime.get(this.animeId);
    }
}
exports.AnimeStaffReference = AnimeStaffReference;
class AnimeEpisodeTitle extends base_2.BaseClass {
    constructor(client, data) {
        super(client);
        this.default = data.title;
        this.japanese = data.japanese || null;
        this.romanji = data.romanji || null;
    }
    toString() {
        return this.default;
    }
}
exports.AnimeEpisodeTitle = AnimeEpisodeTitle;
class AnimeEpisode extends base_2.BaseClass {
    constructor(client, animeId, data) {
        super(client);
        this.animeId = animeId;
        this.episodeId = data.mal_id;
        this.URL = AnimeEpisode.parseURL(data.url, true);
        this.title = new AnimeEpisodeTitle(client, data);
        this.duration = data.duration || null;
        this.aired = data.aired ? new Date(data.aired) : null;
        this.filler = !!data.filler;
        this.recap = !!data.recap;
        this.synopsis = data.synopsis || null;
    }
    getAnime() {
        return this.client.anime.get(this.animeId);
    }
}
exports.AnimeEpisode = AnimeEpisode;
class AnimePartialEpisode extends AnimeEpisode {
    constructor(client, animeId, data) {
        super(client, animeId, data);
        this.synopsis = null;
        this.forumUrl = AnimePartialEpisode.parseURL(data.forum_url, true);
    }
    getFullEpisode() {
        return this.client.anime.getEpisode(this.animeId, this.episodeId);
    }
}
exports.AnimePartialEpisode = AnimePartialEpisode;
class AnimeTopic extends base_2.BaseResource {
    constructor(client, animeId, data) {
        super(client, data);
        this.animeId = animeId;
        this.title = data.title;
        this.date = new Date(data.date);
        this.authorUsername = data.author_username;
        this.authorURL = AnimeTopic.parseURL(data.author_url);
        this.comments = data.comments;
    }
    getAnime() {
        return this.client.anime.get(this.id);
    }
}
exports.AnimeTopic = AnimeTopic;
class AnimePromo extends base_2.BaseClass {
    constructor(client, animeId, data) {
        super(client);
        this.animeId = animeId;
        this.title = data.title;
        this.trailer = Object.assign(new misc_1.YoutubeVideo(client, data.trailer.youtube_id), { image: new misc_1.Image(client, data.trailer.images) });
    }
    getAnime() {
        return this.client.anime.get(this.animeId);
    }
}
exports.AnimePromo = AnimePromo;
class AnimeEpisodeVideo extends base_2.BaseResource {
    constructor(client, animeId, data) {
        var _a, _b, _c;
        super(client, data);
        this.animeId = animeId;
        this.title = data.title;
        this.episode = typeof (data.episode) === 'string' ? Number((_a = data.episode.toLowerCase().split('episode')[1]) === null || _a === void 0 ? void 0 : _a.trim()) || 0 : 0;
        this.imageURL = AnimeEpisodeVideo.parseURL((_c = (_b = data.images) === null || _b === void 0 ? void 0 : _b.jpg) === null || _c === void 0 ? void 0 : _c.image_url, true);
    }
    getAnime() {
        return this.client.anime.get(this.animeId);
    }
}
exports.AnimeEpisodeVideo = AnimeEpisodeVideo;
class AnimeVideo extends base_2.BaseClass {
    constructor(client, animeId, data) {
        var _a, _b;
        super(client);
        this.animeId = animeId;
        this.promos = ((_a = data.promo) === null || _a === void 0 ? void 0 : _a.map((promo) => new AnimePromo(this.client, this.animeId, promo))) || [];
        this.episodes = ((_b = data.episodes) === null || _b === void 0 ? void 0 : _b.map((episodeVideo) => new AnimeEpisodeVideo(this.client, this.animeId, episodeVideo))) || [];
    }
}
exports.AnimeVideo = AnimeVideo;
class AnimeStatistics extends base_1.ContentStatistics {
    constructor(client, animeId, data) {
        super(client, data);
        this.animeId = animeId;
        this.watching = data.watching;
        this.planToWatch = data.plan_to_watch;
    }
    getAnime() {
        return this.client.anime.get(this.animeId);
    }
}
exports.AnimeStatistics = AnimeStatistics;
class AnimeRecommendation extends base_2.BaseClass {
    constructor(client, animeId, data) {
        super(client);
        this.animeId = animeId;
        this.entry = new meta_1.AnimeMeta(client, data.entry);
        this.URL = AnimeRecommendation.parseURL(data.url);
        this.votes = data.votes;
    }
    getAnime() {
        return this.client.anime.get(this.animeId);
    }
}
exports.AnimeRecommendation = AnimeRecommendation;
class AnimeNews extends base_1.ContentNews {
    constructor(client, animeId, data) {
        super(client, data);
        this.animeId = animeId;
    }
    getAnime() {
        return this.client.anime.get(this.animeId);
    }
}
exports.AnimeNews = AnimeNews;
class AnimeUserUpdate extends base_1.ContentUserUpdate {
    constructor(client, animeId, data) {
        super(client, data);
        this.animeId = animeId;
        this.episodesSeen = data.episodes_seen;
        this.episodesTotal = data.episodes_total;
    }
    getAnime() {
        return this.client.anime.get(this.animeId);
    }
}
exports.AnimeUserUpdate = AnimeUserUpdate;
class AnimeReviewScores extends base_1.ContentReviewScores {
    constructor(client, data) {
        super(client, data);
        this.animation = data.animation;
        this.sound = data.sound;
    }
}
exports.AnimeReviewScores = AnimeReviewScores;
class AnimeReview extends base_1.ContentReview {
    constructor(client, animeId, data) {
        super(client, data);
        this.animeId = animeId;
        this.episodesWatched = data.episodes_watched;
        this.scores = new AnimeReviewScores(client, data.scores);
    }
    getAnime() {
        return this.client.anime.get(this.animeId);
    }
}
exports.AnimeReview = AnimeReview;
class AnimeRelationGroup extends base_1.ContentRelationGroup {
    constructor(client, animeId, relation, data) {
        var _a;
        super(client, relation, data);
        this.animeId = animeId;
        this.items = ((_a = data.entry) === null || _a === void 0 ? void 0 : _a.map((item) => new (this.relation === 'Adaptation' ? meta_1.MangaMeta : meta_1.AnimeMeta)(this.client, item))) || [];
    }
    getAnime() {
        return this.client.anime.get(this.animeId);
    }
}
exports.AnimeRelationGroup = AnimeRelationGroup;

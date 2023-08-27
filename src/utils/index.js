/* eslint-disable camelcase */

const mapDBToModel = ({
    id,
    title,
    year,
    performer,
    genre,
    duration,
    album_id,
    songs,
    created_at,
    updated_at,
    username,
    name,
    owner,
    playlist_id,
    song_id,
}) => ({
    id,
    title,
    year,
    performer,
    genre,
    duration,
    albumId: album_id,
    songs,
    createdAt: created_at,
    updatedAt: updated_at,
    username,
    name,
    owner,
    playlistId: playlist_id,
    songId: song_id,
});

module.exports = { mapDBToModel };
require('dotenv').config();
const Hapi = require('@hapi/hapi');
const Jwt = require("@hapi/jwt");
const ClientError = require('./exceptions/ClientError');

// Song
const songs = require('./api/songs');
const SongsService = require('./services/postgres/SongsService.js');
const SongsValidator = require('./validator/songs');

// Album
const albums = require('./api/albums');
const AlbumsService = require('./services/postgres/AlbumsService.js');
const AlbumsValidator = require('./validator/albums');

// User
const users = require("./api/users");
const UsersService = require("./services/postgres/UsersService");
const UsersValidator = require("./validator/users");

// Authentication
const authentications = require("./api/authentications");
const AuthenticationsService = require("./services/postgres/AuthenticationsService");
const TokenManager = require("./tokenize/TokenManager");
const AuthenticationsValidator = require("./validator/authentications");

// Collaboration
const collaborations = require("./api/collaborations");
const CollaborationsService = require("./services/postgres/CollaborationsService");
const CollaborationsValidator = require("./validator/collaborations");

// Playlist
const playlists = require("./api/playlists");
const PlaylistsService = require("./services/postgres/PlaylistsService");
const PlaylistsValidator = require("./validator/playlists");

// playlistsongs
const playlistsongs = require("./api/playlistsongs");
const PlaylistsongsService = require("./services/postgres/PlaylistsongsService");
const PlaylistsongsValidator = require("./validator/playlistsongs");

const init = async () => {
  const songsService = new SongsService();
  const albumsService = new AlbumsService();
  const usersService = new UsersService();
  const authenticationsService = new AuthenticationsService();
  const collaborationsService = new CollaborationsService();
  const playlistsService = new PlaylistsService(collaborationsService);
  const playlistsongsService = new PlaylistsongsService();
  
  const server = Hapi.server({
    port: process.env.PORT,
    host: process.env.HOST,
    routes: {
      cors: {
        origin: ['*'],
      },
    },
  });

  // registrasi plugin eksternal
  await server.register([
    {
      plugin: Jwt,
    },
  ]);

  // mendefinisikan strategy otentikasi jwt
  server.auth.strategy("playlistsapp_jwt", "jwt", {
    keys: process.env.ACCESS_TOKEN_KEY,
    verify: {
      aud: false,
      iss: false,
      sub: false,
      maxAgeSec: process.env.ACCESS_TOKEN_AGE,
    },
    validate: (artifacts) => ({
      isValid: true,
      credentials: {
        id: artifacts.decoded.payload.id,
      },
    }),
  });

  await server.register(
    [
      {
        plugin: songs,
        options: {
          service: songsService,
          validator: SongsValidator,
        },
      },
      {
        plugin: albums,
        options: {
          service: albumsService,
          validator: AlbumsValidator,
        },
      },
      {
        plugin: users,
        options: {
          service: usersService,
          validator: UsersValidator,
        },
      },
      {
        plugin: authentications,
        options: {
          authenticationsService,
          usersService,
          tokenManager: TokenManager,
          validator: AuthenticationsValidator,
        },
      },
      {
        plugin: collaborations,
        options: {
          collaborationsService,
          playlistsService,
          validator: CollaborationsValidator,
        },
      },
      {
        plugin: playlists,
        options: {
          playlistsService,
          usersService,
          validator: PlaylistsValidator,
        },
      },
      {
        plugin: playlistsongs,
        options: {
          playlistsongsService,
          playlistsService,
          validator: PlaylistsongsValidator,
        },
      },
    ]);

  server.ext('onPreResponse', (request, h) => {
    // mendapatkan konteks response dari request
    const { response } = request;
    if (response instanceof Error) {

      // penanganan client error secara internal.
      if (response instanceof ClientError) {
        const newResponse = h.response({
          status: 'fail',
          message: response.message,
        });
        newResponse.code(response.statusCode);
        return newResponse;
      }
      // mempertahankan penanganan client error oleh hapi secara native, seperti 404, etc.
      if (!response.isServer) {
        return h.continue;
      }
      // penanganan server error sesuai kebutuhan
      const newResponse = h.response({
        status: 'error',
        message: 'terjadi kegagalan pada server kami',
      });
      newResponse.code(500);
      return newResponse;
    }
    // jika bukan error, lanjutkan dengan response sebelumnya (tanpa terintervensi)
    return h.continue;
  });
  
  await server.start();
  console.log(`Server berjalan pada ${server.info.uri}`);
};

init();

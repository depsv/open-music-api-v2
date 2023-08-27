const autoBind = require('auto-bind');

class CollaborationsHandler {
    constructor(collaborationsService, playlistsService, validator) {
        this._collaborationsService = collaborationsService;
        this._playlistsService = playlistsService;
        this._validator = validator;

        autoBind(this);
    }

    async postCollaborationHandler(request, h) {
        this._validator.validateCollaborationPayload(request.payload);
        const { id: credentialId } = request.auth.credentials;

        await this._playlistsService.verifyPlaylistOwner(request.payload, credentialId);
        
        const collaborationId = await this._collaborationsService.addCollaboration(request.payload);

        const response = h.response({
            status: "success",
            message: "Kolaborasi berhasil ditambahkan",
            data: {
                collaborationId,
            },
        });
        response.code(201);
        return response;
    }

    async deleteCollaborationHandler(request) {
        this._validator.validateCollaborationPayload(request.payload);
        const { id: credentialId } = request.auth.credentials;

        await this._playlistsService.verifyPlaylistOwner(request.payload, credentialId);
        await this._collaborationsService.deleteCollaboration(request.payload);

        return {
            status: "success",
            message: "Kolaborasi berhasil dihapus",
        };
    }
}

module.exports = CollaborationsHandler;
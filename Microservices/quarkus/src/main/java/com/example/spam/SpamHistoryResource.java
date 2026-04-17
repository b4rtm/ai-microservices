package com.example.spam;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@Path("/user")
public class SpamHistoryResource {

    @Inject
    SpamHistoryService spamHistoryService;

    @GET
    @Path("/{userId}")
    public SpamPageResponse getByUserId(
            @PathParam("userId") Long userId,
            @QueryParam("page") @DefaultValue("0") int page,
            @QueryParam("size") @DefaultValue("10") int size
    ) {
        return spamHistoryService.getByUserId(userId, page, size);
    }

    @POST
    @Path("/add")
    public Response addRecord(SpamDTO dto) {
        var created = spamHistoryService.addRecord(dto);
        return Response.status(Response.Status.CREATED).header("X-Instance-ID", System.getenv("HOSTNAME")).entity(created).build();
    }

    @PATCH
    @Path("/delete/{id}")
    public Response delete(@PathParam("id") Long id) {
        boolean deleted = spamHistoryService.deleteRecord(id);
        if (!deleted) {
            return Response.status(Response.Status.NOT_FOUND).header("X-Instance-ID", System.getenv("HOSTNAME")).build();
        }

        return Response.noContent().build();
    }
}
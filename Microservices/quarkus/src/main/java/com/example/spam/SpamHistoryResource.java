package com.example.spam;

import com.example.spam.SpamDTO;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

import java.util.List;

@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@Path("/user")
public class SpamHistoryResource {

    @Inject
    SpamHistoryService spamHistoryService;

    @GET
    @Path("/{userId}")
    public List<SpamDTO> getByUserId(@PathParam("userId") Long userId) {
        return spamHistoryService.getByUserId(userId);
    }

    @POST
    @Path("/add")
    public Response addRecord(SpamDTO dto) {
        var created = spamHistoryService.addRecord(dto);
        return Response.status(Response.Status.CREATED).entity(created).build();
    }

    @PATCH
    @Path("/delete/{id}")
    public Response delete(@PathParam("id") Long id) {
        boolean deleted = spamHistoryService.deleteRecord(id);
        if (!deleted) {
            return Response.status(Response.Status.NOT_FOUND).build();
        }

        return Response.noContent().build();
    }
}
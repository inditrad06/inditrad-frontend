
package com.inditrad.api;


import lombok.extern.slf4j.Slf4j;

import com.inditrad.entity.Notification;
import com.inditrad.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;


import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import java.util.List;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationRepository notificationRepository;

    @Operation(summary = "Get notifications", description = "Fetch or mark notifications related to transactions.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Success"),
        @ApiResponse(responseCode = "400", description = "Bad Request"),
        @ApiResponse(responseCode = "500", description = "Internal Server Error")
    })
    @GetMapping("/admin/{adminId}")
    public List<Notification> getNotifications(@PathVariable Long adminId) {
        return notificationRepository.findByAdminIdAndReadStatusFalse(adminId);
    }

    @Operation(summary = "API endpoint", description = "Performs the corresponding operation.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Success"),
        @ApiResponse(responseCode = "400", description = "Bad Request"),
        @ApiResponse(responseCode = "500", description = "Internal Server Error")
    })
    @PutMapping("/{id}/read")
    public void markAsRead(@PathVariable Long id) {
        Notification note = notificationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Notification not found"));
        note.setReadStatus(true);
        notificationRepository.save(note);
    }
}
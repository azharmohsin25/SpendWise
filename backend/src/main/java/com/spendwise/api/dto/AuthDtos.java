package com.spendwise.api.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public final class AuthDtos {
    private AuthDtos() {}
    public record RegisterRequest(@NotBlank @Size(max=90) String fullName, @NotBlank @Email @Size(max=190) String email, @NotBlank @Size(min=8,max=72) String password) {}
    public record LoginRequest(@NotBlank @Email String email, @NotBlank String password) {}
    public record ForgotPasswordRequest(@NotBlank @Email String email) {}
    public record ResetPasswordRequest(@NotBlank String token,@NotBlank @Size(min=8,max=72) String password) {}
    public record MessageResponse(String message) {}
    public record AuthResponse(String token, String tokenType, UserView user) {}
    public record UserView(Long id, String fullName, String email, String currency) {}
}

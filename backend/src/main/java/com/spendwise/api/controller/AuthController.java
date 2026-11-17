package com.spendwise.api.controller;

import com.spendwise.api.dto.AuthDtos;
import com.spendwise.api.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

@RestController @RequestMapping("/api/auth")
public class AuthController {
    private final AuthService auth;
    public AuthController(AuthService auth) { this.auth=auth; }
    @PostMapping("/register") public AuthDtos.AuthResponse register(@Valid @RequestBody AuthDtos.RegisterRequest request) { return auth.register(request); }
    @PostMapping("/login") public AuthDtos.AuthResponse login(@Valid @RequestBody AuthDtos.LoginRequest request) { return auth.login(request); }
    @PostMapping("/forgot-password") public AuthDtos.MessageResponse forgotPassword(@Valid @RequestBody AuthDtos.ForgotPasswordRequest request) { return auth.forgotPassword(request); }
    @PostMapping("/reset-password") public AuthDtos.MessageResponse resetPassword(@Valid @RequestBody AuthDtos.ResetPasswordRequest request) { return auth.resetPassword(request); }
}

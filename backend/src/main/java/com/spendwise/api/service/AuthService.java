package com.spendwise.api.service;

import com.spendwise.api.dto.AuthDtos;
import com.spendwise.api.model.AppUser;
import com.spendwise.api.model.PasswordResetToken;
import com.spendwise.api.repository.AppUserRepository;
import com.spendwise.api.repository.PasswordResetTokenRepository;
import com.spendwise.api.security.JwtService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.HexFormat;
import java.util.UUID;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class AuthService {
    private static final Logger log=LoggerFactory.getLogger(AuthService.class);
    private final AppUserRepository users; private final PasswordEncoder passwordEncoder; private final AuthenticationManager authenticationManager; private final UserDetailsService userDetailsService; private final JwtService jwtService; private final PasswordResetTokenRepository resetTokens; private final JavaMailSender mailSender; private final String webUrl; private final String mailFrom;
    public AuthService(AppUserRepository users,PasswordEncoder passwordEncoder,AuthenticationManager authenticationManager,UserDetailsService userDetailsService,JwtService jwtService,PasswordResetTokenRepository resetTokens,JavaMailSender mailSender,@Value("${app.web-url}") String webUrl,@Value("${spring.mail.username:}") String mailFrom) { this.users=users;this.passwordEncoder=passwordEncoder;this.authenticationManager=authenticationManager;this.userDetailsService=userDetailsService;this.jwtService=jwtService;this.resetTokens=resetTokens;this.mailSender=mailSender;this.webUrl=webUrl;this.mailFrom=mailFrom; }
    @Transactional public AuthDtos.AuthResponse register(AuthDtos.RegisterRequest request) {
        String email=request.email().toLowerCase().trim();
        if(users.existsByEmail(email)) throw new ResponseStatusException(HttpStatus.CONFLICT,"An account with this email already exists");
        AppUser user=users.save(new AppUser(request.fullName().trim(),email,passwordEncoder.encode(request.password()))); return response(user);
    }
    public AuthDtos.AuthResponse login(AuthDtos.LoginRequest request) {
        String email=request.email().toLowerCase().trim();
        try { authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(email,request.password())); }
        catch (RuntimeException ex) { throw new ResponseStatusException(HttpStatus.UNAUTHORIZED,"Email or password is incorrect"); }
        return response(users.findByEmail(email).orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED,"Account not found")));
    }
    @Transactional public AuthDtos.MessageResponse forgotPassword(AuthDtos.ForgotPasswordRequest request) {
        String email=request.email().toLowerCase().trim();
        users.findByEmail(email).ifPresent(user -> {
            resetTokens.deleteAllByUserId(user.getId());
            String raw=UUID.randomUUID().toString().replace("-","");
            resetTokens.save(new PasswordResetToken(user,hash(raw),Instant.now().plus(30,ChronoUnit.MINUTES)));
            var message=new SimpleMailMessage(); message.setFrom(mailFrom.isBlank()?"no-reply@spendwise.local":mailFrom); message.setTo(user.getEmail());
            message.setSubject("Reset your SpendWise password"); message.setText("Use this link within 30 minutes to choose a new password:\n\n"+webUrl+"/?reset="+raw+"\n\nIf you did not ask to reset your password, you can ignore this message.");
            try { mailSender.send(message); } catch (MailException ex) { log.warn("Password reset email could not be delivered; SMTP is not configured or unavailable"); }
        });
        return new AuthDtos.MessageResponse("If an account exists for that email, password reset instructions will be sent.");
    }
    @Transactional public AuthDtos.MessageResponse resetPassword(AuthDtos.ResetPasswordRequest request) {
        var reset=resetTokens.findByTokenHash(hash(request.token())).orElseThrow(()->new ResponseStatusException(HttpStatus.BAD_REQUEST,"Reset link is invalid or expired"));
        if(reset.getExpiresAt().isBefore(Instant.now())) { resetTokens.delete(reset); throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Reset link is invalid or expired"); }
        AppUser user=reset.getUser(); user.setPasswordHash(passwordEncoder.encode(request.password())); users.save(user); resetTokens.deleteAllByUserId(user.getId());
        return new AuthDtos.MessageResponse("Password updated. You can now sign in.");
    }
    private String hash(String value) {
        try { return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(value.getBytes(StandardCharsets.UTF_8))); }
        catch (NoSuchAlgorithmException ex) { throw new IllegalStateException("SHA-256 is unavailable",ex); }
    }
    private AuthDtos.AuthResponse response(AppUser user) { var details=userDetailsService.loadUserByUsername(user.getEmail()); return new AuthDtos.AuthResponse(jwtService.generateToken(details),"Bearer",new AuthDtos.UserView(user.getId(),user.getFullName(),user.getEmail(),user.getCurrency())); }
}

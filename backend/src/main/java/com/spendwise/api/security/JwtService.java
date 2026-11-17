package com.spendwise.api.security;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import javax.crypto.SecretKey;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Service
public class JwtService {
    private final SecretKey key;
    private final long expirationMs;
    public JwtService(@Value("${app.jwt.secret}") String secret, @Value("${app.jwt.expiration-ms}") long expirationMs) {
        byte[] keyBytes;
        try { keyBytes = Decoders.BASE64.decode(secret); }
        catch (IllegalArgumentException ignored) { keyBytes = secret.getBytes(StandardCharsets.UTF_8); }
        if (keyBytes.length < 32) throw new IllegalArgumentException("JWT secret must contain at least 32 bytes");
        this.key = Keys.hmacShaKeyFor(keyBytes); this.expirationMs = expirationMs;
    }
    public String generateToken(UserDetails user) {
        var now = new Date();
        return Jwts.builder().subject(user.getUsername()).issuedAt(now).expiration(new Date(now.getTime() + expirationMs)).signWith(key).compact();
    }
    public String extractUsername(String token) { return Jwts.parser().verifyWith(key).build().parseSignedClaims(token).getPayload().getSubject(); }
    public boolean isValid(String token, UserDetails user) {
        var claims = Jwts.parser().verifyWith(key).build().parseSignedClaims(token).getPayload();
        return user.getUsername().equals(claims.getSubject()) && claims.getExpiration().after(new Date());
    }
}

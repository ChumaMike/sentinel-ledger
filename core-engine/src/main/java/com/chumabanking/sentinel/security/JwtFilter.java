package com.chumabanking.sentinel.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;

public class JwtFilter extends OncePerRequestFilter {
    private static final String SECRET = "SENTINEL_SUPER_SECRET_KEY_FOR_JWT_32_CHARS";

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String authHeader = request.getHeader("Authorization");

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            // 🌟 1. Extract the token string first
            String token = authHeader.substring(7);

            try {
                // 🌟 2. Parse the claims using the modern 'verifyWith' API
                Claims claims = Jwts.parser()
                        .verifyWith(Keys.hmacShaKeyFor(SECRET.getBytes(StandardCharsets.UTF_8)))
                        .build()
                        .parseSignedClaims(token) // Use 'token' here
                        .getPayload();

                String user = claims.getSubject();
                // Custom claims now available:
                // String fullName = claims.get("name", String.class);

                if (user != null) {
                    UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
                            user, null, new ArrayList<>());
                    SecurityContextHolder.getContext().setAuthentication(auth);
                }
            } catch (Exception e) {
                // If token is invalid, clear the context
                SecurityContextHolder.clearContext();
            }
        }

        // 🌟 3. Always continue the filter chain
        filterChain.doFilter(request, response);
    }
}
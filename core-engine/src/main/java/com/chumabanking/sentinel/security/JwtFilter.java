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

    // 🔐 This key MUST match the one in application.properties
    private static final String SECRET = "YourSuperSecretKeyForSentinelBankingSystem2026";

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String authHeader = request.getHeader("Authorization");

        // 🔍 DEBUG PRINT 1: Check if header arrives
        if (authHeader == null) {
            // System.out.println("❌ JwtFilter: No Authorization header found.");
        } else {
            // System.out.println("🔍 JwtFilter: Header received: " + authHeader);
        }

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);

            try {
                // 🔍 DEBUG PRINT 2: Trying to parse
                // System.out.println("🕵️ JwtFilter: Verifying token...");

                Claims claims = Jwts.parserBuilder()
                        .setSigningKey(Keys.hmacShaKeyFor(SECRET.getBytes(StandardCharsets.UTF_8)))
                        .build()
                        .parseClaimsJws(token)
                        .getBody();

                String user = claims.getSubject();
                // System.out.println("✅ JwtFilter: Success! User is: " + user);

                if (user != null) {
                    UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
                            user, null, new ArrayList<>());
                    SecurityContextHolder.getContext().setAuthentication(auth);
                }
            } catch (Exception e) {
                // 🚨 THIS IS THE MOST IMPORTANT LINE
                System.out.println("🔥 JwtFilter ERROR: " + e.getClass().getSimpleName() + " - " + e.getMessage());

                SecurityContextHolder.clearContext();
            }
        }

        filterChain.doFilter(request, response);
    }
}
package com.sentinel.web.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.sentinel.common.model.User;
import com.sentinel.web.service.AuthService;
import com.sentinel.web.service.JwtService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(AuthController.class)
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private AuthService authService;

    @MockBean
    private JwtService jwtService; // Mock this too, as AuthController likely uses it

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @WithMockUser // Bypasses Spring Security for this test
    void register_ShouldReturn200_WhenUserValid() throws Exception {
        // 1. Prepare Request Data
        User user = new User();
        user.setEmail("test@sentinel.com");
        user.setPasswordHash("password123");

        // 2. Mock Service Response
        when(authService.register(any(User.class))).thenReturn(user);

        // 3. Perform POST Request
        mockMvc.perform(post("/api/auth/register")
                        .with(csrf()) // Required for non-GET requests in tests
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(user)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("test@sentinel.com"));
    }
}
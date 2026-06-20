import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";
import Login from "../pages/login";
import Register from "../pages/register";
import api from "../api/axios";

// Mock the axios api instance with safe defaults
vi.mock("../api/axios", () => {
  const defaultResolve = () => Promise.resolve({ data: { success: true, data: {} } });
  return {
    default: {
      post: vi.fn(defaultResolve),
      get: vi.fn(() => Promise.resolve({ data: { success: true, data: { isValid: true, exists: true, isGoogle: true } } })),
    },
  };
});

// Mock react-router useNavigate
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe("Auth Pages - Login & Register", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.alert = vi.fn(); // Mock window.alert to prevent tests crashing
  });

  describe("Login Component", () => {
    it("renders email and password fields, and submit button", () => {
      render(
        <BrowserRouter>
          <Login />
        </BrowserRouter>
      );
      expect(screen.getByPlaceholderText("user@gmail.com")).toBeInTheDocument();
      expect(screen.getByPlaceholderText("••••••••")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /SUBMIT CREDENTIALS/i })).toBeInTheDocument();
    });

    it("displays error when fields are empty on submit", async () => {
      render(
        <BrowserRouter>
          <Login />
        </BrowserRouter>
      );
      const submitBtn = screen.getByRole("button", { name: /SUBMIT CREDENTIALS/i });
      fireEvent.click(submitBtn);

      await waitFor(() => {
        expect(screen.getByText(/email is required/i)).toBeInTheDocument();
      });
    });

    it("submits the form successfully and navigates to user dashboard", async () => {
      api.get.mockImplementation((url) => {
        if (url.includes("/users/validate-email")) {
          return Promise.resolve({
            data: {
              success: true,
              data: { isValid: true, exists: true, isGoogle: true },
            },
          });
        }
        return Promise.resolve({ data: {} });
      });

      api.post.mockResolvedValueOnce({
        data: {
          success: true,
          data: {
            user: { _id: "123", email: "user@gmail.com", username: "testuser", role: "user" },
          },
        },
      });

      render(
        <BrowserRouter>
          <Login />
        </BrowserRouter>
      );

      fireEvent.change(screen.getByPlaceholderText("user@gmail.com"), {
        target: { value: "user@gmail.com" },
      });
      fireEvent.change(screen.getByPlaceholderText("••••••••"), {
        target: { value: "password123" },
      });

      const submitBtn = screen.getByRole("button", { name: /SUBMIT CREDENTIALS/i });
      fireEvent.click(submitBtn);

      await waitFor(() => {
        expect(api.post).toHaveBeenCalledWith("/users/login", {
          email: "user@gmail.com",
          password: "password123",
        });
        expect(mockNavigate).toHaveBeenCalledWith("/dashboard");
      });
    });
  });

  describe("Register Component", () => {
    it("renders registration fields", () => {
      render(
        <BrowserRouter>
          <Register />
        </BrowserRouter>
      );
      expect(screen.getByPlaceholderText("author_handle")).toBeInTheDocument();
      expect(screen.getByPlaceholderText("user@gmail.com")).toBeInTheDocument();
      expect(screen.getAllByPlaceholderText("••••••••")[0]).toBeInTheDocument();
    });

    it("submits register data and shows success message", async () => {
      api.get.mockImplementation((url) => {
        if (url.includes("/users/validate-email")) {
          return Promise.resolve({
            data: {
              success: true,
              data: { isValid: true, exists: true, isGoogle: true },
            },
          });
        }
        return Promise.resolve({ data: {} });
      });

      api.post.mockResolvedValueOnce({
        data: {
          success: true,
          message: "Registration successful",
        },
      });

      render(
        <BrowserRouter>
          <Register />
        </BrowserRouter>
      );

      fireEvent.change(screen.getByPlaceholderText("author_handle"), {
        target: { value: "newuser" },
      });
      fireEvent.change(screen.getByPlaceholderText("user@gmail.com"), {
        target: { value: "new@gmail.com" },
      });
      fireEvent.change(screen.getAllByPlaceholderText("••••••••")[0], {
        target: { value: "StrongPass123!" },
      });
      fireEvent.change(screen.getAllByPlaceholderText("••••••••")[1], {
        target: { value: "StrongPass123!" },
      });

      // Accept Terms checkbox
      const checkbox = screen.getByRole("checkbox");
      fireEvent.click(checkbox);

      const registerBtn = screen.getByRole("button", { name: /REGISTER ACCOUNT/i });
      fireEvent.click(registerBtn);

      await waitFor(() => {
        expect(api.post).toHaveBeenCalledWith("/users/register", {
          username: "newuser",
          email: "new@gmail.com",
          password: "StrongPass123!",
        });
        expect(screen.getByText(/registered/i)).toBeInTheDocument();
      });
    });
  });
});

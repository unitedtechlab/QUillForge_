import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";
import CreateBlogPage from "../pages/CreateBlogPage";
import BlogDetails from "../pages/BlogDetails";
import api from "../api/axios";

// Mock axios API with default resolved promises to prevent undefined calls throwing errors
vi.mock("../api/axios", () => {
  const defaultResolve = () => Promise.resolve({ data: { success: true, data: {} } });
  return {
    default: {
      post: vi.fn(defaultResolve),
      get: vi.fn(() => Promise.resolve({ data: { success: true, data: [] } })),
      patch: vi.fn(defaultResolve),
      put: vi.fn(defaultResolve),
      delete: vi.fn(defaultResolve),
    },
  };
});

// Mock react-router useParams
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useParams: () => ({ id: "blog-123" }),
    useNavigate: () => vi.fn(),
  };
});

// Mock Web Speech API
const mockSpeak = vi.fn();
const mockCancel = vi.fn();
const mockPause = vi.fn();
const mockResume = vi.fn();

beforeAll(() => {
  global.window.speechSynthesis = {
    speak: mockSpeak,
    cancel: mockCancel,
    pause: mockPause,
    resume: mockResume,
  };
  global.SpeechSynthesisUtterance = function (text) {
    this.text = text;
  };
});

describe("Blogs Functionality - Create and Details", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  describe("CreateBlogPage Component", () => {
    it("renders title input, content input, and buttons", () => {
      const { container } = render(
        <BrowserRouter>
          <CreateBlogPage />
        </BrowserRouter>
      );
      expect(screen.getByText("Blog Title")).toBeInTheDocument();
      expect(screen.getByText("Content")).toBeInTheDocument();
      expect(container.querySelector("input")).toBeInTheDocument();
      expect(container.querySelectorAll("textarea")[0]).toBeInTheDocument(); // Excerpt
      expect(container.querySelectorAll("textarea")[1]).toBeInTheDocument(); // Content
    });

    it("saves the draft in localStorage on title change", async () => {
      const { container } = render(
        <BrowserRouter>
          <CreateBlogPage />
        </BrowserRouter>
      );

      const titleInput = container.querySelector("input");
      fireEvent.change(titleInput, { target: { value: "My Great Draft" } });

      await waitFor(() => {
        const storedDraft = JSON.parse(localStorage.getItem("quillforge_draft"));
        expect(storedDraft.title).toBe("My Great Draft");
      });
    });
  });

  describe("BlogDetails Component", () => {
    const mockBlog = {
      _id: "blog-123",
      title: "Clean Coding Practices",
      content: "<p>Write simple code.</p>",
      author: { username: "coder1", email: "coder@test.com" },
      likes: [],
      views: 12,
    };

    it("fetches and renders the blog post details", async () => {
      // Mock specific API calls
      api.get.mockImplementation((url) => {
        if (url.includes("/blogs/blog-123")) {
          return Promise.resolve({ data: { success: true, data: mockBlog } });
        }
        if (url.includes("/users/current-user")) {
          return Promise.resolve({ data: { success: true, data: { username: "visitor" } } });
        }
        return Promise.resolve({ data: { success: true, data: [] } }); // fallback for related blogs
      });

      render(
        <BrowserRouter>
          <BlogDetails />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText("Clean Coding Practices")).toBeInTheDocument();
        expect(screen.getByText("Write simple code.")).toBeInTheDocument();
      });
    });

    it("triggers text-to-speech narration on speak button click", async () => {
      api.get.mockImplementation((url) => {
        if (url.includes("/blogs/blog-123")) {
          return Promise.resolve({ data: { success: true, data: mockBlog } });
        }
        if (url.includes("/users/current-user")) {
          return Promise.resolve({ data: { success: true, data: { username: "visitor" } } });
        }
        return Promise.resolve({ data: { success: true, data: [] } });
      });

      render(
        <BrowserRouter>
          <BlogDetails />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText("Clean Coding Practices")).toBeInTheDocument();
      });

      const speakBtn = screen.getByTitle(/listen/i) || screen.getByText(/narrator/i) || screen.getAllByRole("button")[2];
      fireEvent.click(speakBtn);

      await waitFor(() => {
        expect(mockSpeak).toHaveBeenCalled();
      });
    });
  });
});

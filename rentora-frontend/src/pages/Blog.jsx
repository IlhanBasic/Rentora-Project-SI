import React, { useState, useEffect } from "react";
import { Calendar, Clock, ChevronRight, Search } from "lucide-react";
import "./Blog.css";
import API_URL from "../API_URL.js";

const categories = [
  "Sve",
  "Istorija",
  "Saveti",
  "Gastronomija",
  "Priroda",
  "Putovanja",
];
const mapCategories = {
  0: "Sve",
  1: "Istorija",
  2: "Saveti",
  3: "Gastronomija",
  4: "Priroda",
  5: "Putovanja",
};

const Blog = () => {
  const [blogPosts, setBlogPosts] = useState([]);
  useEffect(() => {
    async function fetchBlogPosts() {
      try {
        const response = await fetch(`${API_URL}/Blogs`);
        const data = await response.json();
        setBlogPosts(data);
      } catch (error) {
        console.error("Error fetching blog posts:", error);
      }
    }

    fetchBlogPosts();
  }, []);
  const [selectedCategory, setSelectedCategory] = useState("Sve");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredPosts = blogPosts.filter((post) => {
    const matchesCategory =
      selectedCategory === "Sve" || mapCategories[post.category] === selectedCategory;
    const matchesSearch =
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const featuredPost = blogPosts[0];

  return (
    <div className="blog-container">
      <div className="blog-header">
        <h1>Blog</h1>
        <p>Otkrijte zanimljive priče, savete i destinacije</p>
      </div>

      {featuredPost && (
        <div
          className="featured-post"
          style={{ backgroundImage: `url(${featuredPost.imageUrl})` }}
        >
          <div className="featured-content">
            <span className="category-tag">{mapCategories[featuredPost.category]}</span>
            <h2>{featuredPost.title}</h2>
            <p>{featuredPost.excerpt}</p>
            <div className="post-meta">
              <span>
                <Calendar className="meta-icon" />{" "}
                {new Date(featuredPost.date).toLocaleDateString("sr-RS")}
              </span>
              <span>
                <Clock className="meta-icon" /> {featuredPost.readTime} min
              </span>
            </div>
            <button
              className="read-more"
              onClick={() => (window.location.href = featuredPost.link)}
            >
              Pročitajte više <ChevronRight className="arrow-icon" />
            </button>
          </div>
        </div>
      )}

      <div className="blog-controls">
        <div className="search-box">
          <Search className="search-icon" />
          <input
            type="text"
            placeholder="Pretražite blog..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="categories">
          {categories.map((category) => (
            <button
              key={category}
              className={`category-btn ${
                selectedCategory === category ? "active" : ""
              }`}
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      <div className="posts-grid">
        {filteredPosts.map((post) => (
          <article
            onClick={() => (window.location.href = post.link)}
            key={post.id}
            className="post-card"
          >
            <div
              className="post-image"
              style={{ backgroundImage: `url(${post.imageUrl})` }}
            >
              <span className="category-tag">{mapCategories[post.category]}</span>
            </div>
            <div className="post-content">
              <h3>{post.title}</h3>
              <p>{post.excerpt}</p>
              <div className="post-meta">
                <span>
                  <Calendar className="meta-icon" />{" "}
                  {new Intl.DateTimeFormat("sr-RS").format(new Date(post.date))}
                </span>
                <span>
                  <Clock className="meta-icon" /> {post.readTime}
                </span>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};

export default Blog;

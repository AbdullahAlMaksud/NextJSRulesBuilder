import { ImageResponse } from "next/og";

// Route segment config
export const runtime = "edge";

// Image metadata
export const alt = "RuleKit — Personlized rule maker for AI AGENTS";
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

// Image generation
export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          backgroundColor: "#07090e",
          backgroundImage:
            "radial-gradient(circle at 15% 15%, rgba(99, 102, 241, 0.16) 0%, transparent 55%), radial-gradient(circle at 85% 85%, rgba(6, 182, 212, 0.14) 0%, transparent 55%)",
          padding: "80px",
          position: "relative",
          boxSizing: "border-box",
        }}
      >
        {/* Decorative Grid Pattern */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            opacity: 0.03,
            backgroundImage:
              "radial-gradient(rgba(255, 255, 255, 0.15) 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />

        {/* Left Section: Branding & Info */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            maxWidth: "600px",
            zIndex: 10,
          }}
        >
          {/* Glowing Badge */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "6px 14px",
              borderRadius: "99px",
              backgroundColor: "rgba(99, 102, 241, 0.12)",
              borderWidth: "1px",
              borderStyle: "solid",
              borderColor: "rgba(99, 102, 241, 0.35)",
              marginBottom: "36px",
            }}
          >
            <div
              style={{
                width: "6px",
                height: "6px",
                borderRadius: "50%",
                backgroundColor: "#818cf8",
                boxShadow: "0 0 8px #818cf8",
              }}
            />
            <span
              style={{
                fontSize: "12px",
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.25em",
                color: "#a5b4fc",
              }}
            >
              AI Agent Rules Builder
            </span>
          </div>

          {/* Title */}
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              marginBottom: "16px",
            }}
          >
            <span
              style={{
                fontSize: "80px",
                fontWeight: 800,
                color: "#ffffff",
                letterSpacing: "-0.03em",
              }}
            >
              Rule
            </span>
            <span
              style={{
                fontSize: "80px",
                fontWeight: 800,
                color: "#818cf8",
                letterSpacing: "-0.03em",
              }}
            >
              Kit
            </span>
          </div>

          {/* Tagline */}
          <span
            style={{
              fontSize: "24px",
              lineHeight: 1.4,
              color: "#94a3b8",
              marginBottom: "48px",
              fontWeight: 400,
            }}
          >
            Personlized rule maker for AI AGENTS
          </span>

          {/* Target Formats / Badges */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "12px",
            }}
          >
            {[".cursorrules", "CLAUDE.md", "copilot-instructions.md", "PROJECT_RULES.md"].map((tag) => (
              <div
                key={tag}
                style={{
                  padding: "8px 16px",
                  borderRadius: "8px",
                  backgroundColor: "rgba(255, 255, 255, 0.03)",
                  borderWidth: "1px",
                  borderStyle: "solid",
                  borderColor: "rgba(255, 255, 255, 0.08)",
                  fontSize: "13px",
                  fontWeight: 500,
                  color: "#cbd5e1",
                  fontFamily: "monospace",
                }}
              >
                {tag}
              </div>
            ))}
          </div>
        </div>

        {/* Right Section: Logo Visualizer */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
            width: "360px",
            height: "360px",
            zIndex: 10,
          }}
        >
          {/* Glowing Aura behind logo */}
          <div
            style={{
              position: "absolute",
              width: "280px",
              height: "280px",
              borderRadius: "50%",
              backgroundImage:
                "radial-gradient(circle, rgba(99, 102, 241, 0.22) 0%, transparent 70%)",
              top: "40px",
              left: "40px",
            }}
          />
          <div
            style={{
              position: "absolute",
              width: "280px",
              height: "280px",
              borderRadius: "50%",
              backgroundImage:
                "radial-gradient(circle, rgba(6, 182, 212, 0.18) 0%, transparent 70%)",
              top: "40px",
              left: "40px",
            }}
          />

          {/* Logo SVG Wrapper with glassmorphic style */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "260px",
              height: "260px",
              borderRadius: "28px",
              borderWidth: "1px",
              borderStyle: "solid",
              borderColor: "rgba(255, 255, 255, 0.08)",
              backgroundColor: "rgba(255, 255, 255, 0.02)",
              boxShadow: "0 25px 50px rgba(0, 0, 0, 0.5)",
            }}
          >
            <svg
              width="150"
              height="150"
              viewBox="0 0 430.666 430.666"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Define gradients for the logo */}
              <defs>
                <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#818cf8" />
                  <stop offset="100%" stopColor="#22d3ee" />
                </linearGradient>
                <linearGradient id="accentGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#22d3ee" />
                  <stop offset="100%" stopColor="#818cf8" />
                </linearGradient>
              </defs>

              {/* Left bracket */}
              <path
                d="M5.4,208.433c-2.987,0-5.4,2.413-5.4,5.4c0,2.984,2.413,5.399,5.4,5.399c6.281,0,11.232,2.025,15.135,6.191 c11.401,12.176,9.867,37.731,9.84,38.359v68.85c0,17.345,4.817,30.718,14.304,39.73c11.388,10.82,25.763,11.58,29.586,11.58 c0.53,0,0.854-0.016,0.939-0.016c2.982-0.153,5.271-2.695,5.115-5.675c-0.156-2.989-2.742-5.3-5.677-5.115 c-0.14,0.059-12.877,0.564-22.528-8.605c-7.267-6.898-10.94-17.63-10.94-31.899l-0.01-68.486 c0.087-1.239,1.88-30.47-12.722-46.079c-1.508-1.614-3.138-3.027-4.865-4.234c1.727-1.208,3.356-2.621,4.865-4.235 c14.602-15.623,12.809-44.848,12.732-45.715v-68.85c0-14.209,3.649-24.907,10.853-31.812c9.542-9.146,22.454-8.717,22.644-8.693 c2.974,0.182,5.492-2.144,5.648-5.115c0.145-2.979-2.138-5.513-5.115-5.674c-0.744,0.01-17.55-0.757-30.515,11.567 c-9.497,9.018-14.304,22.386-14.304,39.727l0.01,69.211c0.485,7.116-0.345,27.82-9.833,37.971 C16.643,206.402,11.691,208.433,5.4,208.433z"
                fill="url(#logoGradient)"
              />

              {/* Right bracket */}
              <path
                d="M425.261,211.434c-6.286,0-11.232-2.025-15.135-6.188c-11.401-12.177-9.872-37.739-9.841-38.362v-68.85 c0-17.344-4.83-30.715-14.312-39.728c-12.957-12.316-29.811-11.572-30.507-11.567c-2.99,0.158-5.279,2.695-5.115,5.677 c0.158,2.979,2.689,5.271,5.68,5.113c0.142-0.048,12.877-0.562,22.527,8.608c7.277,6.896,10.933,17.629,10.933,31.896 l0.01,68.489c-0.089,1.236-1.882,30.462,12.726,46.076c1.508,1.619,3.132,3.027,4.872,4.224c-1.74,1.224-3.364,2.621-4.872,4.24 c-14.607,15.631-12.814,44.851-12.735,45.71v68.851c0,14.212-3.649,24.906-10.854,31.825c-9.55,9.128-22.485,8.686-22.633,8.686 c-2.874-0.158-5.495,2.141-5.653,5.109c-0.143,2.979,2.136,5.517,5.115,5.68c0.095,0,0.406,0.011,0.938,0.011 c3.808,0,18.183-0.76,29.589-11.581c9.503-9.018,14.297-22.391,14.297-39.729l-0.011-69.198 c-0.485-7.119,0.343-27.823,9.835-37.974c3.907-4.172,8.864-6.197,15.15-6.197c3.001,0,5.4-2.415,5.4-5.399 C430.66,213.859,428.245,211.434,425.261,211.434z"
                fill="url(#logoGradient)"
              />

              {/* Center dot */}
              <path
                d="M216,177.383c-20.11,0-36.45,16.351-36.45,36.45c0,20.103,16.345,36.45,36.45,36.45c20.103,0,36.45-16.348,36.45-36.45 C252.45,193.733,236.103,177.383,216,177.383z"
                fill="url(#accentGradient)"
              />

              {/* Hexagon outline */}
              <path
                d="M272.088,122.085c-0.97-1.674-2.752-2.7-4.672-2.7H164.587c-1.922,0-3.715,1.025-4.673,2.7l-51.413,89.047 c-0.965,1.682-0.965,3.723,0,5.4l51.413,89.047c0.968,1.677,2.75,2.7,4.673,2.7h102.829c1.92,0,3.713-1.023,4.672-2.7 l51.416-89.047c0.96-1.678,0.96-3.719,0-5.4L272.088,122.085z M216,261.083c-26.056,0-47.25-21.194-47.25-47.25 c0-26.057,21.194-47.25,47.25-47.25c26.051,0,47.25,21.193,47.25,47.25C263.25,239.889,242.062,261.083,216,261.083z"
                fill="url(#logoGradient)"
                fillRule="evenodd"
              />
            </svg>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}

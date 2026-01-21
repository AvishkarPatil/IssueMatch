"use client";

import { useEffect, useState } from "react";

interface Mentor {
  username: string;
  skills: string[];
}

export default function MentorsPage() {
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMentors = async () => {
      try {
        const response = await fetch(
          "http://127.0.0.1:8000/api/v1/mentor",
          {
            credentials: "include", // ✅ VERY IMPORTANT
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch mentors");
        }

        const data = await response.json();
        setMentors(data);
      } catch (error) {
        console.error("Error fetching mentors:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMentors();
  }, []);

  if (loading) {
    return <p className="text-center mt-10">Loading mentors...</p>;
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-center">
        Mentorship Page
      </h1>

      {mentors.length === 0 ? (
        <p className="text-center text-gray-500">
          No mentors available
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mentors.map((mentor) => (
            <div
              key={mentor.username}
              className="border rounded-xl p-4 shadow hover:shadow-lg transition"
            >
              <h2 className="text-xl font-semibold mb-2">
                {mentor.username}
              </h2>

              <p className="text-gray-700">
                <strong>Skills:</strong>{" "}
                {mentor.skills.join(", ")}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
